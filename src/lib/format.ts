import { interpolate, locale, messages } from "../i18n";

const CURRENCY_FORMATTER = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
const COMPACT_FORMATTER = new Intl.NumberFormat(locale, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/** Valores em dólar no padrão brasileiro: "US$ 160.000.000". */
export function formatCurrency(amount: number | null | undefined): string {
  return isPositiveNumber(amount) ? CURRENCY_FORMATTER.format(amount) : messages.format.notInformed;
}

/** Duração no formato "2h 15min", "45min" ou "2h". */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!isPositiveNumber(minutes)) return messages.format.notInformed;

  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);

  if (hours === 0) return interpolate(messages.format.minutes, { minutes: rest });
  if (rest === 0) return interpolate(messages.format.hours, { hours });
  return interpolate(messages.format.hoursAndMinutes, { hours, minutes: rest });
}

/**
 * Nota do TMDB com uma casa decimal ("8.7"), conforme a identidade visual.
 * Retorna null quando não há nota válida, para a interface omitir o selo.
 */
export function formatRating(rating: number | null | undefined): string | null {
  if (typeof rating !== "number" || !Number.isFinite(rating) || rating <= 0 || rating > 10) {
    return null;
  }
  return rating.toFixed(1);
}

/** Data de lançamento por extenso: "15 de outubro de 1999". */
export function formatReleaseDate(value: string | null | undefined): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return messages.format.notInformed;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? messages.format.notInformed : DATE_FORMATTER.format(date);
}

/** Ano de lançamento ("1999") ou null. */
export function getReleaseYear(value: string | null | undefined): string | null {
  return typeof value === "string" && /^\d{4}/.test(value) ? value.slice(0, 4) : null;
}

/** Contagens grandes de forma compacta: 33263 → "33,3 mil". */
export function formatCompactNumber(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? COMPACT_FORMATTER.format(value)
    : "0";
}

let languageNames: Intl.DisplayNames | null = null;

/** Converte códigos ISO 639-1 (ex.: "en") no nome do idioma: "Inglês". */
export function formatLanguage(code: string | null | undefined): string {
  if (typeof code !== "string" || !/^[a-z]{2,3}$/i.test(code)) return messages.format.notInformed;

  try {
    languageNames ??= new Intl.DisplayNames([locale], { type: "language" });
    const name = languageNames.of(code.toLowerCase());
    if (!name || name.toLowerCase() === code.toLowerCase()) return code.toUpperCase();
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return code.toUpperCase();
  }
}

/**
 * O texto, ou `fallback` quando ele vier vazio. O TMDB devolve `""` (e não `null`) para
 * campos sem tradução, como sinopse e personagem, então `??` não bastaria.
 */
export function textOr(value: string | null | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

/** Classificação indicativa: "Livre", "14 anos" ou "Não informada" (nunca a de outro país). */
export function formatAgeRating(rating: string | null): string {
  if (rating === null) return messages.movie.ageRatingMissing;
  return rating === "L"
    ? messages.movie.ageRatingFree
    : interpolate(messages.movie.ageRatingYears, { age: rating });
}
