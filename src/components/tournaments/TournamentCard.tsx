import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import RegisterButton from "@/components/tournaments/RegisterButton";
import { GAME_LABELS } from "@/lib/constants";
import type { TournamentDTO } from "@/types";

export default function TournamentCard({ tournament: t }: { tournament: TournamentDTO }) {
  return (
    <Card hover className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Badge kind="game">{GAME_LABELS[t.game] ?? t.game}</Badge>
        {t.isLive ? (
          <Badge kind="live">● Ao Vivo</Badge>
        ) : t.status === "UPCOMING" ? (
          <Badge kind="soon">Em breve</Badge>
        ) : t.status === "FULL" ? (
          <Badge kind="full">Esgotado</Badge>
        ) : (
          <Badge kind="neutral">Finalizado</Badge>
        )}
      </div>

      <h3 className="mb-2 text-xl font-semibold">{t.name}</h3>
      <p className="mb-4 text-sm leading-relaxed text-muted">{t.description}</p>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Premiação</dt>
          <dd className="font-semibold text-primary">{t.prize}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Formato</dt>
          <dd className="font-medium">{t.format}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Rank</dt>
          <dd className="font-medium">{t.rankRequirement ?? "Livre"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Vagas</dt>
          <dd className="font-medium">
            {t.filledSlots} / {t.maxSlots}
          </dd>
        </div>
      </dl>

      <p className="mb-4 text-xs leading-relaxed text-secondary">{t.rules}</p>

      <div className="mt-auto">
        <p className="mb-2 text-[13px] text-[#fffafa]">
          👥 {t.filledSlots} / {t.maxSlots} jogadores
        </p>
        <ProgressBar value={t.filledSlots} max={t.maxSlots} className="mb-4" />
        <RegisterButton tournamentId={t.id} status={t.status} />
      </div>
    </Card>
  );
}
