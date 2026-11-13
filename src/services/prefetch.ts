/**
 * Pré-carregamento por rota (D-41): os loaders do React Router disparam as mesmas
 * consultas que as páginas vão fazer, em paralelo com o download do código da página.
 * O cache de src/services/tmdb.ts entrega a resposta ao hook, sem repetir a requisição.
 * Nada aqui bloqueia a navegação: os loaders devolvem null na hora.
 */
import { readDiscoverFilters, readDiscoverMedia } from "../lib/discover";
import { normalizePage } from "../lib/pagination";
import {
  discoverMovies,
  discoverTv,
  getCollection,
  getMovieDetails,
  getMovieGenres,
  getMovieList,
  getPersonDetails,
  getPopularPeople,
  getTvDetails,
  getTvGenres,
  getTvSeason,
  prefetch,
  PREFETCH,
  searchMovies,
  searchPeople,
  searchTv,
} from "./tmdb";

function searchParamsOf(request: Request): URLSearchParams {
  return new URL(request.url).searchParams;
}

export function prefetchHome(): null {
  // Só o que aparece na primeira tela: o destaque, a faixa "Em alta" e os gêneros do
  // destaque. As seções abaixo da dobra buscam seus dados quando chegam perto da tela.
  prefetch(getMovieList("popular", 1, PREFETCH));
  prefetch(getMovieGenres(PREFETCH));
  return null;
}

const isId = (id: string | undefined): id is string => Boolean(id && /^\d+$/.test(id));
/** Número de temporada válido (0 = especiais), com o mesmo limite do proxy. */
export const isSeasonNumber = (value: string | undefined): value is string =>
  Boolean(value && /^\d{1,3}$/.test(value));

export function prefetchTv(id: string | undefined): null {
  if (isId(id)) prefetch(getTvDetails(id, PREFETCH));
  return null;
}

/** Temporada e a série dona dela (nome, fundo e lista de temporadas para navegar). */
export function prefetchSeason(id: string | undefined, season: string | undefined): null {
  if (isId(id) && isSeasonNumber(season)) {
    prefetch(getTvDetails(id, PREFETCH));
    prefetch(getTvSeason(id, season, PREFETCH));
  }
  return null;
}

export function prefetchPerson(id: string | undefined): null {
  if (isId(id)) prefetch(getPersonDetails(id, PREFETCH));
  return null;
}

export function prefetchCollection(id: string | undefined): null {
  if (isId(id)) prefetch(getCollection(id, PREFETCH));
  return null;
}

export function prefetchPeople(request: Request): null {
  const page = normalizePage(searchParamsOf(request).get("page") ?? "1");
  prefetch(getPopularPeople(page, PREFETCH));
  return null;
}

export function prefetchMovie(id: string | undefined): null {
  if (id && /^\d+$/.test(id)) prefetch(getMovieDetails(id, PREFETCH));
  return null;
}

/** Categoria ativa da busca, lida de `?tipo=` (filmes por padrão). */
export type SearchCategory = "movies" | "series" | "people";

export function readSearchCategory(params: URLSearchParams): SearchCategory {
  const tipo = params.get("tipo");
  return tipo === "series" ? "series" : tipo === "pessoas" ? "people" : "movies";
}

export function prefetchSearch(request: Request): null {
  const params = searchParamsOf(request);
  const query = (params.get("q") ?? "").trim();
  if (!query) {
    prefetch(getMovieList("popular", 1, PREFETCH));
    return null;
  }

  // As três categorias são consultadas para mostrar a contagem de cada uma; a página
  // da URL vale só para a categoria ativa.
  const category = readSearchCategory(params);
  const page = normalizePage(params.get("page") ?? "1");
  prefetch(searchMovies(query, category === "movies" ? page : 1, PREFETCH));
  prefetch(searchTv(query, category === "series" ? page : 1, PREFETCH));
  prefetch(searchPeople(query, category === "people" ? page : 1, PREFETCH));
  return null;
}

export function prefetchDiscover(request: Request): null {
  const params = searchParamsOf(request);
  const filters = readDiscoverFilters(params);
  const page = normalizePage(params.get("page") ?? "1");

  if (readDiscoverMedia(params) === "tv") {
    prefetch(getTvGenres(PREFETCH));
    prefetch(discoverTv(filters, page, PREFETCH));
  } else {
    prefetch(getMovieGenres(PREFETCH));
    prefetch(discoverMovies(filters, page, PREFETCH));
  }
  return null;
}
