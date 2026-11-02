import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { fetchTmdb } from "../services/tmdb";
import { buildDiscoverParams } from "../services/discover";
import { useAsyncData } from "../hooks/useAsyncData";
import AsyncState from "../components/AsyncState";
import MovieCard from "../components/MovieCard";
import "./MoviesGrid.css";
import "./Discover.css";

const DEFAULT_FILTERS = {
  genre: "",
  sort: "popularity.desc",
  year: "",
  minRating: "",
};

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const [filters, setFilters] = useState(() => ({
    genre: searchParams.get("genre") || "",
    sort: searchParams.get("sort") || DEFAULT_FILTERS.sort,
    year: searchParams.get("year") || "",
    minRating: searchParams.get("minRating") || "",
  }));

  useEffect(() => {
    const nextFilters = {
      genre: searchParams.get("genre") || "",
      sort: searchParams.get("sort") || DEFAULT_FILTERS.sort,
      year: searchParams.get("year") || "",
      minRating: searchParams.get("minRating") || "",
    };

    setFilters((current) => (
      current.genre === nextFilters.genre
      && current.sort === nextFilters.sort
      && current.year === nextFilters.year
      && current.minRating === nextFilters.minRating
        ? current
        : nextFilters
    ));
  }, [searchParams]);

  const loadGenres = useCallback(
    (signal) => fetchTmdb(import.meta.env.VITE_GENRES, { params: { language: "pt-BR" }, signal }),
    [],
  );
  const { data: genreData, error: genreError } = useAsyncData(loadGenres);

  const loadMovies = useCallback(
    (signal) => fetchTmdb(import.meta.env.VITE_DISCOVER, {
      params: buildDiscoverParams({ ...filters, page }),
      signal,
    }),
    [filters, page],
  );
  const { data, isLoading, error } = useAsyncData(loadMovies);
  const movies = data?.results ?? [];
  const totalPages = Math.min(data?.total_pages ?? 1, 500);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
    });

    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const changePage = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
  };

  return (
    <main className="container discover-page">
      <header className="discover-heading">
        <p className="eyebrow">Explore o catálogo</p>
        <h1 className="title">Descubra filmes</h1>
        <p>Encontre seu próximo filme usando gêneros, ano de lançamento e avaliação.</p>
      </header>

      <form className="discover-filters" onSubmit={handleSubmit}>
        <div className="filter-field">
          <label htmlFor="discover-genre">Gênero</label>
          <select id="discover-genre" name="genre" value={filters.genre} onChange={handleFilterChange}>
            <option value="">Todos os gêneros</option>
            {(genreData?.genres ?? []).map((genre) => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="discover-sort">Ordenar por</label>
          <select id="discover-sort" name="sort" value={filters.sort} onChange={handleFilterChange}>
            <option value="popularity.desc">Mais populares</option>
            <option value="vote_average.desc">Melhor avaliados</option>
            <option value="primary_release_date.desc">Lançamentos recentes</option>
            <option value="revenue.desc">Maior bilheteria</option>
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="discover-year">Ano</label>
          <input id="discover-year" name="year" type="number" min="1900" max="2100" placeholder="Ex.: 2024" value={filters.year} onChange={handleFilterChange} />
        </div>

        <div className="filter-field">
          <label htmlFor="discover-rating">Nota mínima</label>
          <input id="discover-rating" name="minRating" type="number" min="0" max="10" step="0.5" placeholder="Ex.: 7.5" value={filters.minRating} onChange={handleFilterChange} />
        </div>

        <div className="filter-actions">
          <button className="filter-submit" type="submit">Aplicar filtros</button>
          <button className="filter-clear" type="button" onClick={clearFilters}>Limpar</button>
        </div>
      </form>

      {genreError && <p className="filter-hint" role="status">Não foi possível carregar a lista de gêneros.</p>}

      <div className="discover-results-heading">
        <h2>Resultados</h2>
        {data?.total_results !== undefined && (
          <span>{data.total_results.toLocaleString("pt-BR")} filmes encontrados</span>
        )}
      </div>

      <AsyncState isLoading={isLoading} error={error} isEmpty={!movies.length} emptyMessage="Nenhum filme corresponde aos filtros selecionados." />

      {!isLoading && !error && movies.length > 0 && (
        <>
          <section className="movies-container" aria-label="Filmes encontrados">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </section>

          <nav className="pagination" aria-label="Paginação dos resultados">
            <button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1}>Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button type="button" onClick={() => changePage(page + 1)} disabled={page >= totalPages}>Próxima</button>
          </nav>
        </>
      )}
    </main>
  );
};

export default Discover;
