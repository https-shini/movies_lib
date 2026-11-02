export function buildDiscoverParams({ genre, sort, year, minRating, page = 1 }) {
  return {
    language: "pt-BR",
    include_adult: false,
    sort_by: sort || "popularity.desc",
    with_genres: genre || undefined,
    primary_release_year: year || undefined,
    "vote_average.gte": minRating || undefined,
    page: Math.max(1, Number.parseInt(page, 10) || 1),
  };
}
