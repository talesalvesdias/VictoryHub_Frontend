import { describe, expect, it } from "vitest";
import { encodeEvent, parseEvents, type ChatStreamEvent } from "@/lib/chat/protocol";

describe("protocolo SSE do chat", () => {
  it("faz ida e volta de eventos", () => {
    const events: ChatStreamEvent[] = [
      { type: "tool", name: "listar_torneios", label: "Consultando torneios…" },
      { type: "delta", text: "Olá!\n\nlinha com \"aspas\"" },
      { type: "done", stopReason: "end_turn" },
    ];
    const { events: parsed, rest } = parseEvents(events.map(encodeEvent).join(""));
    expect(parsed).toEqual(events);
    expect(rest).toBe("");
  });

  it("guarda o evento incompleto para o próximo chunk", () => {
    const full = encodeEvent({ type: "delta", text: "abc" }) + encodeEvent({ type: "delta", text: "def" });
    const cut = full.length - 5;
    const first = parseEvents(full.slice(0, cut));
    expect(first.events).toEqual([{ type: "delta", text: "abc" }]);
    const second = parseEvents(first.rest + full.slice(cut));
    expect(second.events).toEqual([{ type: "delta", text: "def" }]);
  });

  it("ignora linha corrompida sem perder as outras", () => {
    const buffer = "data: {quebrado\n\n" + encodeEvent({ type: "done", stopReason: null });
    expect(parseEvents(buffer).events).toEqual([{ type: "done", stopReason: null }]);
  });
});
