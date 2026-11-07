import { getMovieGenres } from "../services/tmdb";
import type { Genre } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

const loadGenres = (signal: AbortSignal) => getMovieGenres({ signal });

/** Lista de gêneros de filmes em português. */
export function useGenres(): AsyncState<Genre[]> {
  return useAsync(loadGenres);
}
