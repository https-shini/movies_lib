import { normalizePage } from "./pagination.js";

export const DISCOVER_SORT_OPTIONS = Object.freeze([
  { value: "popularity.desc", label: "Mais populares" },
  { value: "vote_average.desc", label: "Melhor avaliados" },
  { value: "primary_release_date.desc", label: "Lançamentos recentes" },
  { value: "revenue.desc", label: "Maior bilheteria" },
]);

export const DEFAULT_SORT = "popularity.desc";
export const DEFAULT_DISCOVER_FILTERS = Object.freeze({
  genre: "",
  sort: DEFAULT_SORT,
  year: "",
  minRating: "",
});

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

/**
 * Sem um número mínimo de votos, a ordenação por nota retorna títulos obscuros
 * com uma única avaliação 10. Os limites seguem a mesma ideia do site do TMDB.
 */
export const MIN_VOTES_FOR_RATING_SORT = 200;
export const MIN_VOTES_FOR_RATING_FILTER = 50;

const SORT_VALUES = new Set(DISCOVER_SORT_OPTIONS.map(({ value }) => value));

function sanitizeGenre(value) {
  const genre = String(value ?? "").trim();
  return /^\d+$/.test(genre) ? genre : "";
}

function sanitizeSort(value) {
  return SORT_VALUES.has(value) ? value : DEFAULT_SORT;
}

function sanitizeYear(value) {
  const year = String(value ?? "").trim();
  if (!/^\d{4}$/.test(year)) return "";

  const numericYear = Number(year);
  return numericYear >= MIN_YEAR && numericYear <= MAX_YEAR ? year : "";
}

function sanitizeRating(value) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return "";

  const rating = Number(raw);
  if (!Number.isFinite(rating) || rating <= 0) return "";
  return String(Math.min(rating, 10));
}

/** Normaliza filtros vindos da URL ou do formulário. */
export function sanitizeDiscoverFilters(filters = {}) {
  return {
    genre: sanitizeGenre(filters.genre),
    sort: sanitizeSort(filters.sort),
    year: sanitizeYear(filters.year),
    minRating: sanitizeRating(filters.minRating),
  };
}

/** Lê os filtros aplicados a partir de URLSearchParams. */
export function readDiscoverFilters(searchParams) {
  return sanitizeDiscoverFilters({
    genre: searchParams.get("genre"),
    sort: searchParams.get("sort"),
    year: searchParams.get("year"),
    minRating: searchParams.get("minRating"),
  });
}

/** Converte filtros em parâmetros de URL, omitindo valores padrão. */
export function toDiscoverSearchParams(filters) {
  const sanitized = sanitizeDiscoverFilters(filters);
  const params = new URLSearchParams();

  if (sanitized.genre) params.set("genre", sanitized.genre);
  if (sanitized.sort !== DEFAULT_SORT) params.set("sort", sanitized.sort);
  if (sanitized.year) params.set("year", sanitized.year);
  if (sanitized.minRating) params.set("minRating", sanitized.minRating);

  return params;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDiscoverParams({ page = 1, ...filters } = {}, { today = new Date() } = {}) {
  const { genre, sort, year, minRating } = sanitizeDiscoverFilters(filters);
  const params = {
    language: "pt-BR",
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
