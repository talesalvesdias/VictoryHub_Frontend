import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAnthropic, isChatConfigured } from "@/lib/chat/anthropic";
import { chatRequestSchema, getClientIp, trimHistory } from "@/lib/chat/guardrails";
import {
  CHAT_LIMITS,
  CHAT_MESSAGES,
  encodeEvent,
  type ChatErrorCode,
  type ChatStreamEvent,
} from "@/lib/chat/protocol";
import { consumeChatQuota } from "@/lib/chat/rate-limit";
import { runChat, type ChatRunSummary } from "@/lib/chat/run-chat";
import { createChatTools } from "@/lib/chat/tools";

export const runtime = "nodejs"; // Prisma não roda no edge
export const maxDuration = 60;

// POST /api/chat — responde em stream SSE (contrato em src/lib/chat/protocol.ts).
// Erros anteriores ao stream voltam como JSON { code, error } com o status HTTP.
export async function POST(request: Request) {
  if (!isChatConfigured()) return errorResponse("unavailable", 503);

  const raw = await request.text();
  if (raw.length > CHAT_LIMITS.maxBodyBytes) return errorResponse("invalid", 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return errorResponse("invalid", 400);
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("invalid", 400);

  const history = trimHistory(parsed.data.messages);
  if (history.length === 0) return errorResponse("invalid", 400);

  // Sessão opcional: o chat é aberto a visitantes; logado ganha personalização.
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  const quota = await consumeChatQuota({ userId, ip: getClientIp(request.headers) });
  if (!quota.ok) {
    return errorResponse("rate_limited", 429, { "Retry-After": String(quota.retryAfterSeconds) });
  }

  // Fechar o chat ou a aba cancela a chamada ao modelo (para de gastar tokens).
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort());

  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        if (abort.signal.aborted) return;
        controller.enqueue(encoder.encode(encodeEvent(event)));
      };

      let summary: ChatRunSummary | null = null;
      let failure: string | null = null;
      try {
        summary = await runChat({
          client: getAnthropic(),
          history,
          tools: createChatTools({ userId }),
          signal: abort.signal,
          send,
        });
      } catch (err) {
        if (!abort.signal.aborted) {
          failure = describeError(err);
          const code: ChatErrorCode = isServiceUnavailable(err) ? "unavailable" : "failed";
          send({ type: "error", code, message: CHAT_MESSAGES[code] });
        }
      } finally {
        logRun({ summary, failure, aborted: abort.signal.aborted, ms: Date.now() - startedAt, loggedIn: Boolean(userId) });
        try {
          controller.close();
        } catch {
          // Stream já cancelado pelo cliente.
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function errorResponse(code: ChatErrorCode, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ code, error: CHAT_MESSAGES[code] }, { status, headers });
}

// Falhas do lado da Anthropic (limite, sobrecarga, chave inválida) viram
// "indisponível" para o usuário; o resto vira "falhou, tente de novo".
function isServiceUnavailable(err: unknown): boolean {
  return (
    err instanceof Anthropic.RateLimitError ||
    err instanceof Anthropic.AuthenticationError ||
    err instanceof Anthropic.PermissionDeniedError ||
    err instanceof Anthropic.InternalServerError ||
    err instanceof Anthropic.APIConnectionError
  );
}

function describeError(err: unknown): string {
  if (err instanceof Anthropic.APIError) return `${err.constructor.name} ${err.status ?? ""}`.trim();
  return err instanceof Error ? err.name : "unknown";
}

// Só metadados (LGPD): nunca o conteúdo das mensagens.
function logRun(entry: {
  summary: ChatRunSummary | null;
  failure: string | null;
  aborted: boolean;
  ms: number;
  loggedIn: boolean;
}) {
  console.info("[chat]", JSON.stringify(entry));
}
