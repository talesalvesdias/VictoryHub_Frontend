import type { GameType, TournamentDTO } from "@/types";

export type DemoPlayerProfile = {
  rank: "Unranked" | "Gold" | "Platina" | "Diamante";
  favoriteGames: GameType[];
  availability: "weeknight" | "weekend";
};

export type TournamentRecommendation = TournamentDTO & {
  score: number;
  reasons: string[];
};

// "Unranked" cobre contas novas e ranks abaixo de Gold.
const rankOrder = { Unranked: 0, Gold: 1, Platina: 2, Diamante: 3 } as const;

function minimumRank(requirement: string | null) {
  if (!requirement) return null;
  if (requirement.startsWith("Gold")) return "Gold";
  if (requirement.startsWith("Platina")) return "Platina";
  return null;
}

/**
 * Recomendação por conteúdo: compara as preferências declaradas pelo jogador
 * com atributos transparentes dos torneios. Não usa dados pessoais reais.
 */
export function recommendTournaments(
  tournaments: TournamentDTO[],
  profile: DemoPlayerProfile,
): TournamentRecommendation[] {
  return tournaments
    .filter((tournament) => tournament.status !== "FINISHED")
    .map((tournament) => {
      let score = 25;
      const reasons: string[] = [];

      if (profile.favoriteGames.includes(tournament.game)) {
        score += 45;
        reasons.push("jogo entre suas preferências");
      }

      const required = minimumRank(tournament.rankRequirement);
      if (!required || rankOrder[profile.rank] >= rankOrder[required]) {
        score += 20;
        reasons.push(required ? "rank compatível" : "inscrição aberta a todos os ranks");
      } else {
        score -= 15;
        reasons.push("rank ainda abaixo do requisito");
      }

      if (profile.availability === "weekend" && tournament.status === "UPCOMING") {
        score += 10;
        reasons.push("evento futuro para planejamento");
      }
      if (profile.availability === "weeknight" && tournament.isLive) {
        score += 10;
        reasons.push("torneio disponível agora");
      }

      return {
        ...tournament,
        score: Math.max(0, Math.min(100, score)),
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);
}
