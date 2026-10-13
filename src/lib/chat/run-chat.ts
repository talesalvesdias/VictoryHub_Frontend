import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { BetaMessageParam, BetaToolRunnerParams } from "@anthropic-ai/sdk/resources/beta/messages";
import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import {
  CHAT_MESSAGES,
  TOOL_LABELS,
  type ChatStreamEvent,
  type ChatTurn,
} from "@/lib/chat/protocol";

export const CHAT_MODEL = "claude-opus-5-5";
// Requisições ao modelo por mensagem: a resposta + até 3 rodadas de tools.
const MAX_ITERATIONS = 4;

export type ChatRunSummary = {
  model: string;
  stopReason: string | null;
  iterations: number;
  tools: string[];
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

type RunChatOptions = {
  client: Anthropic;
  history: ChatTurn[];
  tools: BetaToolRunnerParams["tools"];
  signal: AbortSignal;
  send: (event: ChatStreamEvent) => void;
};

// Roda o loop de tools com streaming e traduz os eventos da API para o
// contrato do widget (protocol.ts). Devolve só metadados, para log.
export async function runChat({
  client,
  history,
  tools,
  signal,
  send,
}: RunChatOptions): Promise<ChatRunSummary> {
  const summary: ChatRunSummary = {
    model: CHAT_MODEL,
    stopReason: null,
    iterations: 0,
    tools: [],
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };

  const messages: BetaMessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  const runner = client.beta.messages.toolRunner(
    {
      model: CHAT_MODEL,
      max_tokens: 8000, // teto de custo; a resposta é curta por instrução do prompt
      // Thinking omitido: no Opus 5.5 ele é sempre adaptativo. Effort baixo
      // basta para chat e consulta de dados (o padrão do modelo é "medium").
      output_config: { effort: "low" },
      // Recusa do modelo é reencaminhada no servidor para outro modelo.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // Auto-cache (tools + system + histórico) e breakpoint fixo no system.
      cache_control: { type: "ephemeral" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools,
      messages,
      max_iterations: MAX_ITERATIONS,
      stream: true,
    },
    { signal },
  );

  for await (const messageStream of runner) {
    summary.iterations += 1;
    for await (const event of messageStream) {
      if (event.type === "content_block_start" && event.content_block.type === "tool_use") {
        const name = event.content_block.name;
        summary.tools.push(name);
        send({ type: "tool", name, label: TOOL_LABELS[name] ?? "Consultando…" });
      } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        send({ type: "delta", text: event.delta.text });
      }
    }

    const message = await messageStream.finalMessage();
    summary.model = message.model;
    summary.stopReason = message.stop_reason;
    summary.inputTokens += message.usage.input_tokens;
    summary.outputTokens += message.usage.output_tokens;
    summary.cacheReadTokens += message.usage.cache_read_input_tokens ?? 0;
    summary.cacheWriteTokens += message.usage.cache_creation_input_tokens ?? 0;

    // O runner não aplica estas regras: parar antes de ele executar as tools
    // de um turno recusado ou truncado.
    if (message.stop_reason === "refusal") {
      send({ type: "error", code: "refusal", message: CHAT_MESSAGES.refusal });
      return summary;
    }
    const hasToolUse = message.content.some((b) => b.type === "tool_use");
    if (message.stop_reason === "max_tokens" && hasToolUse) {
      send({ type: "error", code: "failed", message: CHAT_MESSAGES.failed });
      return summary;
    }
  }

  send({ type: "done", stopReason: summary.stopReason });
  return summary;
}
