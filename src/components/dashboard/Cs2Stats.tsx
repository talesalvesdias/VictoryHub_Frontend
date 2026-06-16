import type { Cs2Stat } from "@/types";

// Estatísticas-chave do CS2 que queremos destacar (se presentes).
const HIGHLIGHTS: Array<{ key: string; label: string }> = [
  { key: "total_kills", label: "Abates" },
  { key: "total_deaths", label: "Mortes" },
  { key: "total_wins", label: "Vitórias" },
  { key: "total_matches_played", label: "Partidas" },
  { key: "total_mvps", label: "MVPs" },
  { key: "total_planted_bombs", label: "Bombas plantadas" },
];

export default function Cs2Stats({ stats }: { stats: Cs2Stat[] | null }) {
  if (!stats || stats.length === 0) {
    return (
      <p className="text-sm text-muted">
        Estatísticas de CS2 indisponíveis — o perfil pode estar privado ou sem partidas.
      </p>
    );
  }

  const map = new Map(stats.map((s) => [s.name, s.value]));
  const kills = map.get("total_kills") ?? 0;
  const deaths = map.get("total_deaths") ?? 0;
  const kd = deaths > 0 ? (kills / deaths).toFixed(2) : "—";

  return (
    <div>
      <div className="mb-4 inline-flex items-baseline gap-2 rounded-md border border-border bg-dark-lighter px-4 py-2">
        <span className="text-xs uppercase tracking-wide text-muted">K/D</span>
        <span className="font-display text-2xl text-primary">{kd}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map((h) => {
          const value = map.get(h.key);
          if (value === undefined) return null;
          return (
            <div key={h.key} className="rounded-md border border-border bg-dark-lighter p-3">
              <dt className="text-xs uppercase tracking-wide text-muted">{h.label}</dt>
              <dd className="font-display text-xl">{value.toLocaleString("pt-BR")}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
