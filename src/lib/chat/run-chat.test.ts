import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { CHAT_MESSAGES, type ChatStreamEvent } from "@/lib/chat/protocol";
import { CHAT_MODEL, runChat } from "@/lib/chat/run-chat";

type FakeTurn = { events: unknown[]; message: Record<string, unknown> };

function message(stopReason: string, content: unknown[] = []) {
  return {
    model: CHAT_MODEL,
    stop_reason: stopReason,
    content,
    usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 3000, cache_creation_input_tokens: 0 },
  };
}

// Imita client.beta.messages.toolRunner({ stream: true }): um iterável de
// streams, cada um com seus eventos e finalMessage().
function fakeClient(turns: FakeTurn[]) {
  const toolRunner = vi.fn(() => ({
    async *[Symbol.asyncIterator]() {
      for (const turn of turns) {
        yield {
          async *[Symbol.asyncIterator]() {
            yield* turn.events;
          },
          finalMessage: async () => turn.message,
        };
      }
    },
  }));
  return { client: { beta: { messages: { toolRunner } } } as unknown as Anthropic, toolRunner };
}

const textDelta = (text: string) => ({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text } });

async function collect(turns: FakeTurn[]) {
  const { client, toolRunner } = fakeClient(turns);
  const events: ChatStreamEvent[] = [];
  const summary = await runChat({
    client,
    history: [{ role: "user", content: "Quais torneios de CS2?" }],
    tools: [],
    signal: new AbortController().signal,
    send: (e) => events.push(e),
  });
  return { events, summary, toolRunner };
}

describe("runChat", () => {
  it("traduz tool + texto para o protocolo e soma o uso", async () => {
    const { events, summary, toolRunner } = await collect([
      {
        events: [{ type: "content_block_start", index: 0, content_block: { type: "tool_use", id: "t1", name: "listar_torneios", input: {} } }],
        message: message("tool_use", [{ type: "tool_use", id: "t1", name: "listar_torneios", input: {} }]),
      },
      { events: [textDelta("O CS2 "), textDelta("Open está ao vivo.")], message: message("end_turn") },
    ]);

    expect(events).toEqual([
      { type: "tool", name: "listar_torneios", label: "Consultando torneios…" },
      { type: "delta", text: "O CS2 " },
      { type: "delta", text: "Open está ao vivo." },
      { type: "done", stopReason: "end_turn" },
    ]);
    expect(summary).toMatchObject({ iterations: 2, tools: ["listar_torneios"], inputTokens: 200, cacheReadTokens: 6000 });

    const [params] = toolRunner.mock.calls[0] as unknown as [Record<string, unknown>];
    expect(params).toMatchObject({
      model: "claude-opus-5-5",
      stream: true,
      fallbacks: "default",
      betas: ["server-side-fallback-2026-07-01"],
      output_config: { effort: "low" },
      cache_control: { type: "ephemeral" },
      messages: [{ role: "user", content: "Quais torneios de CS2?" }],
    });
    expect(params).not.toHaveProperty("thinking");
  });

  it("para na recusa sem rodar mais nada", async () => {
    const { events } = await collect([
      { events: [], message: message("refusal") },
      { events: [textDelta("não deveria aparecer")], message: message("end_turn") },
    ]);
    expect(events).toEqual([{ type: "error", code: "refusal", message: CHAT_MESSAGES.refusal }]);
  });

  it("não executa tool com input truncado por max_tokens", async () => {
    const { events, summary } = await collect([
      { events: [], message: message("max_tokens", [{ type: "tool_use", id: "t1", name: "listar_torneios", input: {} }]) },
      { events: [textDelta("não deveria aparecer")], message: message("end_turn") },
    ]);
    expect(events).toEqual([{ type: "error", code: "failed", message: CHAT_MESSAGES.failed }]);
    expect(summary.iterations).toBe(1);
  });
});
