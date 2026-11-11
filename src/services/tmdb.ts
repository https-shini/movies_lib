/**
 * Única porta de saída para a API do TMDB.
 * Chama apenas o proxy interno /api/tmdb/...: a URL real e a chave existem só no servidor.
 */
import { messages } from "../i18n";
import { buildDiscoverParams, type DiscoverFilters } from "../lib/discover";
import { normalizePage } from "../lib/pagination";
import type { Genre, GenreList, MovieDetails, MovieSummary, Paginated } from "../types/tmdb";

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
  /** Pré-carregamento de rota: não cancelável, e um erro fica guardado para a página. */
  prefetch?: boolean;
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

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" }, signal });
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

/**
 * Cache em memória das respostas do proxy (D-41):
 * - pedidos iguais em andamento compartilham a mesma requisição;
 * - só respostas bem-sucedidas ficam guardadas, por CLIENT_CACHE_TTL_MS;
 * - erros não ficam guardados, então "Tentar novamente" sempre consulta de novo. A única
 *   exceção é o erro de um pré-carregamento que ninguém esperava: ele fica guardado por
 *   PREFETCH_ERROR_TTL_MS para a página recebê-lo, em vez de repetir a requisição na hora;
 * - a requisição só é cancelada quando todos os interessados desistem.
 */
export const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
export const PREFETCH_ERROR_TTL_MS = 10 * 1000;
const CLIENT_CACHE_MAX_ENTRIES = 100;

interface CacheEntry {
  promise: Promise<unknown>;
  controller: AbortController;
  settled: boolean;
  /** Erro de um pré-carregamento ainda não entregue a nenhuma página. */
  failed: boolean;
  expiresAt: number;
  /** Interessados que ainda podem desistir (os que passaram um AbortSignal). */
  cancellable: number;
  /** Algum interessado sem AbortSignal mantém a requisição viva. */
  pinned: boolean;
  /** Só pré-carregamentos pediram esta URL até agora. */
  prefetchOnly: boolean;
}

const responseCache = new Map<string, CacheEntry>();

/** Esvazia o cache (testes). */
export function clearTmdbCache(): void {
  for (const entry of responseCache.values()) {
    if (!entry.settled) entry.controller.abort();
  }
  responseCache.clear();
}

const abortError = () => new DOMException("A requisição foi cancelada.", "AbortError");

function isUsable(entry: CacheEntry): boolean {
  const inFlight = !entry.settled && !entry.failed;
  return inFlight || entry.expiresAt > Date.now();
}

function getEntry(url: string, isPrefetch: boolean): CacheEntry {
  const existing = responseCache.get(url);
  if (existing && isUsable(existing)) {
    if (!isPrefetch) existing.prefetchOnly = false;
    return existing;
  }
  if (existing) responseCache.delete(url);

  const controller = new AbortController();
  const entry: CacheEntry = {
    promise: Promise.resolve(),
    controller,
    settled: false,
    failed: false,
    expiresAt: 0,
    cancellable: 0,
    pinned: false,
    prefetchOnly: isPrefetch,
  };
  entry.promise = fetchJson<unknown>(url, controller.signal).then(
    (data) => {
      entry.settled = true;
      entry.expiresAt = Date.now() + CLIENT_CACHE_TTL_MS;
      return data;
    },
    (error: unknown) => {
      if (entry.prefetchOnly && responseCache.get(url) === entry) {
        entry.failed = true;
        entry.expiresAt = Date.now() + PREFETCH_ERROR_TTL_MS;
      } else if (responseCache.get(url) === entry) {
        responseCache.delete(url);
      }
      throw error;
    },
  );
  // Evita "unhandled rejection" quando todos os interessados já desistiram.
  entry.promise.catch(() => undefined);

  responseCache.set(url, entry);
  if (responseCache.size > CLIENT_CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value;
    if (oldest !== undefined) responseCache.delete(oldest);
  }
  return entry;
}

function sharedRequest<T>(
  url: string,
  { signal, prefetch: isPrefetch = false }: RequestOptions,
): Promise<T> {
  if (signal?.aborted) return Promise.reject(abortError());

  const entry = getEntry(url, isPrefetch);
  // O erro guardado de um pré-carregamento é entregue uma única vez.
  if (entry.failed && !isPrefetch && responseCache.get(url) === entry) {
    responseCache.delete(url);
  }
  if (!signal) {
    entry.pinned = true;
    return entry.promise as Promise<T>;
  }

  entry.cancellable += 1;
  return new Promise<T>((resolve, reject) => {
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      entry.cancellable -= 1;
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      release();
      if (!entry.settled && !entry.pinned && entry.cancellable === 0) {
        entry.controller.abort();
        if (responseCache.get(url) === entry) responseCache.delete(url);
      }
      reject(abortError());
    };

    signal.addEventListener("abort", onAbort, { once: true });
    entry.promise.then(
      (data) => {
        release();
        resolve(data as T);
      },
      (error: unknown) => {
        release();
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

function request<T>(path: string, params: QueryParams, options: RequestOptions = {}): Promise<T> {
  return sharedRequest<T>(buildProxyUrl(path, params), options);
}

/** Opções das consultas disparadas pelos loaders das rotas. */
export const PREFETCH: RequestOptions = { prefetch: true };

/** Inicia uma consulta sem esperar o resultado (pré-carregamento das rotas). */
export function prefetch(promise: Promise<unknown>): void {
  promise.catch(() => undefined);
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

/** Complementos pedidos junto com os detalhes do filme. */
export const MOVIE_APPENDS = "credits,videos,recommendations,similar,watch/providers,release_dates";

/**
 * Detalhes, elenco, vídeos, recomendações, onde assistir e datas de lançamento por país
 * (com a classificação indicativa) numa única chamada
 * (`append_to_response`, D-41). Vídeos em português, inglês e sem idioma: sem isso
 * muitos filmes ficam sem trailer.
 */
export function getMovieDetails(
  id: number | string,
  options?: RequestOptions,
): Promise<MovieDetails> {
  return request(
    `movie/${String(id)}`,
    withLocale({
      include_video_language: "pt,en,null",
      append_to_response: MOVIE_APPENDS,
    }),
    options,
  );
}
