import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchSteamProfile, fetchOwnedGames, fetchCs2Stats } from "@/lib/steam";

// POST /api/steam/sync — atualiza o cache de dados Steam do usuário logado.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const account = await prisma.steamAccount
    .findUnique({ where: { userId: session.user.id } })
    .catch(() => null);

  if (!account) {
    return NextResponse.json({ error: "Conta Steam não vinculada." }, { status: 400 });
  }

  if (!process.env.STEAM_API_KEY) {
    return NextResponse.json(
      { error: "STEAM_API_KEY não configurada no servidor." },
      { status: 503 },
    );
  }

  try {
    const [profile, ownedGames, cs2Stats] = await Promise.all([
      fetchSteamProfile(account.steamId64).catch(() => null),
      fetchOwnedGames(account.steamId64).catch(() => []),
      fetchCs2Stats(account.steamId64).catch(() => null),
    ]);

    await prisma.steamAccount.update({
      where: { userId: session.user.id },
      data: {
        persona: profile?.persona ?? account.persona,
        avatar: profile?.avatar ?? account.avatar,
        profileUrl: profile?.profileUrl ?? account.profileUrl,
        countryCode: profile?.countryCode ?? account.countryCode,
        ownedGames: ownedGames as object,
        cs2Stats: (cs2Stats ?? undefined) as object | undefined,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, gameCount: ownedGames.length });
  } catch (err) {
    console.error("[steam/sync] erro:", err);
    return NextResponse.json({ error: "Falha ao sincronizar com a Steam." }, { status: 502 });
  }
}
