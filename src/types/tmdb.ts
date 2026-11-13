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
  /** Presente quando o item vem de uma série convertida para card (lib/media.ts). */
  media_type?: "movie" | "tv";
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
  /** Datas de lançamento e classificação por país (`append_to_response=release_dates`). */
  release_dates?: ReleaseDatesResponse;
  belongs_to_collection?: CollectionSummary | null;
  homepage?: string | null;
  production_companies?: Company[];
  production_countries?: { iso_3166_1: string; name: string }[];
  images?: ImageSet;
  external_ids?: ExternalIds;
}

/** Imagem do TMDB (`append_to_response=images`). */
export interface ImageItem {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  iso_639_1?: string | null;
  vote_average?: number;
}

export interface ImageSet {
  backdrops?: ImageItem[];
  posters?: ImageItem[];
  profiles?: ImageItem[];
}

/** Identificadores em outros sites (`append_to_response=external_ids`). */
export interface ExternalIds {
  imdb_id?: string | null;
  wikidata_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
  tiktok_id?: string | null;
  youtube_id?: string | null;
}

export interface Company {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface CollectionSummary {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

/** Coleção ou franquia (`collection/{id}`). */
export interface CollectionDetails extends CollectionSummary {
  overview?: string;
  parts: MovieSummary[];
}

/** Série como aparece em listas. */
export interface TvSummary {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  popularity?: number;
  origin_country?: string[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count?: number;
  air_date?: string | null;
  poster_path: string | null;
  overview?: string;
  vote_average?: number;
}

export interface EpisodeSummary {
  id: number;
  name: string;
  air_date?: string | null;
  episode_number: number;
  season_number: number;
}

/** Episódio como vem na temporada (`tv/{id}/season/{n}`). */
export interface Episode {
  id: number;
  name: string;
  overview?: string;
  episode_number: number;
  season_number: number;
  air_date?: string | null;
  runtime?: number | null;
  still_path: string | null;
  vote_average?: number;
  vote_count?: number;
  episode_type?: string;
}

/** Temporada completa, com todos os episódios. */
export interface SeasonDetails {
  id: number;
  name: string;
  overview?: string;
  season_number: number;
  air_date?: string | null;
  poster_path: string | null;
  vote_average?: number;
  episodes: Episode[];
}

/** Elenco somado de todas as temporadas (`aggregate_credits`). */
export interface AggregateCastMember {
  id: number;
  name: string;
  profile_path: string | null;
  roles: { credit_id: string; character: string; episode_count: number }[];
  total_episode_count: number;
  order?: number;
}

export interface AggregateCrewMember {
  id: number;
  name: string;
  profile_path: string | null;
  department: string;
  jobs: { credit_id: string; job: string; episode_count: number }[];
  total_episode_count: number;
}

export interface TvDetails extends TvSummary {
  tagline?: string | null;
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  status?: string;
  type?: string;
  in_production?: boolean;
  last_air_date?: string | null;
  next_episode_to_air?: EpisodeSummary | null;
  original_language?: string;
  homepage?: string | null;
  created_by?: { id: number; name: string; profile_path: string | null }[];
  networks?: Company[];
  seasons?: Season[];
  aggregate_credits?: { cast: AggregateCastMember[]; crew: AggregateCrewMember[] };
  videos?: { results: Video[] };
  recommendations?: Paginated<TvSummary>;
  similar?: Paginated<TvSummary>;
  "watch/providers"?: WatchProvidersResponse;
  content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
  images?: ImageSet;
  external_ids?: ExternalIds;
}

/** Pessoa como aparece em listas (populares e busca). */
export interface PersonSummary {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  popularity?: number;
  known_for?: ((MovieSummary & { media_type: "movie" }) | (TvSummary & { media_type: "tv" }))[];
}

/** Crédito de uma pessoa em filme ou série (`combined_credits`). */
export interface PersonCredit {
  id: number;
  credit_id: string;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  /** Atuação. */
  character?: string;
  episode_count?: number;
  /** Equipe técnica. */
  job?: string;
  department?: string;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  profile_path: string | null;
  known_for_department?: string;
  also_known_as?: string[];
  homepage?: string | null;
  imdb_id?: string | null;
  combined_credits?: { cast: PersonCredit[]; crew: PersonCredit[] };
  images?: ImageSet;
  external_ids?: ExternalIds;
}

/** Tipo de lançamento no TMDB: 1 pré-estreia, 2 limitado, 3 cinema, 4 digital, 5 mídia física, 6 TV. */
export interface ReleaseDate {
  certification: string;
  type: number;
  release_date?: string;
  note?: string;
  iso_639_1?: string;
  descriptors?: string[];
}

export interface ReleaseDatesResponse {
  results: { iso_3166_1: string; release_dates: ReleaseDate[] }[];
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
