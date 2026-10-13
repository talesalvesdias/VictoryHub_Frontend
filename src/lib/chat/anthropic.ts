import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// A chave fica só no servidor (sem prefixo NEXT_PUBLIC_). Sem ela, o chat
// responde 503 e o resto do site segue funcionando.
export function isChatConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

// Criado no primeiro uso, para o build não depender da chave.
// timeout × (maxRetries + 1) = 50s, dentro do maxDuration de 60s da rota.
export function getAnthropic(): Anthropic {
  client ??= new Anthropic({ timeout: 25_000, maxRetries: 1 });
  return client;
}
