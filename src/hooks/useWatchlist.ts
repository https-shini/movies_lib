import { useCallback, useSyncExternalStore } from "react";
import {
  isInWatchlist,
  parseWatchlist,
  toggleWatchlistItem,
  WATCHLIST_STORAGE_KEY,
  type WatchlistItem,
} from "../lib/watchlist";
import type { MediaType } from "../lib/media";

/**
 * "Minha lista" guardada só no navegador (localStorage), sem conta nem servidor.
 * As abas abertas ficam em sincronia pelo evento `storage`. Se o armazenamento não
 * estiver disponível (modo privado, bloqueio do navegador), a lista vale só para a aba.
 */
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedItems: WatchlistItem[] = [];
/** Reserva em memória quando o localStorage não pode ser usado. */
let memoryRaw: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
  } catch {
    return memoryRaw;
  }
}

function getSnapshot(): WatchlistItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parseWatchlist(raw);
  }
  return cachedItems;
}

const EMPTY: WatchlistItem[] = [];
const getServerSnapshot = () => EMPTY;

function write(items: readonly WatchlistItem[]): void {
  const raw = items.length ? JSON.stringify(items) : null;
  memoryRaw = raw;
  try {
    if (raw === null) window.localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    else window.localStorage.setItem(WATCHLIST_STORAGE_KEY, raw);
  } catch {
    // Sem armazenamento: a lista continua valendo nesta aba, pela reserva em memória.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === WATCHLIST_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export interface Watchlist {
  items: readonly WatchlistItem[];
  has: (mediaType: MediaType, id: number) => boolean;
  /** Salva ou remove; `addedAt` é preenchido aqui. */
  toggle: (item: Omit<WatchlistItem, "addedAt">) => void;
  clear: () => void;
  /** Volta a lista a um estado anterior (o "Desfazer" do aviso). */
  restore: (items: readonly WatchlistItem[]) => void;
}

export function useWatchlist(): Watchlist {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const has = useCallback(
    (mediaType: MediaType, id: number) => isInWatchlist(items, mediaType, id),
    [items],
  );
  const toggle = useCallback((item: Omit<WatchlistItem, "addedAt">) => {
    write(toggleWatchlistItem(getSnapshot(), { ...item, addedAt: Date.now() }));
  }, []);
  const clear = useCallback(() => {
    write([]);
  }, []);

  const restore = useCallback((previous: readonly WatchlistItem[]) => {
    write(previous);
  }, []);

  return { items, has, toggle, clear, restore };
}
