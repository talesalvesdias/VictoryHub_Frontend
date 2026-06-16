import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export default function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-dark-card border border-border rounded-[15px] p-6 transition-colors duration-300",
        hover && "hover:border-accent",
        className,
      )}
    >
      {children}
    </div>
  );
}
