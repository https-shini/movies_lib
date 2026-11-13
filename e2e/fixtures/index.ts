/**
 * Respostas simuladas do TMDB usadas pelos testes E2E.
 *
 * Os JSON seguem os tipos de src/types/tmdb.ts: a anotação de tipo abaixo faz o
 * `npm run typecheck` falhar se uma fixture deixar de corresponder ao modelo real.
 * Os pôsteres e fotos apontam para caminhos fictícios; as imagens são substituídas
 * por um PNG local durante os testes.
 */
import type {
  CollectionDetails,
  Genre,
  GenreList,
  MovieDetails,
  MovieSummary,
  Paginated,
  PersonDetails,
  PersonSummary,
  SeasonDetails,
  TvDetails,
  TvSummary,
} from "../../src/types/tmdb.ts";
import collection2344Json from "./collection-2344.json" with { type: "json" };
import discoverPage1Json from "./discover-page-1.json" with { type: "json" };
import discoverPage2Json from "./discover-page-2.json" with { type: "json" };
import emptyPageJson from "./empty-page.json" with { type: "json" };
import genresJson from "./genres.json" with { type: "json" };
import movie550Json from "./movie-550.json" with { type: "json" };
import moviesJson from "./movies.json" with { type: "json" };
import peopleJson from "./people.json" with { type: "json" };
import person287Json from "./person-287.json" with { type: "json" };
import person7467EnJson from "./person-7467-en.json" with { type: "json" };
import person7467Json from "./person-7467.json" with { type: "json" };
import searchPersonBradJson from "./search-person-brad.json" with { type: "json" };
import searchTvDunaJson from "./search-tv-duna.json" with { type: "json" };
import searchDunaPage1Json from "./search-duna-page-1.json" with { type: "json" };
import searchDunaPage2Json from "./search-duna-page-2.json" with { type: "json" };
import tmdb404Json from "./tmdb-404.json" with { type: "json" };
import tv1396Json from "./tv-1396.json" with { type: "json" };
import tv1396Season1Json from "./tv-1396-season-1.json" with { type: "json" };
import tvGenresJson from "./tv-genres.json" with { type: "json" };
import tvJson from "./tv.json" with { type: "json" };

type MoviePage = Paginated<MovieSummary>;

export const genres: GenreList = genresJson;
/** Lista usada em populares, mais bem avaliados e em cartaz (12 filmes, 1 página). */
export const movies: MoviePage = moviesJson;
export const emptyPage: MoviePage = emptyPageJson;
/** Busca "duna": 3 resultados em 2 páginas. */
export const searchDuna: Record<1 | 2, MoviePage> = {
  1: searchDunaPage1Json,
  2: searchDunaPage2Json,
};
/** Descoberta: 18 resultados em 3 páginas (a página 3 repete a 2). */
export const discover: Record<1 | 2, MoviePage> = {
  1: discoverPage1Json,
  2: discoverPage2Json,
};
/**
 * Clube da Luta (550) com elenco, equipe, trailer oficial em português, recomendações e
 * onde assistir (`watch/providers`), como chega numa única consulta de detalhes.
 */
export const movie550: MovieDetails = movie550Json;
/** Séries populares e descoberta de séries (6 séries, 1 página). */
export const tvShows: Paginated<TvSummary> = tvJson;
export const tvGenres: GenreList = tvGenresJson;
/** Busca de séries por "duna": 1 resultado. */
export const searchTvDuna: Paginated<TvSummary> = searchTvDunaJson;
/** Breaking Bad (1396) com temporadas, elenco de todas as temporadas, vídeos e imagens. */
export const tv1396: TvDetails = tv1396Json;
/**
 * Breaking Bad, temporada 1: 7 episódios; o 3 sem imagem, o 5 sem sinopse e o 7 marcado
 * como final da temporada.
 */
export const tv1396Season1: SeasonDetails = tv1396Season1Json;
/** Pessoas populares: 6 na página 1, de 2 páginas. */
export const people = peopleJson as Paginated<PersonSummary>;
/** Busca de pessoas por "brad": 1 resultado. */
export const searchPersonBrad = searchPersonBradJson as Paginated<PersonSummary>;
/** Brad Pitt (287): biografia em português, filmografia de ator e produtor e fotos. */
export const person287 = person287Json as PersonDetails;
/** David Fincher (7467): sem biografia em português; a versão em inglês vem à parte. */
export const person7467 = person7467Json as PersonDetails;
export const person7467English = person7467EnJson as PersonDetails;
/** Coleção Matrix (2344), com os filmes fora da ordem de lançamento. */
export const collection2344: CollectionDetails = collection2344Json;
/** Corpo de erro no formato do TMDB para recursos inexistentes. */
export const tmdbNotFound = tmdb404Json;

function first<T>(items: readonly T[], label: string): T {
  const [item] = items;
  if (item === undefined) throw new Error(`Fixture vazia: ${label}`);
  return item;
}

/** Primeiro filme dos populares: o destaque da página inicial. */
export const FEATURED_MOVIE = first(movies.results, "movies.json");

const allSummaries: readonly MovieSummary[] = [
  ...movies.results,
  ...searchDuna[1].results,
  ...searchDuna[2].results,
];

/** Filme que aparece em alguma lista das fixtures. */
export function findMovie(id: number): MovieSummary | undefined {
  return allSummaries.find((movie) => movie.id === id);
}

/**
 * Detalhes mínimos para filmes que só existem nas listas: os campos do resumo, os
 * gêneros por nome e nenhum elenco, trailer ou recomendação. O Clube da Luta (550)
 * tem uma fixture completa própria.
 */
export function detailsFrom(summary: MovieSummary): MovieDetails {
  const genreList: Genre[] = genres.genres.filter(({ id }) => summary.genre_ids?.includes(id));
  return {
    ...summary,
    tagline: null,
    runtime: null,
    genres: genreList,
    credits: { cast: [], crew: [] },
    videos: { results: [] },
    recommendations: { ...emptyPage },
    similar: { ...emptyPage },
    "watch/providers": { results: {} },
    release_dates: { results: [] },
    // Matrix (603) faz parte de uma coleção, para testar o caminho filme → coleção.
    ...(summary.id === 603
      ? {
          belongs_to_collection: {
            id: collection2344.id,
            name: collection2344.name,
            poster_path: collection2344.poster_path,
            backdrop_path: collection2344.backdrop_path,
          },
        }
      : {}),
  };
}
