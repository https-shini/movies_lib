import { useCallback } from "react";
import { Link, useParams } from "react-router";
import { BsGraphUp, BsWallet2, BsHourglassSplit, BsCalendar3, BsCameraVideo } from "react-icons/bs";
import { fetchTmdb, getBackdropUrl, getPosterUrl } from "../services/tmdb";
import { useAsyncData } from "../hooks/useAsyncData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  formatCurrency,
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getYouTubeTrailer,
} from "../utils/formatters";
import AsyncState from "../components/AsyncState";
import MovieCard from "../components/MovieCard";
import WatchProviders from "../components/WatchProviders";
import { MAX_CAST, pickRelatedMovies } from "../services/movieDetails";
import NotFound from "./NotFound";
import "./Movie.css";

const MovieDetails = ({ id }) => {
  const loadMovie = useCallback(
    (signal) => fetchTmdb(id, {
      params: {
        language: "pt-BR",
        // Sem este parâmetro o TMDB só retorna vídeos em pt-BR, e muitos filmes ficam sem trailer.
        include_video_language: "pt,en,null",
        append_to_response: "credits,videos,recommendations,similar",
      },
      signal,
    }),
    [id],
  );
  const { data: movie, isLoading, error } = useAsyncData(loadMovie);
  useDocumentTitle(movie?.title || (isLoading ? "Carregando filme" : "Filme"));

  if (isLoading || error || !movie) {
    return (
      <main className="movie-page">
        <AsyncState isLoading={isLoading} error={error} isEmpty={!movie} emptyMessage="Não foi possível localizar este filme." />
        {error && <Link className="movie-page__back" to="/">Voltar para o início</Link>}
      </main>
    );
  }

  const backdrop = getBackdropUrl(movie.backdrop_path);
  const poster = getPosterUrl(movie.poster_path);
  const trailerUrl = getYouTubeTrailer(movie.videos?.results ?? []);
  const cast = movie.credits?.cast?.slice(0, MAX_CAST) ?? [];
  const recommendations = pickRelatedMovies(movie);
  const releaseYear = movie.release_date?.slice(0, 4);

  return (
    <main className="movie-page">
      <section
        className={`movie-hero ${backdrop ? "movie-hero--backdrop" : ""}`}
        style={backdrop ? { backgroundImage: `linear-gradient(90deg, rgba(8,10,15,.98) 0%, rgba(8,10,15,.88) 48%, rgba(8,10,15,.45) 100%), url("${backdrop}")` } : undefined}
      >
        <div className="movie-hero__content">
          {poster ? (
            <img className="movie-hero__poster" src={poster} alt={`Pôster de ${movie.title}`} />
          ) : (
            <div className="movie-hero__poster movie-hero__poster--empty">Pôster indisponível</div>
          )}

          <div className="movie-hero__details">
            <p className="movie-eyebrow">
              {releaseYear || "Ano não informado"}
              {movie.runtime ? ` • ${formatRuntime(movie.runtime)}` : ""}
            </p>
            <h1>{movie.title}</h1>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="movie-original-title">Título original: {movie.original_title}</p>
            )}

            <div className="movie-tags">
              {movie.genres?.map((genre) => <span key={genre.id}>{genre.name}</span>)}
            </div>

            <div className="movie-score">
              <span className="movie-score__value">{formatRating(Number(movie.vote_average))}</span>
              <span> / 10</span>
              {movie.vote_count > 0 && <small>{movie.vote_count.toLocaleString("pt-BR")} avaliações</small>}
            </div>

            {movie.tagline && <p className="movie-tagline">{movie.tagline}</p>}

            <div className="movie-overview">
              <h2>Sinopse</h2>
              <p>{movie.overview || "Sinopse indisponível."}</p>
            </div>

            {trailerUrl && (
              <a className="trailer-link" href={trailerUrl} target="_blank" rel="noopener noreferrer">
                <BsCameraVideo aria-hidden="true" /> Assistir trailer
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="movie-facts" aria-label="Informações do filme">
        <div className="movie-fact"><BsCalendar3 aria-hidden="true" /><span>Lançamento</span><strong>{formatReleaseDate(movie.release_date)}</strong></div>
        <div className="movie-fact"><BsWallet2 aria-hidden="true" /><span>Orçamento</span><strong>{formatCurrency(movie.budget)}</strong></div>
        <div className="movie-fact"><BsGraphUp aria-hidden="true" /><span>Bilheteria</span><strong>{formatCurrency(movie.revenue)}</strong></div>
        <div className="movie-fact"><BsHourglassSplit aria-hidden="true" /><span>Duração</span><strong>{formatRuntime(movie.runtime)}</strong></div>
      </section>

      <WatchProviders movieId={id} />

      {cast.length > 0 && (
        <section className="movie-section">
          <div className="movie-section__heading"><h2>Elenco principal</h2><span>Conheça quem dá vida à história</span></div>
          <div className="cast-grid">
            {cast.map((person) => (
              <article className="cast-card" key={person.cast_id ?? person.credit_id}>
                {person.profile_path
                  ? <img src={getPosterUrl(person.profile_path)} alt={person.name} loading="lazy" />
                  : <div className="cast-card__placeholder" aria-hidden="true">{person.name?.slice(0, 1) ?? "?"}</div>}
                <strong>{person.name}</strong>
                <span>{person.character || "Personagem não informado"}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="movie-section">
          <div className="movie-section__heading"><h2>Você também pode gostar</h2><span>Mais filmes para continuar explorando</span></div>
          <div className="movies-container">
            {recommendations.map((recommendedMovie) => (
              <MovieCard key={recommendedMovie.id} movie={recommendedMovie} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

const Movie = () => {
  const { id } = useParams();

  // Evita uma requisição para endereços como /movie/abc.
  if (!/^\d+$/.test(id ?? "")) return <NotFound />;

  // A key reinicia o estado ao navegar entre filmes recomendados.
  return <MovieDetails key={id} id={id} />;
};

export default Movie;
