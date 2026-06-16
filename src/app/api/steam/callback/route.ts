import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifySteamCallback } from "@/lib/steam-openid";
import { fetchSteamProfile } from "@/lib/steam";

const base = () => process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// GET /api/steam/callback — valida o retorno OpenID e vincula a Steam ao usuário.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?next=/dashboard", base()));
  }

  const { searchParams } = new URL(request.url);
  const steamId64 = await verifySteamCallback(searchParams);
  if (!steamId64) {
    return NextResponse.redirect(new URL("/dashboard?steam=erro", base()));
  }

  try {
    // Busca o perfil para popular persona/avatar (best-effort).
    let profile = null;
    try {
      profile = await fetchSteamProfile(steamId64);
    } catch {
      profile = null;
    }

    await prisma.steamAccount.upsert({
      where: { userId: session.user.id },
      update: {
        steamId64,
        persona: profile?.persona,
        profileUrl: profile?.profileUrl,
        avatar: profile?.avatar,
        countryCode: profile?.countryCode,
      },
      create: {
        userId: session.user.id,
        steamId64,
        persona: profile?.persona,
        profileUrl: profile?.profileUrl,
        avatar: profile?.avatar,
        countryCode: profile?.countryCode,
      },
    });

    return NextResponse.redirect(new URL("/dashboard?steam=ok", base()));
  } catch (err) {
    console.error("[steam/callback] erro:", err);
    return NextResponse.redirect(new URL("/dashboard?steam=erro", base()));
  }
}
