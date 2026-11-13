import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  dismissToast,
  getToasts,
  resetToasts,
  showToast,
  subscribeToasts,
  TOAST_LIMIT,
  TOAST_MS,
  TOAST_WITH_ACTION_MS,
} from "./toast";

describe("toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetToasts();
  });
  afterEach(() => {
    resetToasts();
    vi.useRealTimers();
  });

  it("mostra e some sozinho depois do tempo padrão", () => {
    showToast("Link copiado");
    expect(getToasts().map((t) => t.message)).toEqual(["Link copiado"]);
    vi.advanceTimersByTime(TOAST_MS);
    expect(getToasts()).toEqual([]);
  });

  it("dá mais tempo a avisos com ação", () => {
    showToast("Removido", { action: { label: "Desfazer", onAction: () => undefined } });
    vi.advanceTimersByTime(TOAST_MS);
    expect(getToasts()).toHaveLength(1);
    vi.advanceTimersByTime(TOAST_WITH_ACTION_MS - TOAST_MS);
    expect(getToasts()).toHaveLength(0);
  });

  it(`mantém no máximo ${String(TOAST_LIMIT)} avisos, descartando os mais antigos`, () => {
    for (let i = 1; i <= TOAST_LIMIT + 2; i++) showToast(`aviso ${String(i)}`);
    expect(getToasts().map((t) => t.message)).toEqual(["aviso 3", "aviso 4", "aviso 5"]);
  });

  it("fecha pelo id e avisa quem está inscrito", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToasts(listener);
    const id = showToast("a");
    dismissToast(id);
    dismissToast(id); // segunda vez não notifica de novo
    expect(listener).toHaveBeenCalledTimes(2);
    expect(getToasts()).toEqual([]);
    unsubscribe();
  });

  it("usa o tom neutro por padrão", () => {
    showToast("a");
    expect(getToasts()[0]?.tone).toBe("neutral");
  });
});
