"use client";

import { TOURNAMENT_FILTERS } from "@/lib/constants";
import { cn } from "@/lib/cn";

export default function TournamentFilters({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {TOURNAMENT_FILTERS.map((f) => {
        const isActive = active === f.value;
        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={cn(
              "rounded-lg border px-5 py-2 text-sm transition-colors duration-200",
              isActive
                ? "border-primary bg-primary text-dark font-semibold"
                : "border-[#ff7c7c] text-content hover:bg-border-light",
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
