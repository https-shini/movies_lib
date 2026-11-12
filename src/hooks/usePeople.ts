import { useCallback } from "react";
import { getPopularPeople, searchPeople } from "../services/tmdb";
import type { Paginated, PersonSummary } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

/** Pessoas populares ou encontradas pelo nome. Busca vazia não gera requisição. */
export function usePeople(query: string | null, page = 1): AsyncState<Paginated<PersonSummary>> {
  const loader = useCallback(
    (signal: AbortSignal) =>
      query === null ? getPopularPeople(page, { signal }) : searchPeople(query, page, { signal }),
    [query, page],
  );
  return useAsync(loader);
}
