import { describe, expect, it } from "vitest";
import {
  isInWatchlist,
  parseWatchlist,
  toggleWatchlistItem,
  WATCHLIST_MAX_ITEMS,
  type WatchlistItem,
} from "./watchlist";

const item = (overrides: Partial<WatchlistItem> = {}): WatchlistItem => ({
  id: 550,
  mediaType: "movie",
  title: "Clube da Luta",
  posterPath: "/p.jpg",
  date: "1999-10-15",
  voteAverage: 8.4,
  addedAt: 1,
  ...overrides,
});

describe("parseWatchlist", () => {
  it("lê os itens válidos na ordem guardada", () => {
    const stored = JSON.stringify([
      item(),
      item({ id: 1396, mediaType: "tv", title: "Breaking Bad" }),
    ]);
    expect(parseWatchlist(stored)).toHaveLength(2);
    expect(parseWatchlist(stored)[1]).toMatchObject({ id: 1396, mediaType: "tv" });
  });

  it("devolve lista vazia para conteúdo ausente, inválido ou que não é uma lista", () => {
    expect(parseWatchlist(null)).toEqual([]);
    expect(parseWatchlist("{não é json")).toEqual([]);
    expect(parseWatchlist('{"id":1}')).toEqual([]);
  });

  it("descarta itens fora do formato, repetidos e campos suspeitos", () => {
    const stored = JSON.stringify([
      item(),
      item(),
      { id: "550", mediaType: "movie", title: "id não numérico" },
      { id: 2, mediaType: "person", title: "tipo desconhecido" },
      { id: 3, mediaType: "movie", title: "  " },
      item({ id: 4, posterPath: "https://exemplo.com/x.jpg", date: "ontem" }),
    ]);

    const items = parseWatchlist(stored);
    expect(items.map((entry) => entry.id)).toEqual([550, 4]);
    expect(items[1]).toMatchObject({ posterPath: null, date: "" });
  });

  it("respeita o limite de itens", () => {
    const many = Array.from({ length: WATCHLIST_MAX_ITEMS + 20 }, (_, index) =>
      item({ id: index + 1 }),
    );
    expect(parseWatchlist(JSON.stringify(many))).toHaveLength(WATCHLIST_MAX_ITEMS);
  });
});

describe("toggleWatchlistItem", () => {
  it("salva no topo e remove ao repetir", () => {
    const saved = toggleWatchlistItem([item({ id: 1 })], item({ id: 2 }));
    expect(saved.map((entry) => entry.id)).toEqual([2, 1]);
    expect(toggleWatchlistItem(saved, item({ id: 2 })).map((entry) => entry.id)).toEqual([1]);
  });

  it("trata filme e série com o mesmo id como itens diferentes", () => {
    const saved = toggleWatchlistItem([item({ id: 5 })], item({ id: 5, mediaType: "tv" }));
    expect(saved).toHaveLength(2);
    expect(isInWatchlist(saved, "tv", 5)).toBe(true);
    expect(isInWatchlist(saved, "movie", 6)).toBe(false);
  });
});
