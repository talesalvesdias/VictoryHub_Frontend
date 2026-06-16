import type { Metadata } from "next";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LinkSteamButton from "@/components/dashboard/LinkSteamButton";
import SyncSteamButton from "@/components/dashboard/SyncSteamButton";
import OwnedGames from "@/components/dashboard/OwnedGames";
import Cs2Stats from "@/components/dashboard/Cs2Stats";
import { getCurrentUser } from "@/lib/auth-helpers";
import type { SteamGame, Cs2Stat } from "@/types";

export const metadata: Metadata = {
  title: "VictoryHub | Dashboard",
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ steam?: string }>;
}) {
  const { steam } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="bg-dark px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[900px]">
          <Card>
            <h1 className="font-display text-3xl">DASHBOARD</h1>
            <p className="mt-2 text-muted">
              Não foi possível carregar seus dados. Verifique se o banco de dados
              (<code className="text-primary">DATABASE_URL</code>) está configurado.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  const steamAccount = user.steamAccount;
  const linked = Boolean(steamAccount);
  const ownedGames = (steamAccount?.ownedGames as SteamGame[] | null) ?? [];
  const cs2Stats = (steamAccount?.cs2Stats as Cs2Stat[] | null) ?? null;

  return (
    <section className="bg-dark px-6 py-12 md:px-12">
      <div className="mx-auto max-w-[1000px] space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[2px] text-primary">SUA CONTA</p>
            <h1 className="font-display text-4xl tracking-wide sm:text-5xl">DASHBOARD</h1>
          </div>
          {linked && <SyncSteamButton />}
        </header>

        {steam === "ok" && (
          <p className="rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            Conta Steam vinculada com sucesso! Clique em “Sincronizar dados” para carregar
            jogos e estatísticas.
          </p>
        )}
        {steam === "erro" && (
          <p className="rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            Não foi possível vincular a Steam. Tente novamente.
          </p>
        )}

        {/* Perfil + saldo */}
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {steamAccount?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={steamAccount.avatar}
                  alt="Avatar Steam"
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
              ) : (
                <Image src="/logo.png" alt="VictoryHub" width={64} height={64} />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {steamAccount?.persona ?? user.name ?? "Jogador"}
                </h2>
                <p className="text-sm text-muted">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge kind="neutral">🏅 {user.rank}</Badge>
                  <Badge kind="game">🪙 {user.coins} moedas</Badge>
                  {linked ? (
                    <Badge kind="live">✓ Steam vinculada</Badge>
                  ) : (
                    <Badge kind="soon">Steam não vinculada</Badge>
                  )}
                </div>
              </div>
            </div>
            <LinkSteamButton linked={linked} />
          </div>
        </Card>

        {!linked ? (
          <Card>
            <h3 className="text-lg font-semibold">Vincule sua conta Steam</h3>
            <p className="mt-1 text-sm text-muted">
              Conecte sua Steam para exibir seu perfil, biblioteca de jogos e estatísticas de
              CS2 aqui no seu dashboard.
            </p>
          </Card>
        ) : (
          <>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Biblioteca de jogos</h3>
                {steamAccount?.lastSyncedAt && (
                  <span className="text-xs text-muted">
                    Atualizado em{" "}
                    {new Date(steamAccount.lastSyncedAt).toLocaleString("pt-BR")}
                  </span>
                )}
              </div>
              <OwnedGames games={ownedGames} />
            </Card>

            <Card>
              <h3 className="mb-4 text-lg font-semibold">Estatísticas de CS2</h3>
              <Cs2Stats stats={cs2Stats} />
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
