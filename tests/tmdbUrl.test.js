import { describe, expect, it } from "vitest";

import { buildTmdbProxyUrl } from "../src/services/tmdbUrl.js";

describe("buildTmdbProxyUrl", () => {
  it("targets the internal proxy and never includes an API key", () => {
    const url = buildTmdbProxyUrl("movie/popular", { language: "pt-BR" });

    expect(url).toBe("/api/tmdb?path=movie%2Fpopular&language=pt-BR");
    expect(url).not.toContain("api_key");
  });

  it("normalizes leading and trailing slashes in the endpoint", () => {
    expect(buildTmdbProxyUrl("/movie/550/")).toBe("/api/tmdb?path=movie%2F550");
  });

  it("encodes query parameters and ignores empty values", () => {
    const url = new URL(buildTmdbProxyUrl("search/movie", {
      query: "ação & aventura",
      page: 2,
      language: "",
      absent: undefined,
      empty: null,
    }), "http://localhost");

    expect(url.searchParams.get("query")).toBe("ação & aventura");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.has("language")).toBe(false);
    expect(url.searchParams.has("absent")).toBe(false);
    expect(url.searchParams.has("empty")).toBe(false);
  });

  it("rejects a missing endpoint", () => {
    expect(() => buildTmdbProxyUrl("")).toThrow(/endpoint/);
  });
});
