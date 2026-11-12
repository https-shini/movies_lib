import { useCallback } from "react";
import { getTvDetails } from "../services/tmdb";
import type { TvDetails } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

/** Série completa: temporadas, elenco, vídeos, imagens e onde assistir (uma requisição). */
export function useTv(id: number | string): AsyncState<TvDetails> {
  const loader = useCallback((signal: AbortSignal) => getTvDetails(id, { signal }), [id]);
  return useAsync(loader);
}
