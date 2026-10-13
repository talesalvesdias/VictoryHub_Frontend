"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import ChatMessage from "@/components/chat/ChatMessage";
import { useChatStream } from "@/components/chat/useChatStream";
import { CHAT_LIMITS } from "@/lib/chat/protocol";

const SUGGESTIONS = [
  "Quais torneios estão abertos?",
  "Como vinculo minha Steam?",
  "Me recomenda um torneio",
];

// Assistente flutuante do site. Fica abaixo do banner de cookies (z-40 < z-50)
// para não cobri-lo; em telas pequenas o painel ocupa a tela inteira.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, pending, toolLabel, send, stop, reset } = useChatStream();

  const panelId = useId();
  const titleId = useId();
  const inputId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Acompanha o fim da conversa enquanto a resposta chega.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, toolLabel, open]);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  // Em tela cheia (mobile), seguir um link do chat fecha o painel para a
  // página aparecer; no desktop o painel fica aberto ao lado.
  function handleNavigate() {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!draft.trim() || pending) return;
    void send(draft);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  const remaining = CHAT_LIMITS.maxUserChars - draft.length;

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Fechar assistente VictoryHub" : "Abrir assistente VictoryHub"}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-dark shadow-2xl transition-colors hover:bg-primary-hover"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          className="fixed inset-0 z-40 flex flex-col bg-dark sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(600px,calc(100vh-8rem))] sm:w-[380px] sm:rounded-xl sm:border sm:border-border-input sm:shadow-2xl"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border-input bg-navbar-gradient px-4 py-3 sm:rounded-t-xl">
            <div className="min-w-0">
              <h2 id={titleId} className="font-display truncate text-2xl leading-none tracking-wide">
                ASSISTENTE VICTORYHUB
              </h2>
              <p className="mt-1 text-xs text-secondary">IA · pode conter erros</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Nova conversa"
                  title="Nova conversa"
                  className="rounded-md p-2 text-secondary hover:bg-dark-lighter hover:text-content"
                >
                  <NewChatIcon />
                </button>
              )}
              <button
                type="button"
                onClick={close}
                aria-label="Fechar assistente"
                className="rounded-md p-2 text-secondary hover:bg-dark-lighter hover:text-content"
              >
                <CloseIcon />
              </button>
            </div>
          </header>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-busy={pending}
            aria-label="Conversa com o assistente"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-secondary">
                  Olá! Posso ajudar com torneios, cadastro, vínculo da Steam e regras da plataforma.
                </p>
                <ul className="flex flex-wrap gap-2" aria-label="Sugestões de pergunta">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => void send(s)}
                        className="rounded-full border border-border-input px-3 py-1.5 text-xs text-content hover:border-primary hover:bg-dark-lighter"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              messages.map((m) => <ChatMessage key={m.id} message={m} onNavigate={handleNavigate} />)
            )}
            {toolLabel && (
              <p role="status" className="text-xs text-muted">
                {toolLabel}
              </p>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-border-input px-4 pb-4 pt-3">
            <p className="mb-2 text-[11px] leading-snug text-muted">
              Assistente com IA (Claude, da Anthropic). Suas mensagens são enviadas à Anthropic
              para gerar a resposta. Não compartilhe dados pessoais.
            </p>
            <label htmlFor={inputId} className="sr-only">
              Mensagem para o assistente
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id={inputId}
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={CHAT_LIMITS.maxUserChars}
                rows={2}
                placeholder="Digite sua pergunta…"
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-md border border-border-input bg-dark-lighter px-3 py-2 text-sm text-content placeholder:text-muted focus:border-primary"
              />
              {pending ? (
                <button
                  type="button"
                  onClick={stop}
                  className="h-11 rounded-md border border-border-input px-3 text-sm font-semibold text-content hover:bg-dark-lighter"
                >
                  Parar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="h-11 rounded-md bg-primary px-4 text-sm font-bold text-dark hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Enviar
                </button>
              )}
            </div>
            {remaining <= 200 && (
              <p className="mt-1 text-right text-[11px] text-muted" aria-live="polite">
                {remaining} caracteres restantes
              </p>
            )}
          </form>
        </div>
      )}
    </>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </svg>
  );
}

function NewChatIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
