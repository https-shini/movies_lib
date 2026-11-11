import { useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { PiArrowDown, PiPlayFill, PiUser } from "react-icons/pi";
import { interpolate, messages } from "../i18n";
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
  textOr,
} from "../lib/format";
import type { CastMember } from "../types/tmdb";
import MovieRail from "../components/movie/MovieRail";
import { Poster } from "../components/movie/PosterCard";
import TrailerDialog from "../components/movie/TrailerDialog";
import WatchProviders from "../components/movie/WatchProviders";
import Rail, { RailControls } from "../components/ui/Rail";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import NotFound from "./NotFound";
import "./Movie.css";

const text = messages.movie;

const MovieSkeleton = () => (
  <main className="movie" aria-busy="true" aria-label={text.loading}>
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

const CastRail = ({ cast }: { cast: readonly CastMember[] }) => {
  const railRef = useRef<HTMLUListElement>(null);
  if (!cast.length) return null;

  return (
    <section className="section" aria-labelledby="cast-title">
      <SectionHeader
        id="cast-title"
        index="02"
        title={text.castTitle}
        aside={<RailControls railRef={railRef} label={text.castTitle} />}
      />
      <Rail railRef={railRef} label={text.castTitle} className="rail--wide">
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
              <p className="cast-card__role">{textOr(person.character, text.noCharacter)}</p>
            </li>
          );
        })}
      </Rail>
    </section>
  );
};

interface Fact {
  label: string;
  value: string;
}

const MovieDetails = ({ id }: { id: string }) => {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { data: movie, isLoading, error, reload } = useMovie(id);
  useDocumentTitle(textOr(movie?.title, isLoading ? text.loadingTitle : text.fallbackTitle));

  if (isLoading) return <MovieSkeleton />;

  if (error || !movie) {
    return (
      <main className="page">
        <div className="shell">
          <StateMessage
            tone="error"
            title={text.error}
            message={error || text.notFound}
            onRetry={reload}
            action={
              <Link to="/" className="btn btn--quiet">
                {messages.common.backHome}
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const title = textOr(movie.title, messages.common.untitled);
  const backdrop = getBackdropUrl(movie.backdrop_path);
  const trailerKey = getYouTubeTrailerKey(movie.videos?.results);
  const cast = movie.credits?.cast.slice(0, MAX_CAST) ?? [];
  const related = pickRelatedMovies(movie);
  const directors = pickDirectors(movie.credits);
  const writers = pickWriters(movie.credits);
  const year = getReleaseYear(movie.release_date);
  const runtime = movie.runtime ?? 0;
  const rating = formatRating(movie.vote_average);
  const voteCount = movie.vote_count ?? 0;
  const hasRating = rating !== null && voteCount > 0;
  const genres = movie.genres ?? [];

  const facts: Fact[] = [
    ...(directors.length ? [{ label: text.directing, value: directors.join(", ") }] : []),
    ...(writers.length ? [{ label: text.writing, value: writers.join(", ") }] : []),
    { label: text.release, value: formatReleaseDate(movie.release_date) },
    { label: text.runtime, value: formatRuntime(movie.runtime) },
    { label: text.language, value: formatLanguage(movie.original_language) },
    { label: text.budget, value: formatCurrency(movie.budget) },
    { label: text.revenue, value: formatCurrency(movie.revenue) },
  ];

  const kicker =
    [year, runtime > 0 ? formatRuntime(runtime) : null].filter(Boolean).join(" · ") ||
    text.fallbackTitle;

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
            <p className="movie-hero__kicker mono">{kicker}</p>
            <h1 id="movie-title" className="movie-hero__title display">
              {title}
            </h1>
            {movie.original_title && movie.original_title !== title && (
              <p className="movie-hero__original">{movie.original_title}</p>
            )}

            {genres.length > 0 && (
              <ul className="movie-hero__genres" role="list" aria-label={text.genresLabel}>
                {genres.map((genre) => (
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
                  <p
                    className="movie-hero__rating"
                    aria-label={interpolate(messages.common.ratingLabel, { rating })}
                  >
                    <span className="display">{rating}</span>
                    <span className="mono" aria-hidden="true">
                      /10
                    </span>
                  </p>
                  <p className="movie-hero__votes mono">
                    {interpolate(text.votes, { count: formatCompactNumber(voteCount) })}
                  </p>
                </>
              ) : (
                <p className="movie-hero__votes mono">{text.noVotes}</p>
              )}
            </div>

            <div className="movie-hero__actions">
              {trailerKey && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setTrailerOpen(true);
                  }}
                >
                  <PiPlayFill aria-hidden="true" /> {text.watchTrailer}
                </button>
              )}
              <a className="btn btn--ghost" href="#where-to-watch">
                {text.whereToWatch} <PiArrowDown aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="shell">
        <div className="movie-body">
          <section className="movie-body__overview" aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">
              {text.overviewTitle}
            </h2>
            {movie.tagline && <p className="movie-tagline display">{movie.tagline}</p>}
            <p className="movie-overview">{textOr(movie.overview, text.noOverview)}</p>
          </section>

          <aside className="movie-body__facts" aria-labelledby="facts-title">
            <h2 id="facts-title" className="facts__title mono">
              {text.factsTitle}
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
            title={text.providersTitle}
            subtitle={text.providersSubtitle}
          />
          <WatchProviders providers={movie["watch/providers"]} />
        </section>

        <CastRail cast={cast} />

        {related.length > 0 && (
          <MovieRail
            id="related-title"
            index={cast.length ? "03" : "02"}
            title={text.relatedTitle}
            movies={related}
            isLoading={false}
          />
        )}
      </div>

      {trailerKey && (
        <TrailerDialog
          open={trailerOpen}
          onClose={() => {
            setTrailerOpen(false);
          }}
          videoKey={trailerKey}
          title={title}
        />
      )}
    </main>
  );
};

const Movie = () => {
  const { id = "" } = useParams();

  // Evita uma requisição para endereços como /movie/abc.
  if (!/^\d+$/.test(id)) return <NotFound />;

  // A key reinicia o estado ao navegar entre filmes recomendados.
  return <MovieDetails key={id} id={id} />;
};

export default Movie;
