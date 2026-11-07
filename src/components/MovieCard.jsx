import { Link } from "react-router";
import { FaStar } from "react-icons/fa";
import { getPosterUrl } from "../services/tmdb";
import { formatRating } from "../utils/formatters";

const MovieCard = ({ movie, showLink = true }) => {
  const poster = getPosterUrl(movie.poster_path);
  const rating = formatRating(Number(movie.vote_average));
  const title = movie.title || movie.name || "Título não informado";
  const year = /^\d{4}/.test(movie.release_date ?? "") ? movie.release_date.slice(0, 4) : null;

  return (
    <article className="movie-card">
      {poster ? (
        <img src={poster} alt={`Pôster de ${title}`} loading="lazy" decoding="async" />
      ) : (
        <div className="movie-card__placeholder" role="img" aria-label="Pôster indisponível">Pôster indisponível</div>
      )}
      <h3>{title}</h3>
      <p className="movie-card__meta">
        <span className="movie-card__rating" aria-label={`Nota ${rating} de 10`}>
          <FaStar aria-hidden="true" /> {rating}
        </span>
        {year && <span className="movie-card__year">{year}</span>}
      </p>
      {showLink && <Link className="movie-card__link" to={`/movie/${movie.id}`} aria-label={`Ver detalhes de ${title}`}>Ver detalhes</Link>}
    </article>
  );
};

export default MovieCard;
