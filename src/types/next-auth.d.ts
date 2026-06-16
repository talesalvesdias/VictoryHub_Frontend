import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      coins: number;
      rank: string;
      steamLinked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    coins?: number;
    rank?: string;
    steamLinked?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    coins?: number;
    rank?: string;
    steamLinked?: boolean;
  }
}
