import { afterEach, describe, expect, it, vi } from "vitest";
import { whenIdleAfterLoad } from "./idle";

describe("whenIdleAfterLoad", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("espera o evento load quando a página ainda carrega", () => {
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    const callback = vi.fn();
    whenIdleAfterLoad(callback);
    vi.runAllTimers();
    expect(callback).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("load"));
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("roda no próximo momento ocioso quando a página já carregou, e pode ser cancelado", () => {
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    const callback = vi.fn();
    whenIdleAfterLoad(callback);
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);

    const cancelled = vi.fn();
    whenIdleAfterLoad(cancelled)();
    vi.runAllTimers();
    expect(cancelled).not.toHaveBeenCalled();
  });
});
