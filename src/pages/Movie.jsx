import { useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { PiArrowDown, PiPlayFill, PiUser } from "react-icons/pi";
import { backdropSrcSet, getBackdropUrl, getProfileUrl } from "../lib/images";
import {
  getYouTubeTrailerKey,
  MAX_CAST,
  pickDirectors,
  pickRelatedMovies,
  pickWriters,
} from "../lib/movie";
import { useMovie } from "../hooks/useMovie";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  formatCompactNumber,
  formatCurrency,
  formatLanguage,
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getReleaseYear,
} from "../lib/format";
import MovieRail from "../components/movie/MovieRail";
import { Poster } from "../components/movie/PosterCard";
import TrailerDialog from "../components/movie/TrailerDialog";
import WatchProviders from "../components/movie/WatchProviders";
import Rail, { RailControls } from "../components/ui/Rail";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import NotFound from "./NotFound";
import "./Movie.css";

const MovieSkeleton = () => (
  <main className="movie" aria-busy="true" aria-label="Carregando filme">
    <section className="movie-hero">
      <div className="movie-hero__backdrop skeleton" />
      <div className="shell movie-hero__inner">
        <div className="movie-hero__poster poster skeleton" />
        <div className="movie-hero__info">
          <span className="skeleton skeleton--text" style={{ width: "10rem" }} />
          <span className="skeleton movie-hero__title-skeleton" />
          <span className="skeleton skeleton--text" style={{ width: "14rem" }} />
        </div>
      </div>
    </section>
  </main>
);

const CastRail = ({ cast }) => {
  const railRef = useRef(null);
  if (!cast.length) return null;

  return (
    <section className="section" aria-labelledby="cast-title">
      <SectionHeader
        id="cast-title"
        index="02"
        title="Elenco principal"
        aside={<RailControls railRef={railRef} label="Elenco principal" />}
      />
      <Rail railRef={railRef} label="Elenco principal" className="rail--wide">
        {cast.map((person) => {
          const photo = getProfileUrl(person.profile_path);
          return (
            <li key={person.cast_id ?? person.credit_id} className="cast-card">
              <div className="cast-card__photo">
                {photo ? (
                  <img src={photo} alt="" loading="lazy" decoding="async" />
                ) : (
                  <PiUser aria-hidden="true" />
                )}
              </div>
              <p className="cast-card__name">{person.name}</p>
              <p className="cast-card__role">{person.character || "Personagem não informado"}</p>
            </li>
          );
        })}
      </Rail>
    </section>
  );
};

const MovieDetails = ({ id }) => {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { data: movie, isLoading, error, reload } = useMovie(id);
  useDocumentTitle(movie?.title || (isLoading ? "Carregando filme" : "Filme"));

  if (isLoading) return <MovieSkeleton />;

  if (error || !movie) {
    return (
      <main className="page">
        <div className="shell">
          <StateMessage
            tone="error"
            title="Não foi possível abrir este filme"
            message={error || "Filme não encontrado."}
            onRetry={reload}
            action={
              <Link to="/" className="btn btn--quiet">
                Voltar ao início
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const title = movie.title || "Título não informado";
  const backdrop = getBackdropUrl(movie.backdrop_path);
  const trailerKey = getYouTubeTrailerKey(movie.videos?.results);
  const cast = movie.credits?.cast?.slice(0, MAX_CAST) ?? [];
  const related = pickRelatedMovies(movie);
  const directors = pickDirectors(movie.credits);
  const writers = pickWriters(movie.credits);
  const year = getReleaseYear(movie.release_date);
  const rating = formatRating(movie.vote_average);
  const hasRating = rating !== null && movie.vote_count > 0;

  const facts = [
    directors.length && { label: "Direção", value: directors.join(", ") },
    writers.length && { label: "Roteiro", value: writers.join(", ") },
    { label: "Lançamento", value: formatReleaseDate(movie.release_date) },
    { label: "Duração", value: formatRuntime(movie.runtime) },
    { label: "Idioma original", value: formatLanguage(movie.original_language) },
    { label: "Orçamento", value: formatCurrency(movie.budget) },
    { label: "Bilheteria", value: formatCurrency(movie.revenue) },
  ].filter(Boolean);

  return (
    <main className="movie">
      <section className="movie-hero" aria-labelledby="movie-title">
        <div className="movie-hero__backdrop">
          {backdrop && (
            <img
              src={backdrop}
              srcSet={backdropSrcSet(movie.backdrop_path, ["w780", "w1280"])}
              sizes="100vw"
              alt=""
              fetchPriority="high"
            />
          )}
        </div>

        <div className="shell movie-hero__inner reveal">
          <Poster
            path={movie.poster_path}
            title={title}
            className="movie-hero__poster"
            variant="detail"
            eager
          />

          <div className="movie-hero__info">
            <p className="movie-hero__kicker mono">
              {[year, movie.runtime > 0 && formatRuntime(movie.runtime)]
                .filter(Boolean)
                .join(" · ") || "Filme"}
            </p>
            <h1 id="movie-title" className="movie-hero__title display">
              {title}
            </h1>
            {movie.original_title && movie.original_title !== title && (
              <p className="movie-hero__original">{movie.original_title}</p>
            )}

            {movie.genres?.length > 0 && (
              <ul className="movie-hero__genres" role="list" aria-label="Gêneros">
                {movie.genres.map((genre) => (
                  <li key={genre.id}>
                    <Link className="chip" to={`/discover?genre=${genre.id}`}>
                      {genre.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="movie-hero__score">
              {hasRating ? (
                <>
                  <p className="movie-hero__rating" aria-label={`Nota ${rating} de 10`}>
                    <span className="display">{rating}</span>
                    <span className="mono" aria-hidden="true">
                      /10
                    </span>
                  </p>
                  <p className="movie-hero__votes mono">
                    {formatCompactNumber(movie.vote_count)} votos no TMDB
                  </p>
                </>
              ) : (
                <p className="movie-hero__votes mono">Ainda sem avaliações suficientes</p>
              )}
            </div>

            <div className="movie-hero__actions">
              {trailerKey && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setTrailerOpen(true)}
                >
                  <PiPlayFill aria-hidden="true" /> Assistir trailer
                </button>
              )}
              <a className="btn btn--ghost" href="#where-to-watch">
                Onde assistir <PiArrowDown aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="shell">
        <div className="movie-body">
          <section className="movie-body__overview" aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">
              Sinopse
            </h2>
            {movie.tagline && <p className="movie-tagline display">{movie.tagline}</p>}
            <p className="movie-overview">
              {movie.overview || "Sinopse ainda não disponível em português."}
            </p>
          </section>

          <aside className="movie-body__facts" aria-labelledby="facts-title">
            <h2 id="facts-title" className="facts__title mono">
              Ficha técnica
            </h2>
            <dl className="facts">
              {facts.map(({ label, value }) => (
                <div key={label} className="facts__row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <section id="where-to-watch" className="section" aria-labelledby="providers-title">
          <SectionHeader
            id="providers-title"
            index="01"
            title="Onde assistir"
            subtitle="Streaming, aluguel e compra no Brasil."
          />
          <WatchProviders movieId={id} />
        </section>

        <CastRail cast={cast} />

        {related.length > 0 && (
          <MovieRail
            id="related-title"
            index={cast.length ? "03" : "02"}
            title="Você também pode gostar"
            movies={related}
            isLoading={false}
          />
        )}
      </div>

      {trailerKey && (
        <TrailerDialog
          open={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          videoKey={trailerKey}
          title={title}
        />
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
