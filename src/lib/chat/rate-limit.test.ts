import { beforeEach, describe, expect, it, vi } from "vitest";

const upsert = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { chatUsage: { upsert: (...args: unknown[]) => upsert(...args), deleteMany: vi.fn() } },
}));

const { consumeChatQuota, hashIp, RATE_LIMITS, resetMemoryQuota } = await import("@/lib/chat/rate-limit");

const NOW = new Date("2026-10-13T15:30:00Z");

describe("consumeChatQuota sem banco (fallback em memória)", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://test/db");
    resetMemoryQuota();
    upsert.mockReset();
    upsert.mockRejectedValue(new Error("db down"));
  });

  it("bloqueia o anônimo depois do limite por hora, por IP", async () => {
    for (let i = 0; i < RATE_LIMITS.anonymousPerHour; i++) {
      expect(await consumeChatQuota({ ip: "203.0.113.7" }, NOW)).toEqual({ ok: true });
    }
    const blocked = await consumeChatQuota({ ip: "203.0.113.7" }, NOW);
    expect(blocked).toEqual({ ok: false, scope: "client", retryAfterSeconds: 30 * 60 });
    expect(await consumeChatQuota({ ip: "198.51.100.2" }, NOW)).toEqual({ ok: true });
  });

  it("dá limite maior para usuário logado", async () => {
    for (let i = 0; i < RATE_LIMITS.userPerHour; i++) {
      expect((await consumeChatQuota({ userId: "u1", ip: "x" }, NOW)).ok).toBe(true);
    }
    expect((await consumeChatQuota({ userId: "u1", ip: "x" }, NOW)).ok).toBe(false);
  });

  it("aplica o teto diário global", async () => {
    for (let i = 0; i < RATE_LIMITS.globalPerDay; i++) {
      await consumeChatQuota({ ip: `10.0.${Math.floor(i / 250)}.${i % 250}` }, NOW);
    }
    expect(await consumeChatQuota({ ip: "192.0.2.1" }, NOW)).toMatchObject({ ok: false, scope: "global" });
  });

  it("não tenta o banco de novo logo depois de uma falha", async () => {
    await consumeChatQuota({ ip: "a" }, NOW);
    await consumeChatQuota({ ip: "a" }, NOW);
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("nem tenta o banco quando DATABASE_URL não existe", async () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(await consumeChatQuota({ ip: "a" }, NOW)).toEqual({ ok: true });
    expect(upsert).not.toHaveBeenCalled();
  });
});

describe("consumeChatQuota com banco", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://test/db");
    resetMemoryQuota();
    upsert.mockReset();
  });

  it("usa o contador do banco e não grava o IP em claro", async () => {
    upsert.mockResolvedValue({ count: RATE_LIMITS.anonymousPerHour + 1 });
    const result = await consumeChatQuota({ ip: "203.0.113.7" }, NOW);
    expect(result).toMatchObject({ ok: false, scope: "client" });

    const args = upsert.mock.calls[0][0];
    expect(args.where.key_windowStart.key).toBe(`ip:${hashIp("203.0.113.7")}`);
    expect(JSON.stringify(args)).not.toContain("203.0.113.7");
    expect(args.where.key_windowStart.windowStart).toEqual(new Date("2026-10-13T15:00:00Z"));
  });
});
