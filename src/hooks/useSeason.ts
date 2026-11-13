import { useCallback } from "react";
import { getTvDetails, getTvSeason } from "../services/tmdb";
import type { SeasonDetails, TvDetails } from "../types/tmdb";
import { useAsync, type AsyncState } from "./useAsync";

export interface SeasonPageData {
  show: TvDetails;
  season: SeasonDetails;
}

/**
 * Temporada com os episódios e a série dona dela. Os detalhes da série normalmente já estão
 * no cache do cliente (a pessoa chega pela página da série), então custam zero requisições.
 */
export function useSeason(id: string, season: string): AsyncState<SeasonPageData> {
  const loader = useCallback(
    async (signal: AbortSignal) => {
      const [show, details] = await Promise.all([
        getTvDetails(id, { signal }),
        getTvSeason(id, season, { signal }),
      ]);
      return { show, season: details };
    },
    [id, season],
  );
  return useAsync(loader);
}
