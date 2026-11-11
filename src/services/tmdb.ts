/**
 * Única porta de saída para a API do TMDB.
 * Chama apenas o proxy interno /api/tmdb/...: a URL real e a chave existem só no servidor.
 */
import { messages } from "../i18n";
import { buildDiscoverParams, type DiscoverFilters } from "../lib/discover";
import { normalizePage } from "../lib/pagination";
import type {
  Genre,
  GenreList,
  MovieDetails,
  MovieSummary,
  Paginated,
  WatchProvidersResponse,
} from "../types/tmdb";

export const TMDB_PROXY_BASE = "/api/tmdb";
const LANGUAGE = "pt-BR";
const REGION = "BR";

export type TmdbErrorCode = keyof typeof messages.errors;

/** Erro da integração com o TMDB, com mensagem pronta para a interface. */
export class TmdbError extends Error {
  readonly code: TmdbErrorCode;
  readonly status: number | null;

  constructor(code: TmdbErrorCode, status: number | null = null, options?: ErrorOptions) {
    super(messages.errors[code], options);
    this.name = "TmdbError";
    this.code = code;
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Traduz o status HTTP (e o código do proxy, quando houver) num código de erro. */
export function errorCodeFromResponse(status: number, payloadCode?: unknown): TmdbErrorCode {
  if (payloadCode === "missing_server_key") return "missingServerKey";
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "notFound";
  if (status === 400 || status === 422) return "invalidRequest";
  if (status === 429) return "rateLimited";
  if (status === 502 || status === 504) return "upstream";
  if (status >= 500) return "unavailable";
  return "unknown";
}

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

interface RequestOptions {
  signal?: AbortSignal | undefined;
}

/** Monta a URL do proxy. Termos de busca são sempre codificados via URLSearchParams. */
export function buildProxyUrl(path: string, params: QueryParams = {}): string {
  const segments = path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));

  if (segments.length === 0) throw new Error("Endpoint do TMDB não informado.");

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }

  const query = search.toString();
  return `${TMDB_PROXY_BASE}/${segments.join("/")}${query ? `?${query}` : ""}`;
}

async function request<T>(
  path: string,
  params: QueryParams,
  { signal }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildProxyUrl(path, params), {
      headers: { Accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new TmdbError("network", null, { cause: error });
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Respostas sem JSON são tratadas pelo status.
  }

  const body =
    typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;

  if (!response.ok || body?.success === false) {
    throw new TmdbError(errorCodeFromResponse(response.status, body?.code), response.status);
  }

  if (!body) throw new TmdbError("invalidResponse", response.status);
  return body as T;
}

const withLocale = (params: QueryParams = {}): QueryParams => ({ language: LANGUAGE, ...params });
const withRegion = (params: QueryParams = {}): QueryParams => ({
  ...withLocale(params),
  region: REGION,
});

const emptyPage = (): Paginated<MovieSummary> => ({
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
});

export type MovieListKind = "top_rated" | "popular" | "now_playing";

/** Listas fixas do TMDB (melhores avaliados, populares, em cartaz). */
export function getMovieList(
  kind: MovieListKind,
  page = 1,
  options?: RequestOptions,
): Promise<Paginated<MovieSummary>> {
  return request(`movie/${kind}`, withRegion({ page: normalizePage(page) }), options);
}

/** Busca por título. Termo vazio não gera requisição. */
export async function searchMovies(
  query: string,
  page = 1,
  options?: RequestOptions,
): Promise<Paginated<MovieSummary>> {
  const term = query.trim();
  if (!term) return emptyPage();

  return request(
    "search/movie",
    withRegion({ query: term, include_adult: false, page: normalizePage(page) }),
    options,
  );
}

/** Descoberta com filtros (gênero, ordenação, ano, nota mínima). */
export function discoverMovies(
  filters: Partial<DiscoverFilters>,
  page = 1,
  options?: RequestOptions,
): Promise<Paginated<MovieSummary>> {
  return request("discover/movie", withRegion(buildDiscoverParams(filters, page)), options);
}

export async function getMovieGenres(options?: RequestOptions): Promise<Genre[]> {
  const data = await request<GenreList>("genre/movie/list", withLocale(), options);
  return data.genres;
}

/**
 * Detalhes, elenco, vídeos e recomendações numa única chamada (`append_to_response`).
 * Vídeos em português, inglês e sem idioma: sem isso muitos filmes ficam sem trailer.
 */
export function getMovieDetails(
  id: number | string,
  options?: RequestOptions,
): Promise<MovieDetails> {
  return request(
    `movie/${String(id)}`,
    withLocale({
      include_video_language: "pt,en,null",
      append_to_response: "credits,videos,recommendations,similar",
    }),
    options,
  );
}

export function getMovieWatchProviders(
  id: number | string,
  options?: RequestOptions,
): Promise<WatchProvidersResponse> {
  return request(`movie/${String(id)}/watch/providers`, {}, options);
}
