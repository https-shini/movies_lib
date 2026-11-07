import { Link } from "react-router";
import { PiFilmSlate } from "react-icons/pi";
import { getReleaseYear } from "../../lib/format";
import { getPosterUrl } from "../../lib/images";
import Rating from "../ui/Rating";
import "./PosterCard.css";

export const getMovieTitle = (movie) => movie?.title || movie?.name || "Título não informado";

/**
 * `eager` carrega sem esperar a rolagem; `priority` também pede prioridade alta
 * (use só na imagem principal da página, candidata ao LCP).
 */
export const Poster = ({
  path,
  title,
  className = "",
  eager = false,
  priority = false,
  size = "w342",
}) => {
  const src = getPosterUrl(path, size);

  return (
    <div className={`poster ${className}`}>
      {src ? (
        <img
          src={src}
          alt=""
          loading={eager || priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" } : {})}
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

/** Card de filme: o pôster é o protagonista; o card inteiro é um link. */
const PosterCard = ({ movie, eager = false, priority = false }) => {
  const title = getMovieTitle(movie);
  const year = getReleaseYear(movie.release_date);

  return (
    <Link to={`/movie/${movie.id}`} className="poster-card">
      <div className="poster-card__media">
        <Poster path={movie.poster_path} title={title} eager={eager} priority={priority} />
        <Rating value={movie.vote_average} className="poster-card__rating" />
      </div>
      <h3 className="poster-card__title">{title}</h3>
      <p className="poster-card__meta mono">{year ?? "Sem data"}</p>
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
