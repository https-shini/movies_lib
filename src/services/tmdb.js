import { buildTmdbProxyUrl } from "./tmdbUrl.js";
import { getTmdbErrorMessage, NETWORK_ERROR_MESSAGE } from "./tmdbErrors.js";

/** Imagens do TMDB são públicas e não exigem chave. */
const IMAGE_BASE_URLS = Object.freeze({
  poster: "https://image.tmdb.org/t/p/w500",
  backdrop: "https://image.tmdb.org/t/p/w1280",
  logo: "https://image.tmdb.org/t/p/w92",
});

/**
 * Consulta o TMDB através do proxy /api/tmdb.
 * @param {string} path Endpoint do TMDB, por exemplo "movie/popular".
 */
export async function fetchTmdb(path, { params = {}, signal } = {}) {
  const url = buildTmdbProxyUrl(path, params);

  let response;
  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (requestError) {
    if (requestError?.name === "AbortError") throw requestError;
    throw new Error(NETWORK_ERROR_MESSAGE, { cause: requestError });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Respostas sem JSON são tratadas pelo status HTTP.
  }

  if (!response.ok || data?.success === false) {
    throw new Error(getTmdbErrorMessage(response.status, data?.code));
  }

  if (data === null) {
    throw new Error(getTmdbErrorMessage(502));
  }

  return data;
}

function joinImageUrl(baseUrl, path) {
  if (!path) return null;
  return `${baseUrl}/${String(path).replace(/^\//, "")}`;
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
