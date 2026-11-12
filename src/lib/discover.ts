import { messages } from "../i18n";
import { normalizePage } from "./pagination";

export type DiscoverSort =
  "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | "revenue.desc";

export interface DiscoverFilters {
  /** ID do gênero no TMDB, ou "" para todos. */
  genre: string;
  sort: DiscoverSort;
  /** Ano com quatro dígitos, ou "". */
  year: string;
  /** Nota mínima de 0 a 10 com ponto decimal, ou "". */
  minRating: string;
}

export type DiscoverParams = Record<string, string | number | boolean>;

export const DISCOVER_SORT_OPTIONS: readonly { value: DiscoverSort; label: string }[] = [
  { value: "popularity.desc", label: messages.discover.sort.popularity },
  { value: "vote_average.desc", label: messages.discover.sort.rating },
  { value: "primary_release_date.desc", label: messages.discover.sort.releaseDate },
  { value: "revenue.desc", label: messages.discover.sort.revenue },
];

export const DEFAULT_SORT: DiscoverSort = "popularity.desc";
export const DEFAULT_DISCOVER_FILTERS: Readonly<DiscoverFilters> = {
  genre: "",
  sort: DEFAULT_SORT,
  year: "",
  minRating: "",
};

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

/**
 * Sem um número mínimo de votos, a ordenação por nota retorna títulos obscuros
 * com uma única avaliação 10.
 */
export const MIN_VOTES_FOR_RATING_SORT = 200;
export const MIN_VOTES_FOR_RATING_FILTER = 50;

const SORT_VALUES = new Set<string>(DISCOVER_SORT_OPTIONS.map(({ value }) => value));

const asText = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : "";

function sanitizeGenre(value: unknown): string {
  const genre = asText(value);
  return /^\d+$/.test(genre) ? genre : "";
}

function sanitizeSort(value: unknown): DiscoverSort {
  const sort = asText(value);
  return SORT_VALUES.has(sort) ? (sort as DiscoverSort) : DEFAULT_SORT;
}

function sanitizeYear(value: unknown): string {
  const year = asText(value);
  if (!/^\d{4}$/.test(year)) return "";

  const numericYear = Number(year);
  return numericYear >= MIN_YEAR && numericYear <= MAX_YEAR ? year : "";
}

function sanitizeRating(value: unknown): string {
  const raw = asText(value).replace(",", ".");
  if (!raw) return "";

  const rating = Number(raw);
  if (!Number.isFinite(rating) || rating <= 0) return "";
  return String(Math.min(rating, 10));
}

/** Normaliza filtros vindos da URL ou do formulário. */
export function sanitizeDiscoverFilters(
  filters: Partial<Record<keyof DiscoverFilters, unknown>> = {},
): DiscoverFilters {
  return {
    genre: sanitizeGenre(filters.genre),
    sort: sanitizeSort(filters.sort),
    year: sanitizeYear(filters.year),
    minRating: sanitizeRating(filters.minRating),
  };
}

/** Lê os filtros aplicados a partir dos parâmetros da URL. */
export function readDiscoverFilters(searchParams: URLSearchParams): DiscoverFilters {
  return sanitizeDiscoverFilters({
    genre: searchParams.get("genre"),
    sort: searchParams.get("sort"),
    year: searchParams.get("year"),
    minRating: searchParams.get("minRating"),
  });
}

/** Converte filtros em parâmetros de URL, omitindo valores padrão. */
export function toDiscoverSearchParams(filters: Partial<DiscoverFilters>): URLSearchParams {
  const sanitized = sanitizeDiscoverFilters(filters);
  const params = new URLSearchParams();

  if (sanitized.genre) params.set("genre", sanitized.genre);
  if (sanitized.sort !== DEFAULT_SORT) params.set("sort", sanitized.sort);
  if (sanitized.year) params.set("year", sanitized.year);
  if (sanitized.minRating) params.set("minRating", sanitized.minRating);

  return params;
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parâmetros do endpoint `discover/movie` para os filtros informados.
 * Idioma e região são acrescentados pela camada de serviço.
 */
export function buildDiscoverParams(
  filters: Partial<DiscoverFilters>,
  page: unknown = 1,
  { today = new Date() }: { today?: Date } = {},
): DiscoverParams {
  const { genre, sort, year, minRating } = sanitizeDiscoverFilters(filters);
  const params: DiscoverParams = {
    include_adult: false,
    sort_by: sort,
    page: normalizePage(page),
  };

  if (genre) params.with_genres = genre;
  if (year) params.primary_release_year = year;

  if (minRating) {
    params["vote_average.gte"] = minRating;
    params["vote_count.gte"] = MIN_VOTES_FOR_RATING_FILTER;
  }

  if (sort === "vote_average.desc") {
    params["vote_count.gte"] = MIN_VOTES_FOR_RATING_SORT;
  }

  if (sort === "primary_release_date.desc") {
    // Evita listar títulos anunciados para datas futuras como "lançamentos".
    params["primary_release_date.lte"] = formatIsoDate(today);
  }

  return params;
}

/** Tipo de obra em Descobrir: filmes (padrão) ou séries (`?tipo=series`). */
export type DiscoverMedia = "movie" | "tv";

export function readDiscoverMedia(searchParams: URLSearchParams): DiscoverMedia {
  return searchParams.get("tipo") === "series" ? "tv" : "movie";
}

/** Parâmetros da URL de Descobrir para um tipo de obra e seus filtros. */
export function toDiscoverUrlParams(
  media: DiscoverMedia,
  filters: Partial<DiscoverFilters>,
): URLSearchParams {
  const params = toDiscoverSearchParams(media === "tv" ? sanitizeTvFilters(filters) : filters);
  if (media === "tv") params.set("tipo", "series");
  return params;
}

/** Séries não têm bilheteria: essa ordenação cai para "Mais populares". */
export const TV_SORT_OPTIONS = DISCOVER_SORT_OPTIONS.filter(
  ({ value }) => value !== "revenue.desc",
);

export function sanitizeTvFilters(filters: Partial<DiscoverFilters>): DiscoverFilters {
  const sanitized = sanitizeDiscoverFilters(filters);
  return sanitized.sort === "revenue.desc" ? { ...sanitized, sort: DEFAULT_SORT } : sanitized;
}

/**
 * Parâmetros do endpoint `discover/tv`: os mesmos filtros de filmes, traduzidos para os
 * campos de séries (data de estreia no lugar da data de lançamento).
 */
export function buildTvDiscoverParams(
  filters: Partial<DiscoverFilters>,
  page: unknown = 1,
  { today = new Date() }: { today?: Date } = {},
): DiscoverParams {
  const { genre, sort, year, minRating } = sanitizeTvFilters(filters);
  const params: DiscoverParams = {
    include_adult: false,
    sort_by: sort === "primary_release_date.desc" ? "first_air_date.desc" : sort,
    page: normalizePage(page),
  };

  if (genre) params.with_genres = genre;
  if (year) params.first_air_date_year = year;

  if (minRating) {
    params["vote_average.gte"] = minRating;
    params["vote_count.gte"] = MIN_VOTES_FOR_RATING_FILTER;
  }
  if (sort === "vote_average.desc") params["vote_count.gte"] = MIN_VOTES_FOR_RATING_SORT;
  if (sort === "primary_release_date.desc") params["first_air_date.lte"] = formatIsoDate(today);

  return params;
}
