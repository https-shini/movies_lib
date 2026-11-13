/**
 * Proxy do TMDB executado no servidor (função da Vercel e servidor local do Vite).
 * A chave fica apenas no servidor em TMDB_API_KEY e nunca chega ao navegador.
 */

export const TMDB_API_BASE_URL = "https://api.themoviedb.org/3/";
/** Prefixo público do proxy. O endpoint do TMDB vem logo depois: /api/tmdb/movie/550 */
export const PROXY_PREFIX = "/api/tmdb";
const UPSTREAM_TIMEOUT_MS = 8000;

/** Somente os endpoints usados pela aplicação podem ser acessados pelo proxy. */
interface ProxyRoute {
  pattern: RegExp;
  /** Tempo de cache na CDN, em segundos. */
  maxAge: number;
}

/** Tempos de cache na CDN da Vercel por tipo de dado (D-19). */
export const CACHE_SECONDS = {
  reference: 24 * 60 * 60, // gêneros e configuração
  list: 60 * 60, // listas e descoberta
  details: 6 * 60 * 60, // detalhes de filmes, séries, pessoas e coleções
  search: 10 * 60, // busca por texto
} as const;

const ROUTES: readonly ProxyRoute[] = [
  { pattern: /^movie\/(popular|top_rated|now_playing)$/, maxAge: CACHE_SECONDS.list },
  { pattern: /^movie\/\d{1,10}$/, maxAge: CACHE_SECONDS.details },
  { pattern: /^movie\/\d{1,10}\/watch\/providers$/, maxAge: CACHE_SECONDS.details },
  { pattern: /^tv\/popular$/, maxAge: CACHE_SECONDS.list },
  { pattern: /^tv\/\d{1,10}$/, maxAge: CACHE_SECONDS.details },
  // Temporada com a lista de episódios (D-61). Até 3 dígitos: nenhuma série passa disso.
  { pattern: /^tv\/\d{1,10}\/season\/\d{1,3}$/, maxAge: CACHE_SECONDS.details },
  { pattern: /^person\/popular$/, maxAge: CACHE_SECONDS.list },
  { pattern: /^person\/\d{1,10}$/, maxAge: CACHE_SECONDS.details },
  { pattern: /^collection\/\d{1,10}$/, maxAge: CACHE_SECONDS.details },
  { pattern: /^search\/(movie|tv|person)$/, maxAge: CACHE_SECONDS.search },
  { pattern: /^discover\/(movie|tv)$/, maxAge: CACHE_SECONDS.list },
  { pattern: /^genre\/(movie|tv)\/list$/, maxAge: CACHE_SECONDS.reference },
];

/** Parâmetros aceitos e repassados ao TMDB. Qualquer outro é descartado. */
const ALLOWED_PARAMS = new Set([
  "language",
  "region",
  "page",
  "query",
  "include_adult",
  "sort_by",
  "with_genres",
  "primary_release_year",
  "primary_release_date.lte",
  "first_air_date_year",
  "first_air_date.lte",
  "vote_average.gte",
  "vote_count.gte",
  "append_to_response",
  "include_video_language",
  "include_image_language",
]);

const ALLOWED_APPENDS = new Set([
  "credits",
  "videos",
  "recommendations",
  "similar",
  "watch/providers",
  "release_dates",
  "images",
  "external_ids",
  "aggregate_credits",
  "content_ratings",
  "combined_credits",
]);
const MAX_PARAM_LENGTH = 200;

export class TmdbProxyError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface UpstreamRequest {
  url: URL;
  headers: Record<string, string>;
  maxAge: number;
}

function findRoute(path: string): ProxyRoute | null {
  return ROUTES.find(({ pattern }) => pattern.test(path)) ?? null;
}

function isBearerToken(apiKey: string): boolean {
  return /^eyJ[\w-]*\.[\w-]+\.[\w-]+$/.test(apiKey);
}

/** Valida a requisição recebida e monta a chamada ao TMDB. */
export function buildUpstreamRequest({
  path,
  searchParams,
  apiKey,
}: {
  path: string | null | undefined;
  searchParams: URLSearchParams;
  apiKey: string | undefined;
}): UpstreamRequest {
  const normalizedPath = (path ?? "").replace(/^\/+|\/+$/g, "");
  const route = findRoute(normalizedPath);

  if (!route) {
    throw new TmdbProxyError(404, "unknown_endpoint", "Endpoint do TMDB não permitido.");
  }

  if (!apiKey) {
    throw new TmdbProxyError(
      500,
      "missing_server_key",
      "TMDB_API_KEY não está configurada no servidor.",
    );
  }

  const url = new URL(normalizedPath, TMDB_API_BASE_URL);
  for (const [key, value] of searchParams) {
    if (!ALLOWED_PARAMS.has(key) || value.length > MAX_PARAM_LENGTH) continue;

    if (key === "append_to_response") {
      const appends = value.split(",").filter((item) => ALLOWED_APPENDS.has(item));
      if (appends.length) url.searchParams.set(key, appends.join(","));
      continue;
    }

    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = apiKey.trim();
  if (isBearerToken(key)) {
    headers.Authorization = `Bearer ${key}`;
  } else {
    url.searchParams.set("api_key", key);
  }

  return { url, headers, maxAge: route.maxAge };
}

/**
 * Endpoint do TMDB pedido pelo cliente. Formato principal: /api/tmdb/movie/550.
 * Também aceita /api/tmdb?path=movie/550 (formato anterior).
 */
export function extractTmdbPath(url: URL): string | null {
  const prefix = `${PROXY_PREFIX}/`;
  if (url.pathname.startsWith(prefix)) {
    try {
      return url.pathname
        .slice(prefix.length)
        .split("/")
        .map((segment) => decodeURIComponent(segment))
        .join("/");
    } catch {
      return null;
    }
  }
  return url.searchParams.get("path");
}

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

interface ProxyOptions {
  apiKey: string | undefined;
  fetchImpl?: typeof fetch;
}

/** Atende GET /api/tmdb/<endpoint>?<parâmetros>. */
export async function handleTmdbProxy(
  request: Request,
  { apiKey, fetchImpl = fetch }: ProxyOptions,
): Promise<Response> {
  if (request.method !== "GET") {
    return json({ code: "method_not_allowed", status_message: "Método não permitido." }, 405, {
      Allow: "GET",
      "Cache-Control": "no-store",
    });
  }

  const requestUrl = new URL(request.url);
  const searchParams = new URLSearchParams(requestUrl.searchParams);
  const path = extractTmdbPath(requestUrl);
  searchParams.delete("path");

  let upstream: UpstreamRequest;
  try {
    upstream = buildUpstreamRequest({ path, searchParams, apiKey });
  } catch (error) {
    if (error instanceof TmdbProxyError) {
      return json({ code: error.code, status_message: error.message }, error.status, {
        "Cache-Control": "no-store",
      });
    }
    throw error;
  }

  let response: Response;
  try {
    response = await fetchImpl(upstream.url, {
      headers: upstream.headers,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return json(
      { code: "upstream_unavailable", status_message: "Não foi possível conectar ao TMDB." },
      502,
      { "Cache-Control": "no-store" },
    );
  }

  const body = await response.text();
  const cacheControl = response.ok
    ? `public, max-age=60, s-maxage=${upstream.maxAge}, stale-while-revalidate=${upstream.maxAge}`
    : "no-store";

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}
