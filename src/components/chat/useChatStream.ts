"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHAT_LIMITS,
  CHAT_MESSAGES,
  parseEvents,
  type ChatErrorCode,
  type ChatStreamEvent,
  type ChatTurn,
} from "@/lib/chat/protocol";

export type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "done" | "streaming" | "stopped" | "error";
};

const STORAGE_KEY = "victoryhub-chat-v1";

// Conversa persiste só na aba (sessionStorage), para sobreviver a um reload.
function loadMessages(): UiMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as UiMessage[];
    return Array.isArray(saved) ? saved.filter((m) => m.status !== "streaming") : [];
  } catch {
    return [];
  }
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Só respostas completas voltam como contexto; erro e resposta interrompida não.
function toHistory(messages: UiMessage[]): ChatTurn[] {
  return messages
    .filter((m) => m.status === "done" && m.content.trim())
    .map(({ role, content }) => ({ role, content }))
    .slice(-CHAT_LIMITS.maxHistoryMessages);
}

export function useChatStream() {
  const [messages, setMessages] = useState<UiMessage[]>(loadMessages);
  const [pending, setPending] = useState(false);
  const [toolLabel, setToolLabel] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage bloqueado (aba anônima, cota): a conversa só não persiste.
    }
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const updateAssistant = useCallback((id: string, patch: (m: UiMessage) => Partial<UiMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch(m) } : m)));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, CHAT_LIMITS.maxUserChars);
      if (!content || pending) return;

      const user: UiMessage = { id: newId(), role: "user", content, status: "done" };
      const assistant: UiMessage = { id: newId(), role: "assistant", content: "", status: "streaming" };
      const history = toHistory([...messages, user]);
      setMessages((prev) => [...prev, user, assistant]);
      setPending(true);
      setToolLabel(null);

      const controller = new AbortController();
      abortRef.current = controller;
      const fail = (message: string) => updateAssistant(assistant.id, () => ({ content: message, status: "error" }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as { code?: ChatErrorCode } | null;
          fail(CHAT_MESSAGES[data?.code ?? "failed"] ?? CHAT_MESSAGES.failed);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let received = "";
        let ended = false;

        const handle = (event: ChatStreamEvent) => {
          if (event.type === "tool") setToolLabel(event.label);
          else if (event.type === "delta") {
            received += event.text;
            setToolLabel(null);
            updateAssistant(assistant.id, () => ({ content: received }));
          } else if (event.type === "error") {
            ended = true;
            fail(event.message);
          } else if (event.type === "done") {
            ended = true;
            if (received.trim()) updateAssistant(assistant.id, () => ({ status: "done" }));
            else fail(CHAT_MESSAGES.failed);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseEvents(buffer);
          buffer = parsed.rest;
          parsed.events.forEach(handle);
        }
        if (!ended) fail(CHAT_MESSAGES.failed);
      } catch {
        if (controller.signal.aborted) {
          updateAssistant(assistant.id, (m) => ({ status: m.content.trim() ? "stopped" : "error", content: m.content || "Resposta interrompida." }));
        } else {
          fail(CHAT_MESSAGES.failed);
        }
      } finally {
        abortRef.current = null;
        setPending(false);
        setToolLabel(null);
      }
    },
    [messages, pending, updateAssistant],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
  }, []);

  return { messages, pending, toolLabel, send, stop, reset };
}
