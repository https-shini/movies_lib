import { Link } from "react-router";
import { PiFilmSlate } from "react-icons/pi";
import { messages } from "../../i18n";
import { getReleaseYear, textOr } from "../../lib/format";
import { getPosterUrl, POSTER_VARIANTS, posterSrcSet, type PosterVariant } from "../../lib/images";
import { mediaPath } from "../../lib/media";
import type { MovieSummary } from "../../types/tmdb";
import Rating from "../ui/Rating";
import "./PosterCard.css";

export const getMovieTitle = (movie: Pick<MovieSummary, "title"> | null | undefined): string =>
  textOr(movie?.title, messages.common.untitled);

interface PosterProps {
  path: string | null | undefined;
  title: string;
  className?: string | undefined;
  eager?: boolean | undefined;
  priority?: boolean | undefined;
  variant?: PosterVariant | undefined;
}

/**
 * `eager` carrega sem esperar a rolagem; `priority` também pede prioridade alta
 * (use só na imagem principal da página, candidata ao LCP). `variant` escolhe o
 * `srcset`/`sizes` medido para cada contexto (card, thumb ou detail).
 */
export const Poster = ({
  path,
  title,
  className = "",
  eager = false,
  priority = false,
  variant = "card",
}: PosterProps) => {
  const config = POSTER_VARIANTS[variant];
  const src = getPosterUrl(path, config.src);
  const srcSet = posterSrcSet(path, config.srcSet);

  return (
    <div className={`poster ${className}`}>
      {src ? (
        <img
          src={src}
          srcSet={srcSet}
          sizes={config.sizes}
          alt=""
          loading={eager || priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
        />
      ) : (
        <div className="poster__fallback" aria-hidden="true">
          <PiFilmSlate />
          <span>{title}</span>
        </div>
      )}
    </div>
  );
};

interface PosterCardProps {
  movie: MovieSummary;
  eager?: boolean | undefined;
  priority?: boolean | undefined;
}

/** Card de filme: o pôster é o protagonista; o card inteiro é um link. */
const PosterCard = ({ movie, eager = false, priority = false }: PosterCardProps) => {
  const title = getMovieTitle(movie);
  const year = getReleaseYear(movie.release_date);

  return (
    <Link to={mediaPath(movie.media_type, movie.id)} className="poster-card">
      <div className="poster-card__media">
        <Poster path={movie.poster_path} title={title} eager={eager} priority={priority} />
        {movie.media_type === "tv" && (
          <span className="poster-card__badge mono">{messages.title.seriesBadge}</span>
        )}
        <Rating value={movie.vote_average} className="poster-card__rating" />
      </div>
      <h3 className="poster-card__title">{title}</h3>
      <p className="poster-card__meta mono">{year ?? messages.common.noDate}</p>
    </Link>
  );
};

export const PosterCardSkeleton = () => (
  <div className="poster-card poster-card--skeleton" aria-hidden="true">
    <div className="poster skeleton" />
    <span className="skeleton skeleton--text" style={{ width: "80%" }} />
    <span className="skeleton skeleton--text" style={{ width: "30%" }} />
  </div>
);

export default PosterCard;
