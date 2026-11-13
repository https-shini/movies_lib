import type { MediaType } from "./media";

/** Item da "Minha lista": só o necessário para montar o card, sem dados pessoais. */
export interface WatchlistItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  /** Data de lançamento ou de estreia (AAAA-MM-DD), ou "". */
  date: string;
  voteAverage: number | null;
  /** Momento em que foi salvo (milissegundos), para ordenar do mais recente ao mais antigo. */
  addedAt: number;
}

export const WATCHLIST_STORAGE_KEY = "cinelux:minha-lista:v1";
/** Limite para a lista não crescer sem controle no armazenamento do navegador. */
export const WATCHLIST_MAX_ITEMS = 500;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function toItem(value: unknown): WatchlistItem | null {
  if (!isRecord(value)) return null;
  const { id, mediaType, title, posterPath, date, voteAverage, addedAt } = value;

  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  if (typeof title !== "string" || title.trim() === "") return null;

  return {
    id,
    mediaType,
    title: title.slice(0, 200),
    posterPath: typeof posterPath === "string" && posterPath.startsWith("/") ? posterPath : null,
    date: typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    voteAverage:
      typeof voteAverage === "number" && Number.isFinite(voteAverage) ? voteAverage : null,
    addedAt: typeof addedAt === "number" && Number.isFinite(addedAt) ? addedAt : 0,
  };
}

/**
 * Lê a lista guardada. O conteúdo do armazenamento pode ter sido alterado fora do site,
 * então cada item é validado; o que não tiver o formato esperado é descartado.
 */
export function parseWatchlist(raw: string | null | undefined): WatchlistItem[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const items: WatchlistItem[] = [];
  for (const entry of data) {
    const item = toItem(entry);
    if (!item) continue;
    const key = watchlistKey(item.mediaType, item.id);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length === WATCHLIST_MAX_ITEMS) break;
  }
  return items;
}

export const watchlistKey = (mediaType: MediaType, id: number): string =>
  `${mediaType}:${String(id)}`;

export function isInWatchlist(
  items: readonly WatchlistItem[],
  mediaType: MediaType,
  id: number,
): boolean {
  return items.some((item) => item.mediaType === mediaType && item.id === id);
}

/** Salva o item no topo da lista, ou remove se já estiver nela. */
export function toggleWatchlistItem(
  items: readonly WatchlistItem[],
  item: WatchlistItem,
): WatchlistItem[] {
  if (isInWatchlist(items, item.mediaType, item.id)) {
    return items.filter((entry) => !(entry.mediaType === item.mediaType && entry.id === item.id));
  }
  return [item, ...items].slice(0, WATCHLIST_MAX_ITEMS);
}

/** Recorte por tipo na página da lista (D-67). */
export type WatchlistMedia = "all" | MediaType;

/** Ordenações da página da lista (D-67). "recent" é a ordem em que os itens são guardados. */
export const WATCHLIST_SORTS = ["recent", "oldest", "title", "rating", "release"] as const;
export type WatchlistSort = (typeof WATCHLIST_SORTS)[number];

export function isWatchlistSort(value: string | null | undefined): value is WatchlistSort {
  return (WATCHLIST_SORTS as readonly string[]).includes(value ?? "");
}

export function filterWatchlist(
  items: readonly WatchlistItem[],
  media: WatchlistMedia,
): WatchlistItem[] {
  return media === "all" ? [...items] : items.filter((item) => item.mediaType === media);
}

export function countWatchlist(items: readonly WatchlistItem[]): Record<WatchlistMedia, number> {
  const movie = items.filter((item) => item.mediaType === "movie").length;
  return { all: items.length, movie, tv: items.length - movie };
}

const byTitle = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });

/**
 * Ordena sem alterar a lista guardada. Itens sem nota ou sem data ficam por último nas
 * ordenações que dependem delas; empates caem no título e, por fim, na posição original,
 * para a ordem ser sempre a mesma.
 */
export function sortWatchlist(
  items: readonly WatchlistItem[],
  sort: WatchlistSort,
): WatchlistItem[] {
  const indexed = items.map((item, index) => ({ item, index }));
  const tie = (a: (typeof indexed)[number], b: (typeof indexed)[number]) =>
    byTitle.compare(a.item.title, b.item.title) || a.index - b.index;

  indexed.sort((a, b) => {
    switch (sort) {
      case "recent":
        return b.item.addedAt - a.item.addedAt || a.index - b.index;
      case "oldest":
        return a.item.addedAt - b.item.addedAt || b.index - a.index;
      case "title":
        return tie(a, b);
      case "rating": {
        const ra = a.item.voteAverage;
        const rb = b.item.voteAverage;
        if (ra === null || rb === null) return ra === rb ? tie(a, b) : ra === null ? 1 : -1;
        return rb - ra || tie(a, b);
      }
      case "release": {
        const da = a.item.date;
        const db = b.item.date;
        if (!da || !db) return da === db ? tie(a, b) : da ? -1 : 1;
        return db.localeCompare(da) || tie(a, b);
      }
    }
  });
  return indexed.map(({ item }) => item);
}

/** Remove um item, devolvendo também a posição dele, para o "Desfazer" (D-67). */
export function removeWatchlistItem(
  items: readonly WatchlistItem[],
  mediaType: MediaType,
  id: number,
): { items: WatchlistItem[]; index: number } {
  const index = items.findIndex((entry) => entry.mediaType === mediaType && entry.id === id);
  if (index === -1) return { items: [...items], index };
  return { items: [...items.slice(0, index), ...items.slice(index + 1)], index };
}

/**
 * Desfaz uma remoção: devolve só aquele item, no lugar em que estava. Outras remoções
 * ou inclusões feitas depois continuam valendo (restaurar uma cópia da lista inteira as
 * desfaria também). Se o item já voltou à lista, nada muda.
 */
export function reinsertWatchlistItem(
  items: readonly WatchlistItem[],
  item: WatchlistItem,
  index: number,
): WatchlistItem[] {
  if (isInWatchlist(items, item.mediaType, item.id)) return [...items];
  // A lista fica do mais recente ao mais antigo: o lugar certo é antes do primeiro item
  // salvo antes dele. A posição numérica de origem pode ter mudado com outras remoções,
  // então só vale para itens antigos, guardados sem a data de inclusão.
  const byDate = item.addedAt > 0 ? items.findIndex((entry) => entry.addedAt < item.addedAt) : -2;
  const position =
    byDate === -2
      ? Math.min(Math.max(index, 0), items.length)
      : byDate === -1
        ? items.length
        : byDate;
  return [...items.slice(0, position), item, ...items.slice(position)].slice(
    0,
    WATCHLIST_MAX_ITEMS,
  );
}
