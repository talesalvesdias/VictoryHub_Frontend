import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdownLite, safeHref } from "@/lib/chat/markdown";

describe("parseMarkdownLite", () => {
  it("separa parágrafos e listas", () => {
    const blocks = parseMarkdownLite("Torneios abertos:\n\n- **CS2 Open** em [Torneios](/torneios)\n- Marvel Cup\n\n1. Faça login\n2. Clique em Inscrever-se");
    expect(blocks).toEqual([
      { type: "p", inlines: [{ type: "text", text: "Torneios abertos:" }] },
      {
        type: "ul",
        items: [
          [
            { type: "bold", text: "CS2 Open" },
            { type: "text", text: " em " },
            { type: "link", text: "Torneios", href: "/torneios", external: false },
          ],
          [{ type: "text", text: "Marvel Cup" }],
        ],
      },
      {
        type: "ol",
        items: [[{ type: "text", text: "Faça login" }], [{ type: "text", text: "Clique em Inscrever-se" }]],
      },
    ]);
  });

  it("transforma título em negrito", () => {
    expect(parseMarkdownLite("## Regras")).toEqual([{ type: "p", inlines: [{ type: "bold", text: "Regras" }] }]);
  });
});

describe("links", () => {
  it.each(["javascript:alert(1)", "//evil.example", "data:text/html,x", "http://inseguro.example"])(
    "não gera link para %s",
    (href) => {
      expect(safeHref(href)).toBeNull();
      expect(parseInline(`[clique](${href})`)).toEqual([{ type: "text", text: "clique" }]);
    },
  );

  it("aceita https externo", () => {
    expect(safeHref("https://store.steampowered.com")).toEqual({ href: "https://store.steampowered.com", external: true });
  });

  it("mantém parênteses balanceados dentro da URL", () => {
    expect(parseInline("veja [CS2](https://pt.wikipedia.org/wiki/CS_(jogo)).")).toEqual([
      { type: "text", text: "veja " },
      { type: "link", text: "CS2", href: "https://pt.wikipedia.org/wiki/CS_(jogo)", external: true },
      { type: "text", text: "." },
    ]);
  });

  it("mantém HTML como texto puro", () => {
    expect(parseInline("<img src=x onerror=alert(1)>")).toEqual([{ type: "text", text: "<img src=x onerror=alert(1)>" }]);
  });
});
