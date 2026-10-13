import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const RATE_LIMITS = {
  anonymousPerHour: 20,
  userPerHour: 60,
  globalPerDay: Number(process.env.CHAT_DAILY_LIMIT) || 1000,
} as const;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; scope: "client" | "global"; retryAfterSeconds: number };

type Identity = { userId?: string | null; ip: string };

// Contadores por janela fixa (hora para o cliente, dia para o teto global).
// Guarda no Postgres (tabela ChatUsage) para valer entre instâncias da Vercel;
// sem banco, cai para memória — best-effort, por instância — como o resto da
// app faz com o mock de torneios.
export async function consumeChatQuota(
  identity: Identity,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  const client = identity.userId
    ? { key: `user:${identity.userId}`, limit: RATE_LIMITS.userPerHour }
    : { key: `ip:${hashIp(identity.ip)}`, limit: RATE_LIMITS.anonymousPerHour };

  const hourStart = windowStart(now, HOUR);
  if ((await increment(client.key, hourStart)) > client.limit) {
    return { ok: false, scope: "client", retryAfterSeconds: secondsUntil(hourStart, HOUR, now) };
  }

  const dayStart = windowStart(now, DAY);
  if ((await increment("global", dayStart)) > RATE_LIMITS.globalPerDay) {
    return { ok: false, scope: "global", retryAfterSeconds: secondsUntil(dayStart, DAY, now) };
  }

  return { ok: true };
}

// Não guarda o IP em claro (LGPD): só um hash com o segredo da app.
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "victoryhub"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

function windowStart(now: Date, size: number): Date {
  return new Date(Math.floor(now.getTime() / size) * size);
}

function secondsUntil(start: Date, size: number, now: Date): number {
  return Math.max(1, Math.ceil((start.getTime() + size - now.getTime()) / 1000));
}

// Depois de uma falha do banco, usa memória por um minuto antes de tentar de
// novo — evita pagar o timeout de conexão em toda mensagem.
let dbRetryAt = 0;
const memory = new Map<string, number>();

async function increment(key: string, start: Date): Promise<number> {
  if (process.env.DATABASE_URL && Date.now() >= dbRetryAt) {
    try {
      const row = await prisma.chatUsage.upsert({
        where: { key_windowStart: { key, windowStart: start } },
        create: { key, windowStart: start, count: 1 },
        update: { count: { increment: 1 } },
        select: { count: true },
      });
      if (Math.random() < 0.01) void pruneOldWindows();
      return row.count;
    } catch {
      dbRetryAt = Date.now() + 60_000;
    }
  }
  return incrementInMemory(key, start);
}

function incrementInMemory(key: string, start: Date): number {
  const id = `${key}|${start.getTime()}`;
  const count = (memory.get(id) ?? 0) + 1;
  memory.set(id, count);
  if (memory.size > 5000) {
    const cutoff = Date.now() - 2 * DAY;
    for (const k of memory.keys()) {
      if (Number(k.split("|")[1]) < cutoff) memory.delete(k);
    }
  }
  return count;
}

async function pruneOldWindows() {
  try {
    await prisma.chatUsage.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - 2 * DAY) } },
    });
  } catch {
    // Limpeza oportunista: falhar aqui não afeta a requisição.
  }
}

/** Só para testes. */
export function resetMemoryQuota() {
  memory.clear();
  dbRetryAt = 0;
}
