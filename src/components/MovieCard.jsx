import { Link } from "react-router";
import { FaStar } from "react-icons/fa";
import { getPosterUrl } from "../services/tmdb";
import { formatRating } from "../utils/formatters";

const MovieCard = ({ movie, showLink = true }) => {
  const poster = getPosterUrl(movie.poster_path);
  const rating = formatRating(Number(movie.vote_average));

  return (
    <article className="movie-card">
      {poster ? (
        <img src={poster} alt={movie.title ? `Pôster de ${movie.title}` : "Pôster do filme"} loading="lazy" />
      ) : (
        <div className="movie-card__placeholder" role="img" aria-label="Pôster indisponível">Pôster indisponível</div>
      )}
      <h2>{movie.title || movie.name || "Título não informado"}</h2>
      <p className="movie-card__rating" aria-label={`Nota ${rating} de 10`}>
        <FaStar aria-hidden="true" /> {rating}
      </p>
      {showLink && <Link className="movie-card__link" to={`/movie/${movie.id}`}>Ver detalhes</Link>}
    </article>
  );
};

export default MovieCard;
