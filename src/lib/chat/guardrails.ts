import { z } from "zod";
import { CHAT_LIMITS, type ChatTurn } from "@/lib/chat/protocol";

const turnSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("user"),
    content: z.string().trim().min(1).max(CHAT_LIMITS.maxUserChars),
  }),
  z.object({
    role: z.literal("assistant"),
    content: z.string().max(CHAT_LIMITS.maxAssistantChars),
  }),
]);

// Body de POST /api/chat. O histórico vem do cliente e é tratado como não
// confiável: só serve de contexto; identidade e dados vêm do servidor.
export const chatRequestSchema = z
  .object({
    messages: z.array(turnSchema).min(1).max(CHAT_LIMITS.maxRequestMessages),
  })
  .refine((body) => body.messages.at(-1)?.role === "user", {
    message: "A última mensagem precisa ser do usuário.",
  });

// Mantém só as últimas mensagens, descarta respostas vazias (ex.: stream
// interrompido) e garante que o histórico comece por uma mensagem do usuário.
export function trimHistory(
  messages: ChatTurn[],
  max: number = CHAT_LIMITS.maxHistoryMessages,
): ChatTurn[] {
  const cleaned = messages.filter((m) => m.content.trim().length > 0);
  const recent = cleaned.slice(-max);
  const firstUser = recent.findIndex((m) => m.role === "user");
  return firstUser === -1 ? [] : recent.slice(firstUser);
}

// IP do cliente atrás do proxy da Vercel (primeiro valor de x-forwarded-for).
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
