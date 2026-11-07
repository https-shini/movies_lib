import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { fetchTmdb, TMDB_ENDPOINTS } from "../services/tmdb";
import {
  buildDiscoverParams,
  DEFAULT_DISCOVER_FILTERS,
  DISCOVER_SORT_OPTIONS,
  MAX_YEAR,
  MIN_YEAR,
  readDiscoverFilters,
  toDiscoverSearchParams,
} from "../services/discover";
import { getTotalPages, normalizePage } from "../services/pagination";
import { useAsyncData } from "../hooks/useAsyncData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import AsyncState from "../components/AsyncState";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import "./MoviesGrid.css";
import "./Discover.css";

/**
 * Formulário com estado próprio (rascunho). Os filtros só são aplicados ao
 * enviar, evitando uma requisição a cada tecla digitada. A `key` do componente
 * muda quando a URL muda, o que reinicia o rascunho ao navegar pelo histórico.
 */
const DiscoverFilters = ({ appliedFilters, genres, onApply, onClear }) => {
  const [draft, setDraft] = useState(appliedFilters);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply(draft);
  };

  return (
    <form className="discover-filters" onSubmit={handleSubmit}>
      <div className="filter-field">
        <label htmlFor="discover-genre">Gênero</label>
        <select id="discover-genre" name="genre" value={draft.genre} onChange={handleChange}>
          <option value="">Todos os gêneros</option>
          {genres.map((genre) => (
            <option key={genre.id} value={String(genre.id)}>{genre.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="discover-sort">Ordenar por</label>
        <select id="discover-sort" name="sort" value={draft.sort} onChange={handleChange}>
          {DISCOVER_SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="discover-year">Ano</label>
        <input
          id="discover-year"
          name="year"
          type="number"
          inputMode="numeric"
          min={MIN_YEAR}
          max={MAX_YEAR}
          placeholder="Ex.: 2024"
          value={draft.year}
          onChange={handleChange}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="discover-rating">Nota mínima</label>
        <input
          id="discover-rating"
          name="minRating"
          type="number"
          inputMode="decimal"
          min="0"
          max="10"
          step="0.5"
          placeholder="Ex.: 7.5"
          value={draft.minRating}
          onChange={handleChange}
        />
      </div>

      <div className="filter-actions">
        <button className="filter-submit" type="submit">Aplicar filtros</button>
        <button className="filter-clear" type="button" onClick={onClear}>Limpar</button>
      </div>
    </form>
  );
};

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = normalizePage(searchParams.get("page") || "1");
  const appliedFilters = readDiscoverFilters(searchParams);
  const { genre, sort, year, minRating } = appliedFilters;
  const filtersKey = toDiscoverSearchParams(appliedFilters).toString();

  useDocumentTitle("Descobrir filmes");

  const loadGenres = useCallback(
    (signal) => fetchTmdb(TMDB_ENDPOINTS.genres, { params: { language: "pt-BR" }, signal }),
    [],
  );
  const { data: genreData, error: genreError } = useAsyncData(loadGenres);
  const genres = useMemo(() => genreData?.genres ?? [], [genreData]);

  const loadMovies = useCallback(
    (signal) => fetchTmdb(TMDB_ENDPOINTS.discover, {
      params: buildDiscoverParams({ genre, sort, year, minRating, page }),
      signal,
    }),
    [genre, sort, year, minRating, page],
  );
  const { data, isLoading, error } = useAsyncData(loadMovies);
  const movies = data?.results ?? [];
  const totalPages = getTotalPages(data);

  const applyFilters = (filters) => {
    setSearchParams(toDiscoverSearchParams(filters));
  };

  const clearFilters = () => {
    setSearchParams(toDiscoverSearchParams(DEFAULT_DISCOVER_FILTERS));
  };

  const changePage = (nextPage) => {
    const nextParams = toDiscoverSearchParams(appliedFilters);
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  return (
    <main className="container discover-page">
      <header className="discover-heading">
        <p className="eyebrow">Explore o catálogo</p>
        <h1 className="title">Descubra filmes</h1>
        <p>Encontre seu próximo filme usando gêneros, ano de lançamento e avaliação.</p>
      </header>

      <DiscoverFilters
        key={filtersKey}
        appliedFilters={appliedFilters}
        genres={genres}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      {genreError && <p className="filter-hint" role="status">Não foi possível carregar a lista de gêneros.</p>}

      <div className="discover-results-heading">
        <h2>Resultados</h2>
        {!isLoading && !error && Number.isFinite(data?.total_results) && (
          <span>{data.total_results.toLocaleString("pt-BR")} filmes encontrados</span>
        )}
      </div>

      <AsyncState isLoading={isLoading} error={error} isEmpty={!movies.length} emptyMessage="Nenhum filme corresponde aos filtros selecionados." />

      {!isLoading && !error && movies.length > 0 && (
        <>
          <section className="movies-container" aria-label="Filmes encontrados">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </section>

          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
        </>
      )}
    </main>
  );
};

export default Discover;
