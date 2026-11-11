import type { Credits, MovieDetails, MovieSummary, Video } from "../types/tmdb";

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
