import { describe, expect, it } from "vitest";
import {
  isInWatchlist,
  parseWatchlist,
  toggleWatchlistItem,
  WATCHLIST_MAX_ITEMS,
  type WatchlistItem,
  countWatchlist,
  filterWatchlist,
  isWatchlistSort,
  reinsertWatchlistItem,
  removeWatchlistItem,
  sortWatchlist,
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

describe("visão da lista (D-67)", () => {
  const item = (overrides: Partial<WatchlistItem> & Pick<WatchlistItem, "id">): WatchlistItem => ({
    mediaType: "movie",
    title: `Título ${String(overrides.id)}`,
    posterPath: null,
    date: "",
    voteAverage: null,
    addedAt: 0,
    ...overrides,
  });
  const ids = (list: readonly WatchlistItem[]) => list.map((entry) => entry.id);

  const amelie = item({
    id: 2,
    title: "amélie",
    mediaType: "tv",
    date: "",
    voteAverage: 8.1,
    addedAt: 400,
  });
  const list = [
    item({ id: 1, title: "Zodíaco", date: "2007-03-02", voteAverage: 7.5, addedAt: 500 }),
    amelie,
    item({ id: 3, title: "Ágora", date: "2009-10-09", voteAverage: null, addedAt: 300 }),
    item({
      id: 4,
      title: "Brasil 2",
      mediaType: "tv",
      date: "2009-10-09",
      voteAverage: 7.5,
      addedAt: 200,
    }),
    item({ id: 5, title: "Brasil 10", date: "", voteAverage: null, addedAt: 100 }),
  ];

  it("filtra por tipo e conta cada um", () => {
    expect(ids(filterWatchlist(list, "all"))).toEqual([1, 2, 3, 4, 5]);
    expect(ids(filterWatchlist(list, "tv"))).toEqual([2, 4]);
    expect(ids(filterWatchlist(list, "movie"))).toEqual([1, 3, 5]);
    expect(countWatchlist(list)).toEqual({ all: 5, movie: 3, tv: 2 });
    expect(countWatchlist([])).toEqual({ all: 0, movie: 0, tv: 0 });
  });

  it("ordena por mais recentes e mais antigos pelo momento em que foi salvo", () => {
    expect(ids(sortWatchlist(list, "recent"))).toEqual([1, 2, 3, 4, 5]);
    expect(ids(sortWatchlist(list, "oldest"))).toEqual([5, 4, 3, 2, 1]);
  });

  it("ordena por título sem diferenciar acentos e maiúsculas, com números naturais", () => {
    expect(ids(sortWatchlist(list, "title"))).toEqual([3, 2, 4, 5, 1]);
  });

  it("melhor avaliados primeiro; sem nota por último; empate pelo título", () => {
    expect(ids(sortWatchlist(list, "rating"))).toEqual([2, 4, 1, 3, 5]);
  });

  it("lançamento mais recente primeiro; sem data por último; empate pelo título", () => {
    expect(ids(sortWatchlist(list, "release"))).toEqual([3, 4, 1, 2, 5]);
  });

  it("não altera a lista original e combina com o filtro", () => {
    const before = ids(list);
    expect(ids(sortWatchlist(filterWatchlist(list, "tv"), "title"))).toEqual([2, 4]);
    expect(ids(list)).toEqual(before);
  });

  it("aceita só ordenações conhecidas", () => {
    expect(isWatchlistSort("rating")).toBe(true);
    expect(isWatchlistSort("popularity")).toBe(false);
    expect(isWatchlistSort(null)).toBe(false);
  });

  it("remove e devolve o item na mesma posição, mesmo após outras remoções", () => {
    const first = removeWatchlistItem(list, "tv", 2);
    expect(first.index).toBe(1);
    const second = removeWatchlistItem(first.items, "movie", 3);
    // Desfazer a primeira remoção não traz de volta a segunda.
    const undone = reinsertWatchlistItem(second.items, amelie, first.index);
    expect(ids(undone)).toEqual([1, 2, 4, 5]);
    // Desfazer duas vezes não duplica.
    expect(ids(reinsertWatchlistItem(undone, amelie, first.index))).toEqual([1, 2, 4, 5]);
  });

  it("desfazer depois de remover um título anterior devolve a ordem original (E2E de D-67)", () => {
    const first = removeWatchlistItem(list, "movie", 3); // posição 2
    const second = removeWatchlistItem(first.items, "tv", 2); // posição 1
    const undone = reinsertWatchlistItem(second.items, list[2] ?? amelie, first.index);
    expect(ids(undone)).toEqual([1, 3, 4, 5]);
  });

  it("sem a data de inclusão (itens antigos), usa a posição de origem", () => {
    const legacy = list.map((entry) => ({ ...entry, addedAt: 0 }));
    const removed = removeWatchlistItem(legacy, "movie", 3);
    const restoredItem = legacy[2] ?? amelie;
    expect(ids(reinsertWatchlistItem(removed.items, restoredItem, removed.index))).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it("remover algo que não está na lista não muda nada", () => {
    expect(removeWatchlistItem(list, "movie", 999)).toEqual({ items: list, index: -1 });
  });
});
