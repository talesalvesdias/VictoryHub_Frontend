"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/cn";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="bg-navbar-gradient text-content">
      <nav className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-10 lg:px-[60px]">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-wider">
          <Image src="/logo.png" alt="VictoryHub" width={25} height={25} priority />
          <span>VictoryHUB</span>
        </Link>

        <ul className="order-3 flex w-full list-none items-center justify-center gap-5 md:order-2 md:w-auto md:gap-10">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm transition-colors duration-300 hover:text-primary",
                    active && "rounded-lg bg-dark px-[18px] py-2 hover:text-content",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="order-2 flex items-center gap-3 md:order-3">
          {status === "authenticated" && user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm transition-colors duration-300 hover:bg-border-light"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-dark">
                  {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-[#2a2a2a] px-5 py-2 text-sm transition-colors duration-300 hover:bg-border-light"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-[#2a2a2a] px-5 py-2 text-sm transition-colors duration-300 hover:bg-border-light"
              >
                Login
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg border border-primary bg-primary/10 px-5 py-2 text-sm transition-colors duration-300 hover:bg-primary/20"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
