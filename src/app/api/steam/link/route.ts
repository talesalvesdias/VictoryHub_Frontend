import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildSteamAuthUrl } from "@/lib/steam-openid";

// GET /api/steam/link — inicia o fluxo OpenID da Steam (usuário logado).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/login?next=/dashboard", process.env.NEXT_PUBLIC_BASE_URL),
    );
  }
  return NextResponse.redirect(buildSteamAuthUrl());
}
