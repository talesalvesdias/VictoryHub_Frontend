import { NextResponse } from "next/server";
import { getTournaments } from "@/lib/tournaments";

// GET /api/tournaments?game=CS2&live=true — lista pública de torneios.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game");
  const live = searchParams.get("live") === "true";

  const tournaments = await getTournaments({ game, live });
  return NextResponse.json({ tournaments });
}
