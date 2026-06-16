"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function SyncSteamButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function sync() {
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/steam/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMsg(data?.error ?? "Falha ao sincronizar.");
        return;
      }
      setState("idle");
      router.refresh();
    } catch {
      setState("error");
      setMsg("Erro de conexão.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" onClick={sync} disabled={state === "loading"}>
        {state === "loading" ? "Sincronizando..." : "🔄 Sincronizar dados"}
      </Button>
      {state === "error" && <p className="text-xs text-error">{msg}</p>}
    </div>
  );
}
