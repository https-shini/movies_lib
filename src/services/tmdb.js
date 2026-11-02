import { buildTmdbUrl } from "./tmdbUrl.js";

const API_BASE_URL = import.meta.env.VITE_API;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function fetchTmdb(endpoint, { params = {}, signal } = {}) {
  const url = buildTmdbUrl({
    baseUrl: API_BASE_URL,
    endpoint,
    apiKey: API_KEY,
    params,
  });

  const response = await fetch(url, { signal });

  if (!response.ok) {
    let message = `Não foi possível consultar o TMDB (HTTP ${response.status}).`;

    try {
      const payload = await response.json();
      if (payload.status_message) message = payload.status_message;
    } catch {
      // Mantém a mensagem HTTP quando a resposta não contém JSON.
    }

    throw new Error(message);
  }

  const data = await response.json();
  if (data.success === false) {
    throw new Error(data.status_message || "O TMDB recusou a solicitação.");
  }

  return data;
}

export function getPosterUrl(path) {
  const imageBaseUrl = import.meta.env.VITE_IMG;
  if (!path || !imageBaseUrl) return null;

  return `${imageBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function getBackdropUrl(path) {
  const imageBaseUrl = import.meta.env.VITE_BACKDROP;
  if (!path || !imageBaseUrl) return null;

  return `${imageBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
