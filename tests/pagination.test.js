import { describe, expect, it } from "vitest";

import { getTotalPages, MAX_TMDB_PAGE, normalizePage } from "../src/services/pagination.js";
import { buildSearchParams } from "../src/services/search.js";

describe("normalizePage", () => {
  it.each([
    ["1", 1],
    ["7", 7],
    [3, 3],
    ["", 1],
    [null, 1],
    ["-2", 1],
    ["abc", 1],
    ["501", MAX_TMDB_PAGE],
  ])("normalizes %s to %i", (value, expected) => {
    expect(normalizePage(value)).toBe(expected);
  });
});

describe("getTotalPages", () => {
  it("caps the total at the TMDB limit", () => {
    expect(getTotalPages({ total_pages: 42 })).toBe(42);
    expect(getTotalPages({ total_pages: 12000 })).toBe(MAX_TMDB_PAGE);
  });

  it("returns one page for missing or invalid data", () => {
    expect(getTotalPages(null)).toBe(1);
    expect(getTotalPages({ total_pages: 0 })).toBe(1);
  });
});

describe("buildSearchParams", () => {
  it("trims the query, requests Portuguese results and normalizes the page", () => {
    expect(buildSearchParams({ query: "  Cidade de Deus ", page: "2" })).toEqual({
      query: "Cidade de Deus",
      language: "pt-BR",
      include_adult: false,
      page: 2,
    });
  });
});
