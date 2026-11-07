export const TMDB_PROXY_PATH = "/api/tmdb";

/**
 * Monta a URL do proxy interno (/api/tmdb). A chave do TMDB é adicionada no
 * servidor; o navegador informa apenas o endpoint e os parâmetros.
 */
export function buildTmdbProxyUrl(path, params = {}, origin = "http://localhost") {
  const normalizedPath = String(path ?? "").replace(/^\/+|\/+$/g, "");
  if (!normalizedPath) {
    throw new Error("Informe o endpoint do TMDB.");
  }

  const url = new URL(TMDB_PROXY_PATH, origin);
  url.searchParams.set("path", normalizedPath);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return `${url.pathname}${url.search}`;
}
