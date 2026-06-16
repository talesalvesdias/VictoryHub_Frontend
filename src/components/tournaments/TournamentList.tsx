"use client";

import { useEffect, useState } from "react";
import TournamentCard from "@/components/tournaments/TournamentCard";
import TournamentFilters from "@/components/tournaments/TournamentFilters";
import type { TournamentDTO } from "@/types";

// Componente client que consome /api/tournaments dinamicamente
// (fetch + async/await + useEffect) — requisito da Parte 2 dos stakeholders.
export default function TournamentList() {
  const [filter, setFilter] = useState("ALL");
  const [tournaments, setTournaments] = useState<TournamentDTO[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      try {
        const params = new URLSearchParams();
        if (filter === "LIVE") params.set("live", "true");
        else if (filter !== "ALL") params.set("game", filter);

        const res = await fetch(`/api/tournaments?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("request failed");
        const data = await res.json();
        setTournaments(data.tournaments ?? []);
        setStatus("ready");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setStatus("error");
      }
    }

    load();
    return () => controller.abort();
  }, [filter]);

  return (
    <div>
      <div className="mb-8">
        <TournamentFilters active={filter} onChange={setFilter} />
      </div>

      {status === "loading" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-[15px] border border-border bg-dark-card"
            />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-[15px] border border-border bg-dark-card p-10 text-center">
          <p className="text-error">Não foi possível carregar os torneios.</p>
          <button
            onClick={() => setFilter((f) => f)}
            className="mt-3 text-sm text-primary underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {status === "ready" && tournaments.length === 0 && (
        <div className="rounded-[15px] border border-border bg-dark-card p-10 text-center text-muted">
          Nenhum torneio encontrado para este filtro.
        </div>
      )}

      {status === "ready" && tournaments.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
