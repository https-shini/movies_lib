/**
 * Pré-carregamento por rota (D-41): os loaders do React Router disparam as mesmas
 * consultas que as páginas vão fazer, em paralelo com o download do código da página.
 * O cache de src/services/tmdb.ts entrega a resposta ao hook, sem repetir a requisição.
 * Nada aqui bloqueia a navegação: os loaders devolvem null na hora.
 */
import { readDiscoverFilters } from "../lib/discover";
import { normalizePage } from "../lib/pagination";
import {
  discoverMovies,
  getMovieDetails,
  getMovieGenres,
  getMovieList,
  prefetch,
  PREFETCH,
  searchMovies,
} from "./tmdb";

function searchParamsOf(request: Request): URLSearchParams {
  return new URL(request.url).searchParams;
}

export function prefetchHome(): null {
  prefetch(getMovieList("popular", 1, PREFETCH));
  prefetch(getMovieList("top_rated", 1, PREFETCH));
  prefetch(getMovieList("now_playing", 1, PREFETCH));
  prefetch(getMovieGenres(PREFETCH));
  return null;
}

export function prefetchMovie(id: string | undefined): null {
  if (id && /^\d+$/.test(id)) prefetch(getMovieDetails(id, PREFETCH));
  return null;
}

export function prefetchSearch(request: Request): null {
  const params = searchParamsOf(request);
  const query = (params.get("q") ?? "").trim();
  if (query) {
    prefetch(searchMovies(query, normalizePage(params.get("page") ?? "1"), PREFETCH));
  } else {
    prefetch(getMovieList("popular", 1, PREFETCH));
  }
  return null;
}

export function prefetchDiscover(request: Request): null {
  const params = searchParamsOf(request);
  prefetch(getMovieGenres(PREFETCH));
  prefetch(
    discoverMovies(readDiscoverFilters(params), normalizePage(params.get("page") ?? "1"), PREFETCH),
  );
  return null;
}
