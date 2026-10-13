import { beforeEach, describe, expect, it, vi } from "vitest";

// Banco indisponível: a camada de torneios cai no mock, como no modo demo.
vi.mock("@/lib/prisma", () => {
  const down = () => Promise.reject(new Error("db down"));
  return {
    prisma: {
      tournament: { findMany: down, findUnique: down, count: down },
      tournamentRegistration: { findMany: down },
    },
  };
});

const getCurrentUser = vi.fn();
vi.mock("@/lib/auth-helpers", () => ({ getCurrentUser: () => getCurrentUser() }));

const { createChatTools } = await import("@/lib/chat/tools");

type AnyTool = ReturnType<typeof createChatTools>[number];

type LooseTool = { parse: (input: unknown) => unknown; run: (args: unknown) => Promise<unknown> | unknown };

async function call(tools: AnyTool[], name: string, input: unknown = {}) {
  const tool = tools.find((t) => t.name === name) as LooseTool | undefined;
  if (!tool) throw new Error(`tool ${name} não existe`);
  return JSON.parse((await tool.run(tool.parse(input))) as string);
}

describe("tools do chat", () => {
  beforeEach(() => getCurrentUser.mockReset());

  it("expõe só tools de leitura, com streaming de input", () => {
    const tools = createChatTools({ userId: null });
    expect(tools.map((t) => t.name)).toEqual(["listar_torneios", "detalhar_torneio", "recomendar_torneios", "meu_perfil"]);
    expect(tools.every((t) => "eager_input_streaming" in t && t.eager_input_streaming)).toBe(true);
    const perfil = tools.find((t) => t.name === "meu_perfil")!;
    expect("input_schema" in perfil && perfil.input_schema.properties).toEqual({});
  });

  it("lista e filtra torneios", async () => {
    const tools = createChatTools({ userId: null });
    expect((await call(tools, "listar_torneios")).total).toBe(4);
    const cs2 = await call(tools, "listar_torneios", { jogo: "CS2" });
    expect(cs2.torneios).toEqual([
      expect.objectContaining({ slug: "cs2-championship-open", situacao: "Ao vivo", vagas: "96/128", aceitaInscricao: true }),
    ]);
    const live = await call(tools, "listar_torneios", { aoVivo: true });
    expect(live.torneios.map((t: { slug: string }) => t.slug)).toEqual(["cs2-championship-open", "valorant-pro-series"]);
  });

  it("detalha torneio pelo slug", async () => {
    const tools = createChatTools({ userId: null });
    const found = await call(tools, "detalhar_torneio", { slug: "valorant-pro-series" });
    expect(found).toMatchObject({ encontrado: true, aceitaInscricao: false, rankExigido: "Platina+" });
    expect(found.regras).toContain("Bo3");
    expect(await call(tools, "detalhar_torneio", { slug: "nao-existe" })).toEqual({ encontrado: false });
  });

  it("recomenda torneios e não diz que torneio de convite é aberto", async () => {
    const tools = createChatTools({ userId: null });
    const { recomendacoes } = await call(tools, "recomendar_torneios", {
      rank: "Unranked",
      jogosFavoritos: ["COD"],
      disponibilidade: "weekend",
    });
    expect(recomendacoes[0].slug).toBe("cod-warzone-invite");
    expect(recomendacoes[0].motivos).toContain("torneio só para convidados");
    expect(recomendacoes[0].motivos).not.toContain("inscrição aberta a todos os ranks");
  });

  it("recusa input fora do schema", () => {
    const tool = createChatTools({ userId: null }).find((t) => t.name === "recomendar_torneios")!;
    expect(() => tool.parse({ rank: "Bronze", jogosFavoritos: ["CS2"], disponibilidade: "weekend" })).toThrow();
  });

  it("meu_perfil sem sessão não consulta usuário", async () => {
    expect(await call(createChatTools({ userId: null }), "meu_perfil")).toEqual({ logado: false });
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("meu_perfil devolve só o necessário do usuário da sessão", async () => {
    getCurrentUser.mockResolvedValue({
      id: "u1",
      name: "Jogador",
      email: "jogador@example.com",
      passwordHash: "hash",
      rank: "Gold",
      coins: 1240,
      steamAccount: null,
    });
    const perfil = await call(createChatTools({ userId: "u1" }), "meu_perfil");
    expect(perfil).toEqual({ logado: true, nome: "Jogador", rank: "Gold", moedas: 1240, steamVinculada: false, inscricoes: [] });
  });

  it("meu_perfil ignora usuário que não bate com a sessão", async () => {
    getCurrentUser.mockResolvedValue({ id: "outro", name: "X", rank: "Gold", coins: 0, steamAccount: null });
    expect(await call(createChatTools({ userId: "u1" }), "meu_perfil")).toEqual({ logado: false });
  });
});
