import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DiscoverFilters } from "../lib/discover";
import { getTotalPages } from "../lib/pagination";
import { fromTv } from "../lib/media";
import {
  discoverMovies,
  discoverTv,
  getMovieList,
  getPopularTv,
  isAbortError,
  searchMovies,
  searchTv,
  type MovieListKind,
  type TmdbErrorCode,
} from "../services/tmdb";
import type { MovieSummary, Paginated, TvSummary } from "../types/tmdb";
import { toAsyncError, type AsyncError } from "./useAsync";

/**
 * De onde vêm os itens da lista: filmes ou séries (convertidas para o formato dos cards).
 * `null` significa "nada a carregar" (ex.: busca vazia).
 */
export type MovieSource =
  | { kind: "list"; list: MovieListKind }
  | { kind: "search"; query: string }
  | { kind: "discover"; filters: Partial<DiscoverFilters> }
  | { kind: "tvPopular" }
  | { kind: "tvSearch"; query: string }
  | { kind: "tvDiscover"; filters: Partial<DiscoverFilters> };

const asCards = (data: Paginated<TvSummary>): Paginated<MovieSummary> => ({
  ...data,
  results: data.results.map(fromTv),
});

export function fetchMoviePage(
  source: MovieSource,
  page: number,
  signal: AbortSignal,
): Promise<Paginated<MovieSummary>> {
  switch (source.kind) {
    case "list":
      return getMovieList(source.list, page, { signal });
    case "search":
      return searchMovies(source.query, page, { signal });
    case "discover":
      return discoverMovies(source.filters, page, { signal });
    case "tvPopular":
      return getPopularTv(page, { signal }).then(asCards);
    case "tvSearch":
      return searchTv(source.query, page, { signal }).then(asCards);
    case "tvDiscover":
      return discoverTv(source.filters, page, { signal }).then(asCards);
  }
}

/** Junta páginas sem repetir filmes (o TMDB pode repetir itens entre páginas). */
export function mergeMovies(current: MovieSummary[], next: MovieSummary[]): MovieSummary[] {
  const seen = new Set(current.map((movie) => movie.id));
  return [...current, ...next.filter((movie) => !seen.has(movie.id))];
}

interface ListState {
  movies: MovieSummary[];
  page: number;
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: AsyncError | null;
  loadMoreError: AsyncError | null;
}

const LOADING_STATE: ListState = {
  movies: [],
  page: 0,
  totalPages: 0,
  totalResults: 0,
  isLoading: true,
  isLoadingMore: false,
  error: null,
  loadMoreError: null,
};

const IDLE_STATE: ListState = { ...LOADING_STATE, isLoading: false };

export interface MoviesResult {
  movies: MovieSummary[];
  page: number;
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  /** Erro do carregamento inicial (mensagem pronta para a interface). */
  error: string;
  errorCode: TmdbErrorCode | null;
  /** Erro ao carregar a próxima página; a lista já exibida é mantida. */
  loadMoreError: string;
  loadMore: () => void;
  reload: () => void;
}

/**
 * Lista paginada de filmes com "Carregar mais".
 * Recarrega do início quando a origem (lista, termo de busca ou filtros) muda.
 */
export function useMovies(source: MovieSource | null, { initialPage = 1 } = {}): MoviesResult {
  const sourceKey = source ? JSON.stringify(source) : null;
  const stableSource = useMemo<MovieSource | null>(
    () => (sourceKey ? (JSON.parse(sourceKey) as MovieSource) : null),
    [sourceKey],
  );

  const [state, setState] = useState<ListState>(LOADING_STATE);
  const [attempt, setAttempt] = useState(0);
  const stateRef = useRef(state);
  const moreController = useRef<AbortController | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!stableSource) return undefined;

    const controller = new AbortController();
    moreController.current?.abort();

    async function loadFirstPage(origin: MovieSource) {
      setState(LOADING_STATE);
      try {
        const data = await fetchMoviePage(origin, initialPage, controller.signal);
        if (controller.signal.aborted) return;
        setState({
          ...IDLE_STATE,
          movies: data.results,
          page: data.page,
          totalPages: getTotalPages(data),
          totalResults: data.total_results,
        });
      } catch (cause) {
        if (controller.signal.aborted || isAbortError(cause)) return;
        setState({ ...IDLE_STATE, error: toAsyncError(cause) });
      }
    }

    void loadFirstPage(stableSource);
    return () => {
      controller.abort();
    };
  }, [stableSource, initialPage, attempt]);

  useEffect(
    () => () => {
      moreController.current?.abort();
    },
    [],
  );

  const loadMore = useCallback(() => {
    const current = stateRef.current;
    if (!stableSource || current.isLoading || current.isLoadingMore) return;
    if (current.page >= current.totalPages) return;

    const controller = new AbortController();
    moreController.current?.abort();
    moreController.current = controller;
    const nextPage = current.page + 1;

    setState((previous) => ({ ...previous, isLoadingMore: true, loadMoreError: null }));

    fetchMoviePage(stableSource, nextPage, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState((previous) => ({
          ...previous,
          movies: mergeMovies(previous.movies, data.results),
          page: data.page,
          totalPages: getTotalPages(data),
          totalResults: data.total_results,
          isLoadingMore: false,
        }));
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted || isAbortError(cause)) return;
        setState((previous) => ({
          ...previous,
          isLoadingMore: false,
          loadMoreError: toAsyncError(cause),
        }));
      });
  }, [stableSource]);

  const reload = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const view = stableSource ? state : IDLE_STATE;

  return {
    movies: view.movies,
    page: view.page,
    totalPages: view.totalPages,
    totalResults: view.totalResults,
    isLoading: view.isLoading,
    isLoadingMore: view.isLoadingMore,
    hasMore: view.page > 0 && view.page < view.totalPages,
    error: view.error?.message ?? "",
    errorCode: view.error?.code ?? null,
    loadMoreError: view.loadMoreError?.message ?? "",
    loadMore,
    reload,
  };
}
