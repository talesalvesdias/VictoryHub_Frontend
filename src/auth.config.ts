import type { NextAuthConfig } from "next-auth";

type TokenShape = {
  id?: string;
  coins?: number;
  rank?: string;
  steamLinked?: boolean;
};

// Config base, edge-safe (sem Prisma/bcrypt) — usada pelo middleware e
// estendida em auth.ts com o adapter e o provider Credentials.
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard");
      if (isProtected) return isLoggedIn;
      return true;
    },
    jwt({ token, user, trigger, session }) {
      const t = token as TokenShape;
      // Em sign-in (user presente) copia campos extras para o token.
      if (user) {
        const u = user as { id?: string; coins?: number; rank?: string; steamLinked?: boolean };
        t.id = u.id;
        t.coins = u.coins ?? 0;
        t.rank = u.rank ?? "Unranked";
        t.steamLinked = u.steamLinked ?? false;
      }
      // Permite atualizar via updateSession() (ex.: após vincular Steam).
      if (trigger === "update" && session) {
        const s = session as { steamLinked?: boolean; coins?: number };
        if (typeof s.steamLinked === "boolean") t.steamLinked = s.steamLinked;
        if (typeof s.coins === "number") t.coins = s.coins;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as TokenShape;
      if (t.id) session.user.id = t.id;
      session.user.coins = t.coins ?? 0;
      session.user.rank = t.rank ?? "Unranked";
      session.user.steamLinked = t.steamLinked ?? false;
      return session;
    },
  },
} satisfies NextAuthConfig;
