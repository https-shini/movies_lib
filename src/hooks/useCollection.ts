import { useCallback } from "react";
import { getCollection } from "../services/tmdb";
import type { CollectionDetails } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

/** Coleção ou franquia com todos os filmes. */
export function useCollection(id: number | string): AsyncState<CollectionDetails> {
  const loader = useCallback((signal: AbortSignal) => getCollection(id, { signal }), [id]);
  return useAsync(loader);
}
