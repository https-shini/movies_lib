import { describe, expect, it } from "vitest";
import { getTotalPages, MAX_TMDB_PAGE, normalizePage } from "./pagination";

describe("normalizePage", () => {
  it.each([
    ["1", 1],
    ["7", 7],
    [3, 3],
    [2.9, 2],
    ["", 1],
    [null, 1],
    ["-2", 1],
    ["abc", 1],
    ["501", MAX_TMDB_PAGE],
  ])("normaliza %s para %i", (value, expected) => {
    expect(normalizePage(value)).toBe(expected);
  });
});

describe("getTotalPages", () => {
  it("limita ao máximo do TMDB", () => {
    expect(getTotalPages({ total_pages: 42 })).toBe(42);
    expect(getTotalPages({ total_pages: 12000 })).toBe(MAX_TMDB_PAGE);
  });

  it("retorna 1 para dados ausentes ou inválidos", () => {
    expect(getTotalPages(null)).toBe(1);
    expect(getTotalPages({ total_pages: 0 })).toBe(1);
  });
});
