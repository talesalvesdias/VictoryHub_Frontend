import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/tournaments/[id]/register — inscreve o usuário logado.
// Transacional: garante a vaga e marca FULL quando lotar.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id: tournamentId } = await ctx.params;
  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!tournament) return { status: 404 as const, error: "Torneio não encontrado." };
      if (tournament.status === "FULL" || tournament.filledSlots >= tournament.maxSlots) {
        return { status: 409 as const, error: "Vagas esgotadas." };
      }
      if (tournament.status === "FINISHED") {
        return { status: 409 as const, error: "Torneio encerrado." };
      }

      await tx.tournamentRegistration.create({ data: { userId, tournamentId } });

      const filledSlots = tournament.filledSlots + 1;
      await tx.tournament.update({
        where: { id: tournamentId },
        data: {
          filledSlots,
          status: filledSlots >= tournament.maxSlots ? "FULL" : tournament.status,
        },
      });

      return { status: 201 as const, filledSlots };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, filledSlots: result.filledSlots }, { status: 201 });
  } catch (err) {
    // Violação de unique → já inscrito.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Você já está inscrito." }, { status: 409 });
    }
    console.error("[register] erro:", err);
    return NextResponse.json(
      { error: "Banco indisponível. Configure DATABASE_URL." },
      { status: 503 },
    );
  }
}
