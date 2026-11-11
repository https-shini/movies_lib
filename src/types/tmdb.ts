/**
 * Tipos das respostas da API do TMDB usadas pelo Cinelux.
 * Campos opcionais refletem dados que o TMDB pode omitir ou devolver como null.
 */

export interface Paginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenreList {
  genres: Genre[];
}

/** Filme como aparece em listas (populares, busca, descoberta, recomendações). */
export interface MovieSummary {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  popularity?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  cast_id?: number;
  credit_id: string;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  credit_id: string;
  profile_path?: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name?: string;
  site: string;
  type: string;
  official?: boolean;
  iso_639_1?: string | null;
}

export interface MovieDetails extends MovieSummary {
  tagline?: string | null;
  runtime?: number | null;
  budget?: number;
  revenue?: number;
  genres?: Genre[];
  original_language?: string;
  imdb_id?: string | null;
  status?: string;
  credits?: Credits;
  videos?: { results: Video[] };
  recommendations?: Paginated<MovieSummary>;
  similar?: Paginated<MovieSummary>;
  /** Onde assistir, pedido junto com os detalhes (`append_to_response=watch/providers`). */
  "watch/providers"?: WatchProvidersResponse;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
}

export interface WatchProviderRegion {
  link?: string;
  flatrate?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProvidersResponse {
  id?: number;
  results: Partial<Record<string, WatchProviderRegion>>;
}
