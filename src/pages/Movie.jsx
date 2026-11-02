import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { BsGraphUp, BsWallet2, BsHourglassSplit, BsFillFileEarmarkTextFill } from "react-icons/bs";
import { fetchTmdb } from "../services/tmdb";
import { useAsyncData } from "../hooks/useAsyncData";
import { formatCurrency, formatRuntime } from "../utils/formatters";
import AsyncState from "../components/AsyncState";
import MovieCard from "../components/MovieCard";
import "./Movie.css";

const Movie = () => {
  const { id } = useParams();
  const loadMovie = useCallback((signal) => fetchTmdb(id, { signal }), [id]);
  const { data: movie, isLoading, error } = useAsyncData(loadMovie);

  return (
    <main className="movie-page">
      <AsyncState isLoading={isLoading} error={error} isEmpty={!movie} emptyMessage="Não foi possível localizar este filme." />
      {movie && (
        <>
          <MovieCard movie={movie} showLink={false} />
          {movie.tagline && <p className="tagline">{movie.tagline}</p>}
          <section className="movie-information" aria-label="Informações do filme">
            <div className="info"><h2><BsWallet2 /> Orçamento</h2><p>{formatCurrency(movie.budget)}</p></div>
            <div className="info"><h2><BsGraphUp /> Receita</h2><p>{formatCurrency(movie.revenue)}</p></div>
            <div className="info"><h2><BsHourglassSplit /> Duração</h2><p>{formatRuntime(movie.runtime)}</p></div>
            <div className="info description"><h2><BsFillFileEarmarkTextFill /> Sinopse</h2><p>{movie.overview || "Sinopse indisponível."}</p></div>
          </section>
        </>
      )}
    </main>
  );
};

export default Movie;
