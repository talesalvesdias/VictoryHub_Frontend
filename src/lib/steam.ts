import "server-only";
import type { SteamProfile, SteamGame } from "@/types";

const API = "https://api.steampowered.com";
const CS2_APPID = 730;

function key(): string {
  const k = process.env.STEAM_API_KEY;
  if (!k) throw new Error("STEAM_API_KEY não configurada.");
  return k;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Steam API ${res.status}`);
  return (await res.json()) as T;
}

// GetPlayerSummaries — perfil + avatar.
export async function fetchSteamProfile(steamId64: string): Promise<SteamProfile | null> {
  const url = `${API}/ISteamUser/GetPlayerSummaries/v0002/?key=${key()}&steamids=${steamId64}`;
  const data = await getJson<{
    response: {
      players: Array<{
        steamid: string;
        personaname: string;
        profileurl: string;
        avatarfull: string;
        avatarmedium: string;
        loccountrycode?: string;
      }>;
    };
  }>(url);

  const p = data.response.players[0];
  if (!p) return null;
  return {
    steamId64: p.steamid,
    persona: p.personaname ?? null,
    profileUrl: p.profileurl ?? null,
    avatar: p.avatarfull ?? null,
    countryCode: p.loccountrycode ?? null,
  };
}

// GetOwnedGames — jogos + horas (ordenados por horas jogadas).
export async function fetchOwnedGames(steamId64: string): Promise<SteamGame[]> {
  const url =
    `${API}/IPlayerService/GetOwnedGames/v0001/?key=${key()}&steamid=${steamId64}` +
    `&include_appinfo=1&include_played_free_games=1&format=json`;
  const data = await getJson<{
    response: { game_count?: number; games?: SteamGame[] };
  }>(url);

  const games = data.response.games ?? [];
  return games.sort((a, b) => b.playtime_forever - a.playtime_forever);
}

// GetUserStatsForGame (CS2 / appid 730). Retorna null em perfis privados (403).
export async function fetchCs2Stats(
  steamId64: string,
): Promise<Array<{ name: string; value: number }> | null> {
  const url = `${API}/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${CS2_APPID}&key=${key()}&steamid=${steamId64}`;
  try {
    const data = await getJson<{
      playerstats?: { stats?: Array<{ name: string; value: number }> };
    }>(url);
    return data.playerstats?.stats ?? null;
  } catch {
    // 403/empty → perfil privado ou sem dados de CS2.
    return null;
  }
}
