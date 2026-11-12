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
