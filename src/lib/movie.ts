import type {
  Credits,
  MovieDetails,
  MovieSummary,
  ReleaseDatesResponse,
  Video,
} from "../types/tmdb";

/** O prompt do projeto define até 10 nomes no elenco principal. */
export const MAX_CAST = 10;
export const MAX_RELATED = 6;

/** Recomendações do TMDB; quando vierem vazias, usa os filmes semelhantes. */
export function pickRelatedMovies(
  movie: Pick<MovieDetails, "id" | "recommendations" | "similar"> | null | undefined,
  limit = MAX_RELATED,
): MovieSummary[] {
  const recommendations = movie?.recommendations?.results ?? [];
  const similar = movie?.similar?.results ?? [];
  const source = recommendations.length > 0 ? recommendations : similar;
  return source.filter((item) => item.id !== movie?.id).slice(0, limit);
}

const DIRECTOR_JOBS = ["Director"];
const WRITER_JOBS = ["Screenplay", "Writer", "Story", "Novel", "Author"];

/** Nomes únicos da equipe técnica para as funções informadas, na ordem do TMDB. */
export function pickCrewNames(
  credits: Pick<Credits, "crew"> | null | undefined,
  jobs: readonly string[],
  limit = 3,
): string[] {
  const names: string[] = [];

  for (const person of credits?.crew ?? []) {
    if (!jobs.includes(person.job) || !person.name || names.includes(person.name)) continue;
    names.push(person.name);
    if (names.length === limit) break;
  }

  return names;
}

export function pickDirectors(credits: Pick<Credits, "crew"> | null | undefined): string[] {
  return pickCrewNames(credits, DIRECTOR_JOBS, 2);
}

export function pickWriters(credits: Pick<Credits, "crew"> | null | undefined): string[] {
  return pickCrewNames(credits, WRITER_JOBS, 3);
}

/**
 * Chave do melhor trailer do YouTube: oficial e em português primeiro, depois
 * oficial em qualquer idioma, depois qualquer trailer disponível.
 */
export function getYouTubeTrailerKey(videos: readonly Video[] | null | undefined): string | null {
  const score = (video: Video) => (video.official ? 2 : 0) + (video.iso_639_1 === "pt" ? 1 : 0);

  const [trailer] = (videos ?? [])
    .filter((video) => video.site === "YouTube" && video.type === "Trailer" && video.key)
    .map((video, index) => ({ video, index }))
    .sort((a, b) => score(b.video) - score(a.video) || a.index - b.index);

  return trailer ? trailer.video.key : null;
}

/** Link do trailer no YouTube. */
export function getYouTubeWatchUrl(key: string | null | undefined): string | null {
  return key ? `https://www.youtube.com/watch?v=${encodeURIComponent(key)}` : null;
}

/** Player incorporado sem cookies de rastreamento até a reprodução. */
export function getYouTubeEmbedUrl(key: string | null | undefined): string | null {
  return key
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&rel=0&modestbranding=1`
    : null;
}

/** Faixas da classificação indicativa brasileira (ClassInd), como o TMDB as informa. */
export const BRAZILIAN_RATINGS = ["L", "10", "12", "14", "16", "18"] as const;
export type BrazilianRating = (typeof BRAZILIAN_RATINGS)[number];

/** Ordem de preferência entre os tipos de lançamento: cinema, digital, mídia física e os demais. */
const RELEASE_TYPE_PRIORITY = [3, 4, 5, 2, 1, 6];

const isBrazilianRating = (value: string): value is BrazilianRating =>
  (BRAZILIAN_RATINGS as readonly string[]).includes(value);

/**
 * Classificação indicativa do Brasil. Lê só a entrada `BR`: a classificação de outro país
 * (ex.: "R" dos EUA) nunca é usada no lugar. `null` quando o TMDB não informa.
 */
export function getBrazilianRating(
  releaseDates: ReleaseDatesResponse | null | undefined,
): BrazilianRating | null {
  const brazil = releaseDates?.results.find((entry) => entry.iso_3166_1 === "BR");
  if (!brazil) return null;

  const candidates = brazil.release_dates
    .map((release) => ({ type: release.type, rating: release.certification.trim().toUpperCase() }))
    .filter((release): release is { type: number; rating: BrazilianRating } =>
      isBrazilianRating(release.rating),
    )
    .sort((a, b) => {
      const rank = (type: number) => {
        const index = RELEASE_TYPE_PRIORITY.indexOf(type);
        return index === -1 ? RELEASE_TYPE_PRIORITY.length : index;
      };
      return rank(a.type) - rank(b.type);
    });

  return candidates[0]?.rating ?? null;
}
