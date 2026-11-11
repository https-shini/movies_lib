// @vitest-environment node
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearTmdbCache, getMovieList } from "../src/services/tmdb.ts";
import { urlOf } from "../src/test/fetch.ts";

/**
 * O index.html pede os dados do destaque do Início antes do JavaScript (D-42). O navegador
 * só reaproveita esse pedido se a URL for idêntica à que o app gera.
 */
describe("pré-carregamento do index.html", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearTmdbCache();
  });

  it("usa exatamente a URL que getMovieList('popular', 1) pede", async () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const href = /rel="preload"\s+href="([^"]+)"/.exec(html)?.[1];

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ page: 1, results: [], total_pages: 0, total_results: 0 })),
      );
    vi.stubGlobal("fetch", fetchMock);
    await getMovieList("popular", 1);

    const [input] = fetchMock.mock.calls[0] ?? [];
    expect(href).toBeDefined();
    expect(urlOf(input)).toBe(href);
  });
});
