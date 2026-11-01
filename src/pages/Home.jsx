import { fetchTmdb } from "../services/tmdb";
import { useAsyncData } from "../hooks/useAsyncData";
import AsyncState from "../components/AsyncState";
import MovieCard from "../components/MovieCard";
import "./MoviesGrid.css";

const Home = () => {
  const { data, isLoading, error } = useAsyncData((signal) => fetchTmdb("top_rated", { signal }), []);
  const movies = data?.results ?? [];

  return (
    <main className="container">
      <h1 className="title">Filmes mais bem avaliados</h1>
      <AsyncState isLoading={isLoading} error={error} isEmpty={!movies.length} emptyMessage="Não encontramos filmes para exibir." />
      {!isLoading && !error && movies.length > 0 && (
        <section className="movies-container" aria-label="Filmes mais bem avaliados">
          {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </section>
      )}
    </main>
  );
};

export default Home;
