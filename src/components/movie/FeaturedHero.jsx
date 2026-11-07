import { Link } from "react-router";
import { PiArrowUpRight } from "react-icons/pi";
import { getBackdropUrl, getPosterUrl } from "../../services/tmdb";
import { getReleaseYear } from "../../utils/formatters";
import Rating from "../ui/Rating";
import { getMovieTitle } from "./PosterCard";
import "./FeaturedHero.css";

/**
 * Destaque da página inicial: o filme mais popular do momento.
 * No celular usa o pôster (vertical); a partir de 700px, a imagem de fundo.
 */
const FeaturedHero = ({ movie, genresById, isLoading }) => {
  if (isLoading || !movie) {
    return (
      <section
        className="featured featured--loading"
        aria-busy="true"
        aria-label="Carregando destaque"
      >
        <div className="featured__media skeleton" />
        <div className="featured__content shell">
          <span className="skeleton skeleton--text" style={{ width: "9rem" }} />
          <span className="skeleton featured__title-skeleton" />
          <span className="skeleton skeleton--text" style={{ width: "min(32rem, 90%)" }} />
        </div>
      </section>
    );
  }

  const title = getMovieTitle(movie);
  const backdrop = getBackdropUrl(movie.backdrop_path);
  const poster = getPosterUrl(movie.poster_path);
  const year = getReleaseYear(movie.release_date);
  const genres = (movie.genre_ids ?? [])
    .map((id) => genresById?.get(id))
    .filter(Boolean)
    .slice(0, 2);

  return (
    <section className="featured" aria-labelledby="featured-title">
      <div className="featured__media">
        {(backdrop || poster) && (
          <picture>
            {backdrop && <source media="(min-width: 700px)" srcSet={backdrop} />}
            <img src={poster ?? backdrop} alt="" fetchPriority="high" />
          </picture>
        )}
      </div>

      <div className="featured__content shell reveal">
        <p className="featured__kicker mono">
          <span className="featured__live" aria-hidden="true" />
          Em alta agora
        </p>
        <h1 id="featured-title" className="featured__title display">
          {title}
        </h1>
        <p className="featured__meta">
          {year && <span className="mono">{year}</span>}
          <Rating value={movie.vote_average} />
          {genres.map((genre) => (
            <span key={genre} className="featured__genre">
              {genre}
            </span>
          ))}
        </p>
        {movie.overview && <p className="featured__overview">{movie.overview}</p>}
        <div className="featured__actions">
          <Link to={`/movie/${movie.id}`} className="btn btn--primary">
            Ver detalhes <PiArrowUpRight aria-hidden="true" />
          </Link>
          <Link to="/discover" className="btn btn--ghost">
            Explorar catálogo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHero;
