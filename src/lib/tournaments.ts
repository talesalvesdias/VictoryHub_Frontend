import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MOCK_TOURNAMENTS } from "@/lib/tournaments.mock";
import type { TournamentDTO } from "@/types";

export type TournamentQuery = { game?: string | null; live?: boolean };

// Lê torneios do banco; em caso de falha (DB indisponível) cai no mock,
// garantindo que a página /torneios sempre tenha dados para exibir.
export async function getTournaments(q: TournamentQuery = {}): Promise<TournamentDTO[]> {
  const where: Prisma.TournamentWhereInput = {};
  if (q.game && q.game !== "ALL") {
    where.game = q.game as Prisma.TournamentWhereInput["game"];
  }
  if (q.live) where.isLive = true;

  try {
    const rows = await prisma.tournament.findMany({
      where,
      orderBy: [{ isLive: "desc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return filterMock(q);
    return rows.map(toDTO);
  } catch {
    return filterMock(q);
  }
}

function filterMock(q: TournamentQuery): TournamentDTO[] {
  return MOCK_TOURNAMENTS.filter((t) => {
    if (q.game && q.game !== "ALL" && t.game !== q.game) return false;
    if (q.live && !t.isLive) return false;
    return true;
  });
}

function toDTO(t: {
  id: string;
  name: string;
  slug: string;
  game: string;
  status: string;
  description: string;
  prize: string;
  format: string;
  rankRequirement: string | null;
  rules: string;
  maxSlots: number;
  filledSlots: number;
  isLive: boolean;
}): TournamentDTO {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    game: t.game as TournamentDTO["game"],
    status: t.status as TournamentDTO["status"],
    description: t.description,
    prize: t.prize,
    format: t.format,
    rankRequirement: t.rankRequirement,
    rules: t.rules,
    maxSlots: t.maxSlots,
    filledSlots: t.filledSlots,
    isLive: t.isLive,
  };
}
