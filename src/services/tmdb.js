import { buildTmdbUrl } from "./tmdbUrl.js";
import { getTmdbErrorMessage, NETWORK_ERROR_MESSAGE } from "./tmdbErrors.js";

/**
 * Endereços públicos do TMDB. As variáveis de ambiente continuam aceitas para
 * permitir outro proxy/base, mas apenas VITE_API_KEY é obrigatória.
 */
const DEFAULT_ENDPOINTS = {
  movie: "https://api.themoviedb.org/3/movie/",
  search: "https://api.themoviedb.org/3/search/movie",
  discover: "https://api.themoviedb.org/3/discover/movie",
  genres: "https://api.themoviedb.org/3/genre/movie/list",
  poster: "https://image.tmdb.org/t/p/w500",
  backdrop: "https://image.tmdb.org/t/p/w1280",
  logo: "https://image.tmdb.org/t/p/w92",
};

const env = import.meta.env;

export const TMDB_ENDPOINTS = Object.freeze({
  movie: env.VITE_API || DEFAULT_ENDPOINTS.movie,
  search: env.VITE_SEARCH || DEFAULT_ENDPOINTS.search,
  discover: env.VITE_DISCOVER || DEFAULT_ENDPOINTS.discover,
  genres: env.VITE_GENRES || DEFAULT_ENDPOINTS.genres,
});

const IMAGE_BASE_URLS = Object.freeze({
  poster: env.VITE_IMG || DEFAULT_ENDPOINTS.poster,
  backdrop: env.VITE_BACKDROP || DEFAULT_ENDPOINTS.backdrop,
  logo: DEFAULT_ENDPOINTS.logo,
});

export async function fetchTmdb(endpoint, { params = {}, signal } = {}) {
  const url = buildTmdbUrl({
    baseUrl: TMDB_ENDPOINTS.movie,
    endpoint,
    apiKey: env.VITE_API_KEY,
    params,
  });

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (requestError) {
    if (requestError?.name === "AbortError") throw requestError;
    throw new Error(NETWORK_ERROR_MESSAGE, { cause: requestError });
  }

  if (!response.ok) {
    throw new Error(getTmdbErrorMessage(response.status));
  }

  const data = await response.json();
  if (data?.success === false) {
    throw new Error(getTmdbErrorMessage(response.status));
  }

  return data;
}

function joinImageUrl(baseUrl, path) {
  if (!path || !baseUrl) return null;
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function getPosterUrl(path) {
  return joinImageUrl(IMAGE_BASE_URLS.poster, path);
}

export function getBackdropUrl(path) {
  return joinImageUrl(IMAGE_BASE_URLS.backdrop, path);
}

export function getLogoUrl(path) {
  return joinImageUrl(IMAGE_BASE_URLS.logo, path);
}
