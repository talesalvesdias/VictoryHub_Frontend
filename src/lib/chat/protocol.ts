// Contrato entre o widget do chat e POST /api/chat (compartilhado server/client).
// O corpo da resposta é um stream SSE: cada evento é uma linha `data: <json>`
// seguida de linha em branco.

export const CHAT_LIMITS = {
  /** Caracteres por mensagem do usuário. */
  maxUserChars: 1000,
  /** Caracteres por resposta do assistente reenviada no histórico. */
  maxAssistantChars: 4000,
  /** Mensagens (user + assistant) mantidas no histórico enviado ao modelo. */
  maxHistoryMessages: 24,
  /** Teto de mensagens aceitas no body antes de recusar com 400. */
  maxRequestMessages: 40,
  /** Tamanho máximo do body da requisição, em bytes. */
  maxBodyBytes: 32_000,
} as const;

export type ChatRole = "user" | "assistant";
export type ChatTurn = { role: ChatRole; content: string };
export type ChatRequest = { messages: ChatTurn[] };

export type ChatErrorCode =
  | "unavailable"
  | "rate_limited"
  | "invalid"
  | "refusal"
  | "failed";

export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "tool"; name: string; label: string }
  | { type: "done"; stopReason: string | null }
  | { type: "error"; code: ChatErrorCode; message: string };

// Rótulos exibidos na UI enquanto uma tool roda.
export const TOOL_LABELS: Record<string, string> = {
  listar_torneios: "Consultando torneios…",
  detalhar_torneio: "Abrindo detalhes do torneio…",
  recomendar_torneios: "Calculando recomendações…",
  meu_perfil: "Lendo seu perfil…",
};

// Mensagens padrão (mesmo texto no server e no client). O widget renderiza
// como markdown, então os links internos ficam clicáveis.
export const CHAT_MESSAGES = {
  unavailable:
    "O assistente está indisponível no momento. Se precisar de ajuda, fale com a equipe pelo [Contato](/contato).",
  rate_limited:
    "Você atingiu o limite de mensagens por agora. Tente de novo mais tarde ou use o [Contato](/contato).",
  invalid: "Não consegui ler a sua mensagem. Tente reformular em até 1.000 caracteres.",
  refusal:
    "Não posso ajudar com esse pedido. Posso tirar dúvidas sobre torneios, cadastro, Steam e regras da VictoryHub.",
  failed: "Algo deu errado ao gerar a resposta. Tente novamente em instantes.",
} satisfies Record<ChatErrorCode, string>;

export function encodeEvent(event: ChatStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// Separa os eventos completos do buffer; devolve o resto incompleto para
// ser concatenado com o próximo chunk.
export function parseEvents(buffer: string): { events: ChatStreamEvent[]; rest: string } {
  const events: ChatStreamEvent[] = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  for (const part of parts) {
    for (const line of part.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      try {
        events.push(JSON.parse(line.slice(6)) as ChatStreamEvent);
      } catch {
        // Linha corrompida: ignora em vez de derrubar o stream inteiro.
      }
    }
  }
  return { events, rest };
}
