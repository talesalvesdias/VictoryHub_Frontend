import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";

// POST /api/contact — valida e persiste uma mensagem de contato.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await prisma.contactMessage.create({ data: parsed.data });
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    // Banco indisponível (ex.: demo sem DATABASE_URL): não bloqueia o fluxo.
    console.warn("[contact] DB indisponível — mensagem não persistida.");
    return NextResponse.json({ ok: true, persisted: false });
  }
}
