import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { fetchTmdb } from "../services/tmdb";
import { buildSearchParams } from "../services/search";
import { getTotalPages, normalizePage } from "../services/pagination";
import { useAsyncData } from "../hooks/useAsyncData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import AsyncState from "../components/AsyncState";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import "./MoviesGrid.css";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const page = normalizePage(searchParams.get("page") || "1");

  useDocumentTitle(query ? `Busca: ${query}` : "Buscar filmes");

  const loadResults = useCallback(
    (signal) => query
      ? fetchTmdb("search/movie", { params: buildSearchParams({ query, page }), signal })
      : Promise.resolve({ results: [] }),
    [query, page],
  );
  const { data, isLoading, error } = useAsyncData(loadResults);
  const movies = data?.results ?? [];
  const totalPages = getTotalPages(data);

  const changePage = (nextPage) => {
    const nextParams = new URLSearchParams({ q: query });
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  return (
    <main className="container">
      <h1 className="title">{query ? <>Resultados para: <span className="query-text">{query}</span></> : "Buscar filmes"}</h1>
      {query && !isLoading && !error && Number.isFinite(data?.total_results) && data.total_results > 0 && (
        <p className="results-count">{data.total_results.toLocaleString("pt-BR")} filmes encontrados</p>
      )}
      <AsyncState isLoading={isLoading} error={error} isEmpty={!query || !movies.length} emptyMessage={query ? "Nenhum filme corresponde à sua busca." : "Digite o nome de um filme na busca."} />
      {!isLoading && !error && movies.length > 0 && (
        <>
          <section className="movies-container" aria-label="Resultados da busca">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </section>
          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
        </>
      )}
    </main>
  );
};

export default Search;
