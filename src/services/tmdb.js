const API_BASE_URL = import.meta.env.VITE_API;
const API_KEY_CONFIG = import.meta.env.VITE_API_KEY;

function appendApiKey(url) {
  if (!API_KEY_CONFIG) {
    throw new Error("A chave do TMDB não foi configurada. Defina VITE_API_KEY no arquivo .env.");
  }

  const normalizedKey = API_KEY_CONFIG.replace(/^[?&]/, "");
  const keyParams = new URLSearchParams(normalizedKey);

  if (normalizedKey.includes("=")) {
    for (const [key, value] of keyParams.entries()) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
  } else if (!url.searchParams.has("api_key")) {
    url.searchParams.set("api_key", normalizedKey);
  }
}

export async function fetchTmdb(endpoint, { params = {}, signal } = {}) {
  if (!endpoint || !API_BASE_URL) {
    throw new Error("Configure VITE_API e os endpoints do TMDB no arquivo .env.");
  }

  let url;
  try {
    url = new URL(endpoint, API_BASE_URL);
  } catch {
    throw new Error("A URL do TMDB é inválida. Verifique VITE_API e VITE_SEARCH.");
  }

  appendApiKey(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, { signal });
  if (!response.ok) {
    let message = `Não foi possível consultar o TMDB (HTTP ${response.status}).`;
    try {
      const payload = await response.json();
      if (payload.status_message) message = payload.status_message;
    } catch { /* Mantém a mensagem HTTP. */ }
    throw new Error(message);
  }

  const data = await response.json();
  if (data.success === false) throw new Error(data.status_message || "O TMDB recusou a solicitação.");
  return data;
}

export function getPosterUrl(path) {
  const imageBaseUrl = import.meta.env.VITE_IMG;
  if (!path || !imageBaseUrl) return null;
  return `${imageBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
