// Subconjunto de markdown aceito nas respostas do assistente: parágrafos,
// listas, **negrito**, `código` e [links](/rota). Vira uma árvore simples que
// o widget renderiza como elementos React — nunca como HTML cru.

export type Inline =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string; external: boolean };

export type Block =
  | { type: "p"; inlines: Inline[] }
  | { type: "ul" | "ol"; items: Inline[][] };

const BULLET = /^\s*(?:[-*•])\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;
// A URL do link aceita um nível de parênteses balanceados, ex.: (…/Foo_(bar)).
const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

export function parseMarkdownLite(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: Inline[][] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", inlines: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const line of source.split("\n")) {
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      flushParagraph();
      if (list && list.type !== type) flushList();
      list ??= { type, items: [] };
      list.items.push(parseInline((bullet ?? numbered)![1]));
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push({ type: "p", inlines: [{ type: "bold", text: heading[1].trim() }] });
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) out.push({ type: "text", text: text.slice(last, match.index) });
    const [whole, bold, code, linkText, href] = match;
    if (bold !== undefined) out.push({ type: "bold", text: bold });
    else if (code !== undefined) out.push({ type: "code", text: code });
    else {
      const safe = safeHref(href);
      out.push(safe ? { type: "link", text: linkText, ...safe } : { type: "text", text: linkText ?? whole });
    }
    last = match.index + whole.length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}

// Só rotas internas ("/torneios") e https. javascript:, data:, // etc. viram texto.
export function safeHref(href: string): { href: string; external: boolean } | null {
  if (href.startsWith("/") && !href.startsWith("//")) return { href, external: false };
  if (/^https:\/\/[^\s]+$/i.test(href)) return { href, external: true };
  return null;
}
