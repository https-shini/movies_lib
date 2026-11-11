import { useCallback } from "react";
import { getMovieDetails } from "../services/tmdb";
import type { MovieDetails } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

/** Detalhes, elenco, vídeos e recomendações de um filme (uma única requisição). */
export function useMovie(id: number | string): AsyncState<MovieDetails> {
  const loader = useCallback((signal: AbortSignal) => getMovieDetails(id, { signal }), [id]);
  return useAsync(loader);
}
