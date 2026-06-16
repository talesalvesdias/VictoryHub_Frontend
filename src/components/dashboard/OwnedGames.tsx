import type { SteamGame } from "@/types";

function hours(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

function iconUrl(g: SteamGame): string | null {
  if (!g.img_icon_url) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`;
}

export default function OwnedGames({ games }: { games: SteamGame[] }) {
  if (!games || games.length === 0) {
    return <p className="text-sm text-muted">Nenhum jogo encontrado (ou perfil privado).</p>;
  }

  const top = games.slice(0, 9);

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {top.map((g) => {
        const icon = iconUrl(g);
        return (
          <li
            key={g.appid}
            className="flex items-center gap-3 rounded-md border border-border bg-dark-lighter p-3"
          >
            {icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt="" width={32} height={32} className="rounded" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded bg-dark text-xs">
                🎮
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{g.name}</p>
              <p className="text-xs text-muted">{hours(g.playtime_forever)} h jogadas</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
