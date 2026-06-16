import "server-only";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const STEAM_NS = "http://specs.openid.net/auth/2.0";
const IDENTIFIER_SELECT = "http://specs.openid.net/auth/2.0/identifier_select";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

// Monta a URL de redirecionamento (checkid_setup) para o login OpenID da Steam.
export function buildSteamAuthUrl(): string {
  const params = new URLSearchParams({
    "openid.ns": STEAM_NS,
    "openid.mode": "checkid_setup",
    "openid.claimed_id": IDENTIFIER_SELECT,
    "openid.identity": IDENTIFIER_SELECT,
    "openid.return_to": `${baseUrl()}/api/steam/callback`,
    "openid.realm": baseUrl(),
  });
  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

// Verifica o callback OpenID re-postando os parâmetros com check_authentication.
// Retorna o steamId64 quando válido, ou null.
export async function verifySteamCallback(query: URLSearchParams): Promise<string | null> {
  const claimedId = query.get("openid.claimed_id");
  if (!claimedId) return null;

  // Re-monta o corpo com mode=check_authentication.
  const body = new URLSearchParams();
  for (const [key, value] of query.entries()) {
    body.set(key, value);
  }
  body.set("openid.mode", "check_authentication");

  const res = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!/is_valid\s*:\s*true/i.test(text)) return null;

  const match = claimedId.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/);
  return match ? match[1] : null;
}
