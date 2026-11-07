export const MAX_CAST = 8;
export const MAX_RELATED = 6;

/**
 * Usa as recomendações do TMDB e, quando estiverem vazias, os filmes semelhantes.
 */
export function pickRelatedMovies(movie, limit = MAX_RELATED) {
  const recommendations = movie?.recommendations?.results ?? [];
  const similar = movie?.similar?.results ?? [];
  const source = recommendations.length > 0 ? recommendations : similar;
  return source.filter((item) => item?.id && item.id !== movie?.id).slice(0, limit);
}

const DIRECTOR_JOBS = ["Director"];
const WRITER_JOBS = ["Screenplay", "Writer", "Story", "Novel", "Author"];

/** Lista nomes únicos da equipe técnica para as funções informadas, na ordem do TMDB. */
export function pickCrewNames(credits, jobs, limit = 3) {
  const crew = Array.isArray(credits?.crew) ? credits.crew : [];
  const names = [];

  for (const person of crew) {
    if (!jobs.includes(person?.job) || !person.name || names.includes(person.name)) continue;
    names.push(person.name);
    if (names.length === limit) break;
  }

  return names;
}

export function pickDirectors(credits) {
  return pickCrewNames(credits, DIRECTOR_JOBS, 2);
}

export function pickWriters(credits) {
  return pickCrewNames(credits, WRITER_JOBS, 3);
}
