import type { TournamentDTO } from "@/types";

// Dados-semente dos torneios. Usado pelo seed do Prisma e como fallback
// offline quando o banco não está disponível.
export const MOCK_TOURNAMENTS: TournamentDTO[] = [
  {
    id: "cs2-championship-open",
    name: "CS2 Championship Open",
    slug: "cs2-championship-open",
    game: "CS2",
    status: "LIVE",
    description:
      "O maior open de Counter-Strike 2 do Brasil. Formato suíço seguido de playoffs eliminatórios.",
    prize: "R$5.000",
    format: "Suíço + Eliminatória",
    rankRequirement: "Gold+",
    rules: "5v5 · MR12 · Anti-cheat obrigatório · Check-in 30min antes.",
    maxSlots: 128,
    filledSlots: 96,
    isLive: true,
  },
  {
    id: "valorant-pro-series",
    name: "Valorant Pro Series",
    slug: "valorant-pro-series",
    game: "VALORANT",
    status: "FULL",
    description:
      "Série competitiva de Valorant para times semi-profissionais. Vagas esgotadas.",
    prize: "R$3.500",
    format: "Eliminatória dupla",
    rankRequirement: "Platina+",
    rules: "5v5 · Bo3 nas finais · Override de agentes liberado.",
    maxSlots: 64,
    filledSlots: 64,
    isLive: true,
  },
  {
    id: "marvel-rivals-cup",
    name: "Marvel Rivals Cup",
    slug: "marvel-rivals-cup",
    game: "MARVEL_RIVALS",
    status: "UPCOMING",
    description:
      "A primeira copa nacional de Marvel Rivals. Inscrições abertas para todos os ranks.",
    prize: "R$2.000",
    format: "Round robin + finais",
    rankRequirement: null,
    rules: "6v6 · Bo1 na fase de grupos · Bo3 nas finais.",
    maxSlots: 32,
    filledSlots: 18,
    isLive: false,
  },
  {
    id: "cod-warzone-invite",
    name: "CoD Warzone Invite",
    slug: "cod-warzone-invite",
    game: "COD",
    status: "UPCOMING",
    description:
      "Invitational de Call of Duty: Warzone. Trios disputam pontos por kills e colocação.",
    prize: "R$4.000",
    format: "Pontos (kills + colocação)",
    rankRequirement: "Convite",
    rules: "Trios · 6 partidas · Pontuação acumulada.",
    maxSlots: 45,
    filledSlots: 12,
    isLive: false,
  },
];
