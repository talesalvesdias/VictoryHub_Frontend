import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Instância edge-safe (sem Prisma/bcrypt) só para proteger rotas.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/dashboard/:path*"],
};
