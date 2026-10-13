import "server-only";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { GAME_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { recommendTournaments } from "@/lib/recommendations";
import { getTournamentBySlug, getTournaments } from "@/lib/tournaments";
import type { TournamentDTO } from "@/types";

// Ferramentas do assistente. Todas são SOMENTE LEITURA: nenhuma inscreve,
// altera conta ou mexe em moedas. A identidade do usuário vem do contexto
// (sessão no servidor) e nunca de um argumento escolhido pelo modelo.

export type ChatToolContext = { userId: string | null };

const GAME = z.enum(["CS2", "VALORANT", "MARVEL_RIVALS", "COD"]);
const MAX_LIST = 10;

const STATUS_LABEL: Record<TournamentDTO["status"], string> = {
  LIVE: "Ao vivo",
  UPCOMING: "Em breve",
  FULL: "Esgotado",
  FINISHED: "Finalizado",
};

function summarize(t: TournamentDTO) {
  return {
    slug: t.slug,
    nome: t.name,
    jogo: GAME_LABELS[t.game] ?? t.game,
    situacao: t.isLive ? "Ao vivo" : STATUS_LABEL[t.status],
    aceitaInscricao: t.status !== "FULL" && t.status !== "FINISHED" && t.filledSlots < t.maxSlots,
    premiacao: t.prize,
    formato: t.format,
    rankExigido: t.rankRequirement ?? "Livre",
    vagas: `${t.filledSlots}/${t.maxSlots}`,
    link: "/torneios",
  };
}

export function createChatTools(ctx: ChatToolContext) {
  const listarTorneios = betaZodTool({
    name: "listar_torneios",
    description:
      "Lista os torneios da VictoryHub (até 10) com situação, premiação, formato, rank exigido e vagas. " +
      "Use para qualquer pergunta sobre quais torneios existem ou estão abertos.",
    inputSchema: z.object({
      jogo: GAME.optional().describe("Filtra por jogo. Omita para todos os jogos."),
      aoVivo: z.boolean().optional().describe("true para listar só torneios acontecendo agora."),
    }),
    run: async ({ jogo, aoVivo }) => {
      const list = await getTournaments({ game: jogo ?? null, live: aoVivo ?? false });
      return JSON.stringify({ total: list.length, torneios: list.slice(0, MAX_LIST).map(summarize) });
    },
  });

  const detalharTorneio = betaZodTool({
    name: "detalhar_torneio",
    description:
      "Mostra os detalhes de um torneio (descrição e regras completas). " +
      "Use o slug que veio de listar_torneios.",
    inputSchema: z.object({
      slug: z.string().min(1).max(120).describe("Slug do torneio, ex.: cs2-championship-open."),
    }),
    run: async ({ slug }) => {
      const t = await getTournamentBySlug(slug);
      if (!t) return JSON.stringify({ encontrado: false });
      return JSON.stringify({
        encontrado: true,
        ...summarize(t),
        descricao: t.description,
        regras: t.rules,
      });
    },
  });

  const recomendarTorneios = betaZodTool({
    name: "recomendar_torneios",
    description:
      "Ordena os torneios abertos pela compatibilidade com o perfil do jogador e explica os motivos. " +
      "Precisa de rank, jogos preferidos e disponibilidade.",
    inputSchema: z.object({
      rank: z
        .enum(["Unranked", "Gold", "Platina", "Diamante"])
        .describe("Rank do jogador. Use Unranked para quem ainda não tem rank ou está abaixo de Gold."),
      jogosFavoritos: z.array(GAME).min(1).max(4).describe("Jogos que o jogador prefere."),
      disponibilidade: z
        .enum(["weeknight", "weekend"])
        .describe("weeknight = joga em noites de semana (prioriza torneios ao vivo); weekend = fim de semana (prioriza próximos)."),
    }),
    run: async ({ rank, jogosFavoritos, disponibilidade }) => {
      const tournaments = await getTournaments();
      const ranked = recommendTournaments(tournaments, {
        rank,
        favoriteGames: jogosFavoritos,
        availability: disponibilidade,
      });
      return JSON.stringify({
        recomendacoes: ranked.slice(0, 3).map((r) => ({
          ...summarize(r),
          compatibilidade: r.score,
          motivos: fixInviteReasons(r),
        })),
      });
    },
  });

  const meuPerfil = betaZodTool({
    name: "meu_perfil",
    description:
      "Lê o perfil do usuário logado: nome, rank, moedas, se a Steam está vinculada e as inscrições. " +
      "Não recebe argumentos; se ninguém estiver logado, informa isso.",
    inputSchema: z.object({}),
    run: async () => {
      if (!ctx.userId) return JSON.stringify({ logado: false });
      const user = await getCurrentUser();
      if (!user || user.id !== ctx.userId) return JSON.stringify({ logado: false });

      return JSON.stringify({
        logado: true,
        nome: user.name,
        rank: user.rank,
        moedas: user.coins,
        steamVinculada: Boolean(user.steamAccount) || ("steamLinked" in user && user.steamLinked),
        inscricoes: await getRegistrations(user.id),
      });
    },
  });

  // Inputs pequenos, mas o stream é o padrão: o runner valida cada input
  // contra o schema Zod antes de chamar run().
  return [listarTorneios, detalharTorneio, recomendarTorneios, meuPerfil].map((tool) => ({
    ...tool,
    eager_input_streaming: true,
  }));
}

// recommendTournaments só entende requisito de rank (Gold+/Platina+) e trata
// "Convite" como aberto a todos. Para o chat não afirmar isso, troca o motivo.
export function fixInviteReasons(r: TournamentDTO & { reasons: string[] }): string[] {
  if (r.rankRequirement !== "Convite") return r.reasons;
  return r.reasons.map((reason) =>
    reason === "inscrição aberta a todos os ranks" ? "torneio só para convidados" : reason,
  );
}

async function getRegistrations(userId: string) {
  try {
    const rows = await prisma.tournamentRegistration.findMany({
      where: { userId },
      select: { status: true, tournament: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: MAX_LIST,
    });
    return rows.map((r) => ({ torneio: r.tournament.name, slug: r.tournament.slug, status: r.status }));
  } catch {
    // Sem banco (modo demonstração): sem inscrições persistidas.
    return [];
  }
}
