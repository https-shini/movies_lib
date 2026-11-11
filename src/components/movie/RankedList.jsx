import { Link } from "react-router";
import { getReleaseYear } from "../../lib/format";
import StateMessage from "../ui/StateMessage";
import Rating from "../ui/Rating";
import { getMovieTitle, Poster } from "./PosterCard";
import "./RankedList.css";

/**
 * Ranking editorial com numerais grandes — os mais bem avaliados.
 */
const RankedList = ({ movies, isLoading, error, onRetry, limit = 10 }) => {
  if (error) {
    return (
      <StateMessage
        tone="error"
        compact
        title="Não foi possível carregar o ranking"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <ol className="ranked" role="list" aria-busy="true" aria-label="Carregando ranking">
        {Array.from({ length: limit }, (_, index) => (
          <li key={index} className="ranked__item" aria-hidden="true">
            <span className="ranked__number display">{index + 1}</span>
            <div className="ranked__poster poster skeleton" />
            <div className="ranked__body">
              <span className="skeleton skeleton--text" style={{ width: "70%" }} />
              <span className="skeleton skeleton--text" style={{ width: "35%" }} />
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const items = movies?.slice(0, limit) ?? [];
  if (!items.length) return <StateMessage compact title="Ranking indisponível no momento." />;

  return (
    <ol className="ranked reveal" role="list">
      {items.map((movie, index) => {
        const title = getMovieTitle(movie);
        return (
          <li key={movie.id}>
            <Link to={`/movie/${movie.id}`} className="ranked__item">
              <span className="ranked__number display" aria-label={`${index + 1}º lugar`}>
                {index + 1}
              </span>
              <Poster
                path={movie.poster_path}
                title={title}
                className="ranked__poster"
                variant="thumb"
              />
              <div className="ranked__body">
                <h3 className="ranked__title">{title}</h3>
                <p className="ranked__meta">
                  <span className="mono">{getReleaseYear(movie.release_date) ?? "Sem data"}</span>
                  <Rating value={movie.vote_average} />
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};

export default RankedList;
