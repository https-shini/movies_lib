import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { fetchTmdb } from "../services/tmdb";
import { useAsyncData } from "../hooks/useAsyncData";
import AsyncState from "../components/AsyncState";
import MovieCard from "../components/MovieCard";
import "./MoviesGrid.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const loadResults = useCallback(
    (signal) => query
      ? fetchTmdb(import.meta.env.VITE_SEARCH, { params: { query }, signal })
      : Promise.resolve({ results: [] }),
    [query],
  );
  const { data, isLoading, error } = useAsyncData(loadResults);
  const movies = data?.results ?? [];

  return (
    <main className="container">
      <h1 className="title">{query ? <>Resultados para: <span className="query-text">{query}</span></> : "Buscar filmes"}</h1>
      <AsyncState isLoading={isLoading} error={error} isEmpty={!query || !movies.length} emptyMessage={query ? "Nenhum filme corresponde à sua busca." : "Digite o nome de um filme na busca."} />
      {!isLoading && !error && movies.length > 0 && (
        <section className="movies-container" aria-label="Resultados da busca">
          {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </section>
      )}
    </main>
  );
};

export default Search;
