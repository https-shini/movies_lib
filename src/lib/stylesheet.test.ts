import { afterEach, describe, expect, it } from "vitest";
import { loadStylesheet } from "./stylesheet";

function links(): HTMLLinkElement[] {
  return [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')];
}

describe("loadStylesheet", () => {
  afterEach(() => {
    for (const link of links()) link.remove();
  });

  it("adiciona a folha uma única vez e resolve quando ela carrega", async () => {
    const first = loadStylesheet("/assets/a.css");
    const second = loadStylesheet("/assets/a.css");
    expect(second).toBe(first);
    expect(links()).toHaveLength(1);
    links()[0]?.dispatchEvent(new Event("load"));
    await expect(first).resolves.toBeUndefined();
  });

  it("não trava a página quando a folha falha, e tenta de novo na próxima vez", async () => {
    const failed = loadStylesheet("/assets/b.css");
    links()[0]?.dispatchEvent(new Event("error"));
    await expect(failed).resolves.toBeUndefined();
    void loadStylesheet("/assets/b.css");
    expect(links()).toHaveLength(2);
  });
});
