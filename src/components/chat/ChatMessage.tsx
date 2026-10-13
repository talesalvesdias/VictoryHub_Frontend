"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { parseMarkdownLite, type Inline } from "@/lib/chat/markdown";
import type { UiMessage } from "@/components/chat/useChatStream";

export default function ChatMessage({
  message,
  onNavigate,
}: {
  message: UiMessage;
  onNavigate: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
          isUser && "bg-dark-lighter text-content",
          !isUser && "border border-border-input bg-dark-card text-content",
          message.status === "error" && "border-error/50 text-error",
        )}
      >
        <span className="sr-only">{isUser ? "Você disse:" : "Assistente:"}</span>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <AssistantContent text={message.content} onNavigate={onNavigate} />
        )}
        {message.status === "streaming" && !message.content && (
          <span className="inline-flex gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted [animation-delay:300ms]" />
          </span>
        )}
        {message.status === "stopped" && (
          <p className="mt-1 text-xs text-muted">Resposta interrompida.</p>
        )}
      </div>
    </div>
  );
}

function AssistantContent({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  return (
    <div className="space-y-2 break-words">
      {parseMarkdownLite(text).map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i}>
              <Inlines inlines={block.inlines} onNavigate={onNavigate} />
            </p>
          );
        }
        const List = block.type;
        return (
          <List key={i} className={cn("space-y-1 pl-5", List === "ul" ? "list-disc" : "list-decimal")}>
            {block.items.map((item, j) => (
              <li key={j}>
                <Inlines inlines={item} onNavigate={onNavigate} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

function Inlines({ inlines, onNavigate }: { inlines: Inline[]; onNavigate: () => void }) {
  return inlines.map((node, i) => {
    switch (node.type) {
      case "bold":
        return <strong key={i} className="font-semibold">{node.text}</strong>;
      case "code":
        return <code key={i} className="rounded bg-dark-lighter px-1 py-0.5 text-[0.85em]">{node.text}</code>;
      case "link":
        return node.external ? (
          <a key={i} href={node.href} target="_blank" rel="noopener noreferrer" className="text-primary-hover underline underline-offset-2">
            {node.text}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        ) : (
          <Link key={i} href={node.href} onClick={onNavigate} className="text-primary-hover underline underline-offset-2">
            {node.text}
          </Link>
        );
      default:
        return <span key={i}>{node.text}</span>;
    }
  });
}
