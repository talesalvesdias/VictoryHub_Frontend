"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import type { TournamentStatus } from "@/types";

export default function RegisterButton({
  tournamentId,
  status,
}: {
  tournamentId: string;
  status: TournamentStatus;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  if (status === "FULL") {
    return (
      <Button variant="ghost" className="w-full" disabled>
        Vagas esgotadas
      </Button>
    );
  }
  if (status === "FINISHED") {
    return (
      <Button variant="ghost" className="w-full" disabled>
        Torneio encerrado
      </Button>
    );
  }

  async function handleRegister() {
    setState("loading");
    setMsg("");
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: "POST",
      });
      if (res.status === 401) {
        router.push(`/login?next=/torneios`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMsg(data?.error ?? "Não foi possível inscrever.");
        return;
      }
      setState("done");
      setMsg("Inscrição confirmada!");
      router.refresh();
    } catch {
      setState("error");
      setMsg("Erro de conexão. Tente novamente.");
    }
  }

  if (state === "done") {
    return (
      <Button variant="secondary" className="w-full" disabled>
        ✓ Inscrito
      </Button>
    );
  }

  return (
    <div>
      <Button
        className="w-full"
        onClick={handleRegister}
        disabled={state === "loading"}
      >
        {state === "loading" ? "Inscrevendo..." : "Inscrever-se"}
      </Button>
      {state === "error" && <p className="mt-2 text-xs text-error">{msg}</p>}
    </div>
  );
}
