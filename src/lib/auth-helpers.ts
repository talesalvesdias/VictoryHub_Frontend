import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Retorna o usuário logado (com Steam) lendo direto do banco, ou null.
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  try {
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { steamAccount: true },
    });
  } catch {
    return null;
  }
}
