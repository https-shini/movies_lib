import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getTmdbErrorMessage, NETWORK_ERROR_MESSAGE } from "../src/services/tmdbErrors.js";

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

async function loadTmdb() {
  vi.resetModules();
  return import("../src/services/tmdb.js");
}

describe("fetchTmdb", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_KEY", "test-key");
    vi.stubEnv("VITE_API", "");
    vi.stubEnv("VITE_IMG", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses public TMDB defaults when only the API key is configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [] }));
    vi.stubGlobal("fetch", fetchMock);
    const { fetchTmdb, getPosterUrl } = await loadTmdb();

    await fetchTmdb("popular", { params: { language: "pt-BR" } });

    const [url] = fetchMock.mock.calls[0];
    expect(url.href).toBe("https://api.themoviedb.org/3/movie/popular?api_key=test-key&language=pt-BR");
    expect(getPosterUrl("/poster.jpg")).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");
  });

  it("translates HTTP failures into Portuguese messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      jsonResponse({ success: false, status_message: "Invalid API key" }, 401),
    ));
    const { fetchTmdb } = await loadTmdb();

    await expect(fetchTmdb("popular")).rejects.toThrow(/chave do TMDB é inválida/);
  });

  it("reports network failures with a friendly message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const { fetchTmdb } = await loadTmdb();

    await expect(fetchTmdb("popular")).rejects.toThrow(NETWORK_ERROR_MESSAGE);
  });

  it("propagates aborted requests unchanged", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));
    const { fetchTmdb } = await loadTmdb();

    await expect(fetchTmdb("popular")).rejects.toBe(abortError);
  });

  it("rejects payloads flagged as unsuccessful even with HTTP 200", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ success: false })));
    const { fetchTmdb } = await loadTmdb();

    await expect(fetchTmdb("popular")).rejects.toThrow(/Não foi possível consultar o TMDB/);
  });
});

describe("getTmdbErrorMessage", () => {
  it.each([
    [404, /não foi encontrado/],
    [422, /parâmetros/],
    [429, /Aguarde/],
    [503, /indisponível/],
    [418, /HTTP 418/],
  ])("maps HTTP %i", (status, expected) => {
    expect(getTmdbErrorMessage(status)).toMatch(expected);
  });
});
