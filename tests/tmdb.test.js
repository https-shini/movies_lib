import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchTmdb, getBackdropUrl, getLogoUrl, getPosterUrl } from "../src/services/tmdb.js";
import { getTmdbErrorMessage, NETWORK_ERROR_MESSAGE } from "../src/services/tmdbErrors.js";

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

describe("fetchTmdb", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests data through the internal proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ results: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchTmdb("movie/popular", { params: { language: "pt-BR" } })).resolves.toEqual({ results: [] });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/tmdb?path=movie%2Fpopular&language=pt-BR");
  });

  it("translates HTTP failures into Portuguese messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      jsonResponse({ success: false, status_message: "Invalid API key" }, 401),
    ));

    await expect(fetchTmdb("movie/popular")).rejects.toThrow(/chave do TMDB é inválida/);
  });

  it("explains when the server has no API key configured", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ code: "missing_api_key" }, 500)));

    await expect(fetchTmdb("movie/popular")).rejects.toThrow(/TMDB_API_KEY/);
  });

  it("reports network failures with a friendly message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchTmdb("movie/popular")).rejects.toThrow(NETWORK_ERROR_MESSAGE);
  });

  it("propagates aborted requests unchanged", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchTmdb("movie/popular")).rejects.toBe(abortError);
  });

  it("rejects non-JSON success responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>", { status: 200 })));

    await expect(fetchTmdb("movie/popular")).rejects.toThrow(/TMDB/);
  });

  it("rejects payloads flagged as unsuccessful even with HTTP 200", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ success: false })));

    await expect(fetchTmdb("movie/popular")).rejects.toThrow(/Não foi possível consultar o TMDB/);
  });
});

describe("image helpers", () => {
  it("builds public TMDB image URLs", () => {
    expect(getPosterUrl("/poster.jpg")).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");
    expect(getBackdropUrl("backdrop.jpg")).toBe("https://image.tmdb.org/t/p/w1280/backdrop.jpg");
    expect(getLogoUrl("/logo.png")).toBe("https://image.tmdb.org/t/p/w92/logo.png");
    expect(getPosterUrl(null)).toBeNull();
  });
});

describe("getTmdbErrorMessage", () => {
  it.each([
    [404, /não foi encontrado/],
    [422, /parâmetros/],
    [429, /Aguarde/],
    [502, /resposta do TMDB/],
    [503, /indisponível/],
    [418, /HTTP 418/],
  ])("maps HTTP %i", (status, expected) => {
    expect(getTmdbErrorMessage(status)).toMatch(expected);
  });
});
