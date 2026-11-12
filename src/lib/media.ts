import type { MovieSummary, TvSummary } from "../types/tmdb";

/**
 * Séries usam os mesmos cards, grades e faixas dos filmes. A conversão troca os campos
 * de série pelos equivalentes de filme e marca o tipo, que decide o link e o selo do card.
 */
export function fromTv(show: TvSummary): MovieSummary {
  return {
    id: show.id,
    title: show.name,
    ...(show.original_name ? { original_title: show.original_name } : {}),
    ...(show.overview ? { overview: show.overview } : {}),
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path ?? null,
    ...(show.first_air_date ? { release_date: show.first_air_date } : {}),
    ...(show.vote_average !== undefined ? { vote_average: show.vote_average } : {}),
    ...(show.vote_count !== undefined ? { vote_count: show.vote_count } : {}),
    ...(show.genre_ids ? { genre_ids: show.genre_ids } : {}),
    ...(show.popularity !== undefined ? { popularity: show.popularity } : {}),
    media_type: "tv",
  };
}

export type MediaType = "movie" | "tv";

/** Endereço da página de um filme ou de uma série. */
export function mediaPath(mediaType: MediaType | undefined, id: number | string): string {
  return mediaType === "tv" ? `/serie/${String(id)}` : `/movie/${String(id)}`;
}

export const personPath = (id: number | string): string => `/pessoa/${String(id)}`;
export const collectionPath = (id: number | string): string => `/colecao/${String(id)}`;
