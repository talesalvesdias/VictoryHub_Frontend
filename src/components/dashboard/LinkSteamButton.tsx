"use client";

import Button from "@/components/ui/Button";

export default function LinkSteamButton({ linked }: { linked: boolean }) {
  // Navega para o fluxo OpenID (server-side redireciona para a Steam).
  return (
    <Button
      onClick={() => {
        window.location.href = "/api/steam/link";
      }}
      variant={linked ? "ghost" : "primary"}
    >
      {linked ? "Revincular Steam" : "🎮 Vincular conta Steam"}
    </Button>
  );
}
