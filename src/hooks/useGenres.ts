import { useCallback } from "react";
import type { MediaType } from "../lib/media";
import { getMovieGenres, getTvGenres } from "../services/tmdb";
import type { Genre } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

/** Lista de gêneros de filmes (padrão) ou de séries, em português. */
export function useGenres(media: MediaType = "movie"): AsyncState<Genre[]> {
  const loader = useCallback(
    (signal: AbortSignal) =>
      media === "tv" ? getTvGenres({ signal }) : getMovieGenres({ signal }),
    [media],
  );
  return useAsync(loader);
}
