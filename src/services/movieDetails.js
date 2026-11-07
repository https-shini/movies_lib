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
