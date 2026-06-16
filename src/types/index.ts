// DTOs compartilhados entre server e client.

export type GameType = "CS2" | "VALORANT" | "MARVEL_RIVALS" | "COD";
export type TournamentStatus = "UPCOMING" | "LIVE" | "FULL" | "FINISHED";

export type TournamentDTO = {
  id: string;
  name: string;
  slug: string;
  game: GameType;
  status: TournamentStatus;
  description: string;
  prize: string;
  format: string;
  rankRequirement: string | null;
  rules: string;
  maxSlots: number;
  filledSlots: number;
  isLive: boolean;
};

export type SteamGame = {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
};

export type SteamProfile = {
  steamId64: string;
  persona: string | null;
  profileUrl: string | null;
  avatar: string | null;
  countryCode: string | null;
};

export type Cs2Stat = { name: string; value: number };
