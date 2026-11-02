/**
 * Monta URLs do TMDB sem acoplar a lógica às variáveis de ambiente do Vite.
 */
export function buildTmdbUrl({ baseUrl, endpoint, apiKey, params = {} }) {
  if (!baseUrl || !endpoint) {
    throw new Error("Configure VITE_API e os endpoints do TMDB no arquivo .env.");
  }

  if (!apiKey) {
    throw new Error("A chave do TMDB não foi configurada. Defina VITE_API_KEY no arquivo .env.");
  }

  let url;
  try {
    url = new URL(endpoint, baseUrl);
  } catch {
    throw new Error("A URL do TMDB é inválida. Verifique VITE_API e VITE_SEARCH.");
  }

  const normalizedKey = String(apiKey).replace(/^[?&]/, "");
  const keyParams = new URLSearchParams(normalizedKey);

  if (normalizedKey.includes("=")) {
    for (const [key, value] of keyParams.entries()) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
  } else if (!url.searchParams.has("api_key")) {
    url.searchParams.set("api_key", normalizedKey);
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}
