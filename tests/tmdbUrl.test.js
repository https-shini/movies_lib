import { describe, expect, it } from "vitest";

import { buildTmdbUrl } from "../src/services/tmdbUrl.js";

const baseConfig = {
  baseUrl: "https://api.themoviedb.org/3/movie/",
  endpoint: "top_rated",
  apiKey: "sample-key",
};

describe("buildTmdbUrl", () => {
  it("resolves a relative endpoint against the configured base URL", () => {
    const url = buildTmdbUrl(baseConfig);

    expect(url.origin).toBe("https://api.themoviedb.org");
    expect(url.pathname).toBe("/3/movie/top_rated");
    expect(url.searchParams.get("api_key")).toBe("sample-key");
  });

  it("accepts an absolute endpoint for search requests", () => {
    const url = buildTmdbUrl({
      ...baseConfig,
      endpoint: "https://api.themoviedb.org/3/search/movie",
    });

    expect(url.pathname).toBe("/3/search/movie");
  });

  it("accepts a parameterized API key configuration", () => {
    const url = buildTmdbUrl({ ...baseConfig, apiKey: "api_key=another-key" });

    expect(url.searchParams.get("api_key")).toBe("another-key");
  });

  it("does not overwrite an API key already present in the endpoint", () => {
    const url = buildTmdbUrl({
      ...baseConfig,
      endpoint: "https://api.themoviedb.org/3/movie/top_rated?api_key=endpoint-key",
    });

    expect(url.searchParams.get("api_key")).toBe("endpoint-key");
  });

  it("encodes query parameters and ignores empty values", () => {
    const url = buildTmdbUrl({
      ...baseConfig,
      params: { query: "ação & aventura", page: 2, language: "", absent: undefined, empty: null },
    });

    expect(url.searchParams.get("query")).toBe("ação & aventura");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.has("language")).toBe(false);
    expect(url.searchParams.has("absent")).toBe(false);
    expect(url.searchParams.has("empty")).toBe(false);
  });

  it("rejects missing configuration", () => {
    expect(() => buildTmdbUrl({ ...baseConfig, apiKey: "" })).toThrow(/VITE_API_KEY/);
    expect(() => buildTmdbUrl({ ...baseConfig, baseUrl: "" })).toThrow(/VITE_API/);
  });
});
