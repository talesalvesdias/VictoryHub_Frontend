import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Kind = "game" | "live" | "soon" | "full" | "neutral";

const KINDS: Record<Kind, string> = {
  game: "bg-primary/30 text-content font-bold",
  live: "bg-[rgba(30,60,40,0.4)] text-success border border-[#1e3c28]",
  soon: "bg-[rgba(79,82,255,0.5)] text-[#dfe0ff] border border-[#1e3c28]",
  full: "bg-accent/70 text-dark font-bold",
  neutral: "bg-dark-lighter text-secondary border border-border-input",
};

export default function Badge({
  kind = "neutral",
  children,
  className,
}: {
  kind?: Kind;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs",
        KINDS[kind],
        className,
      )}
    >
      {children}
    </span>
  );
}
