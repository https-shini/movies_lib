import type { ReactNode } from "react";
import { Link } from "react-router";
import { interpolate, messages } from "../../i18n";
import { formatCompactNumber, formatRating } from "../../lib/format";
import { backdropSrcSet, getBackdropUrl } from "../../lib/images";
import { Poster } from "../movie/PosterCard";
import "./TitleHero.css";

const text = messages.movie;

export interface HeroGenre {
  id: number;
  name: string;
  href: string;
}

interface TitleHeroProps {
  titleId: string;
  title: string;
  kicker: string;
  originalTitle?: string | undefined;
  backdropPath: string | null | undefined;
  posterPath: string | null | undefined;
  genres: readonly HeroGenre[];
  voteAverage: number | undefined;
  voteCount: number | undefined;
  /** Botões de ação (trailer, onde assistir). */
  children?: ReactNode;
}

/** Cabeçalho de filmes e séries: fundo, pôster, título, gêneros, nota e ações. */
const TitleHero = ({
  titleId,
  title,
  kicker,
  originalTitle,
  backdropPath,
  posterPath,
  genres,
  voteAverage,
  voteCount = 0,
  children,
}: TitleHeroProps) => {
  const backdrop = getBackdropUrl(backdropPath);
  const rating = formatRating(voteAverage);
  const hasRating = rating !== null && voteCount > 0;

  return (
    <section className="movie-hero" aria-labelledby={titleId}>
      <div className="movie-hero__backdrop">
        {backdrop && (
          <img
            src={backdrop}
            srcSet={backdropSrcSet(backdropPath, ["w780", "w1280"])}
            sizes="100vw"
            alt=""
            fetchPriority="high"
          />
        )}
      </div>

      <div className="shell movie-hero__inner reveal">
        <Poster
          path={posterPath}
          title={title}
          className="movie-hero__poster"
          variant="detail"
          eager
        />

        <div className="movie-hero__info">
          <p className="movie-hero__kicker mono">{kicker}</p>
          <h1 id={titleId} className="movie-hero__title display">
            {title}
          </h1>
          {originalTitle && originalTitle !== title && (
            <p className="movie-hero__original">
              {interpolate(text.originalTitle, { title: originalTitle })}
            </p>
          )}

          {genres.length > 0 && (
            <ul className="movie-hero__genres" role="list" aria-label={text.genresLabel}>
              {genres.map((genre) => (
                <li key={genre.id}>
                  <Link className="chip" to={genre.href}>
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

          {children && <div className="movie-hero__actions">{children}</div>}
        </div>
      </div>
    </section>
  );
};

export const TitleHeroSkeleton = ({ label }: { label: string }) => (
  <main className="movie" aria-busy="true" aria-label={label}>
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

export default TitleHero;
