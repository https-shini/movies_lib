import { useCallback } from "react";
import { getMovieWatchProviders } from "../services/tmdb";
import type { WatchProvidersResponse } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

/** Onde assistir (dados do JustWatch via TMDB). */
export function useWatchProviders(movieId: number | string): AsyncState<WatchProvidersResponse> {
  const loader = useCallback(
    (signal: AbortSignal) => getMovieWatchProviders(movieId, { signal }),
    [movieId],
  );
  return useAsync(loader);
}
