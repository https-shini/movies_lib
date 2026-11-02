import { Link } from "react-router";
import AsyncState from "./AsyncState";
import MovieCard from "./MovieCard";

const MovieSection = ({ title, description, movies, isLoading, error, discoverUrl }) => {
  const visibleMovies = movies?.slice(0, 6) ?? [];

  return (
    <section className="home-section">
      <div className="home-section__heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link to={discoverUrl}>Explorar catálogo</Link>
      </div>

      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={!visibleMovies.length}
        emptyMessage="Nenhum filme disponível nesta seção."
      />

      {!isLoading && !error && visibleMovies.length > 0 && (
        <div className="movies-container">
          {visibleMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </section>
  );
};

export default MovieSection;
