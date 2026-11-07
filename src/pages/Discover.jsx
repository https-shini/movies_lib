import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { PiSlidersHorizontal, PiX } from "react-icons/pi";
import { fetchTmdb } from "../services/tmdb";
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
import PosterGrid from "../components/movie/PosterGrid";
import Dialog from "../components/ui/Dialog";
import Pagination from "../components/ui/Pagination";
import "./Discover.css";

const FORM_ID = "discover-advanced-filters";

/**
 * Filtros digitáveis (ano e nota) com estado próprio: só são aplicados ao enviar,
 * evitando uma requisição a cada tecla.
 */
const AdvancedFilters = ({ initial, onApply }) => {
  const [draft, setDraft] = useState({ year: initial.year, minRating: initial.minRating });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply(draft);
  };

  return (
    <form id={FORM_ID} className="advanced-filters" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field__label" htmlFor="discover-year">Ano de lançamento</label>
        <input
          id="discover-year"
          className="input"
          name="year"
          type="number"
          inputMode="numeric"
          min={MIN_YEAR}
          max={MAX_YEAR}
          placeholder="Ex.: 1994"
          value={draft.year}
          onChange={handleChange}
        />
        <span className="field__hint">Entre {MIN_YEAR} e {MAX_YEAR}.</span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="discover-rating">Nota mínima</label>
        <input
          id="discover-rating"
          className="input"
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
        <span className="field__hint">De 0 a 10. Considera filmes com pelo menos 50 votos.</span>
      </div>
    </form>
  );
};

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = normalizePage(searchParams.get("page") || "1");
  const applied = readDiscoverFilters(searchParams);
  const { genre, sort, year, minRating } = applied;

  useDocumentTitle("Descobrir filmes");

  const loadGenres = useCallback(
    (signal) => fetchTmdb("genre/movie/list", { params: { language: "pt-BR" }, signal }),
    [],
  );
  const genresState = useAsyncData(loadGenres);
  const genres = genresState.data?.genres ?? [];
  const genreListRef = useRef(null);
  const genresLoaded = genres.length > 0;

  // Mantém o gênero ativo visível na barra horizontal (ex.: ao chegar por um link).
  useEffect(() => {
    const list = genreListRef.current;
    const active = list?.querySelector('[aria-pressed="true"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const offset = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [genre, genresLoaded]);

  const loadMovies = useCallback(
    (signal) => fetchTmdb("discover/movie", {
      params: buildDiscoverParams({ genre, sort, year, minRating, page }),
      signal,
    }),
    [genre, sort, year, minRating, page],
  );
  const { data, isLoading, error, reload } = useAsyncData(loadMovies);
  const movies = data?.results ?? [];
  const totalPages = getTotalPages(data);

  const applyFilters = (changes) => {
    setSearchParams(toDiscoverSearchParams({ ...applied, ...changes }));
  };

  const changePage = (nextPage) => {
    const nextParams = toDiscoverSearchParams(applied);
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  const genreName = genres.find(({ id }) => String(id) === genre)?.name;
  const advancedCount = [year, minRating].filter(Boolean).length;
  const hasAnyFilter = Boolean(genre || year || minRating || sort !== DEFAULT_DISCOVER_FILTERS.sort);
  const activeChips = [
    year && { key: "year", label: `Ano ${year}` },
    minRating && { key: "minRating", label: `Nota ≥ ${minRating.replace(".", ",")}` },
  ].filter(Boolean);

  return (
    <main className="page discover">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">Catálogo</p>
          <h1 className="page-head__title display">
            {genreName ? <>Filmes de <em>{genreName.toLowerCase()}</em></> : "Descobrir"}
          </h1>
          <p className="page-head__lede">Combine gênero, época e avaliação para encontrar o próximo filme da sua lista.</p>
        </header>

        <nav className="genre-bar" aria-label="Filtrar por gênero">
          <ul ref={genreListRef} className="genre-bar__list" role="list">
            <li>
              <button type="button" className="chip" aria-pressed={!genre} onClick={() => applyFilters({ genre: "" })}>
                Todos
              </button>
            </li>
            {genresState.isLoading && Array.from({ length: 8 }, (_, index) => (
              <li key={index}><span className="chip skeleton genre-bar__skeleton" aria-hidden="true" /></li>
            ))}
            {genres.map((item) => {
              const isActive = String(item.id) === genre;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={isActive}
                    onClick={() => applyFilters({ genre: isActive ? "" : String(item.id) })}
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
          {genresState.error && (
            <button type="button" className="btn btn--quiet" onClick={genresState.reload}>
              Gêneros indisponíveis. Tentar novamente
            </button>
          )}
        </nav>

        <div className="discover-toolbar">
          <div className="discover-toolbar__sort">
            <label className="field__label" htmlFor="discover-sort">Ordenar por</label>
            <select
              id="discover-sort"
              className="select"
              value={sort}
              onChange={(event) => applyFilters({ sort: event.target.value })}
            >
              {DISCOVER_SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn btn--ghost discover-toolbar__filters" onClick={() => setFiltersOpen(true)}>
            <PiSlidersHorizontal aria-hidden="true" />
            Filtros
            {advancedCount > 0 && <span className="count-badge" aria-label={`${advancedCount} ativos`}>{advancedCount}</span>}
          </button>
        </div>

        <div className="discover-status">
          <p className="discover-status__count mono" aria-live="polite">
            {isLoading ? "Buscando…" : error ? "" : `${(data?.total_results ?? 0).toLocaleString("pt-BR")} filmes`}
          </p>
          {activeChips.length > 0 && (
            <ul className="discover-status__chips" role="list" aria-label="Filtros ativos">
              {activeChips.map(({ key, label }) => (
                <li key={key}>
                  <button type="button" className="chip chip--active" onClick={() => applyFilters({ [key]: "" })} aria-label={`Remover filtro ${label}`}>
                    {label} <PiX aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {hasAnyFilter && (
            <button type="button" className="btn btn--quiet discover-status__clear" onClick={() => setSearchParams(new URLSearchParams())}>
              Limpar tudo
            </button>
          )}
        </div>

        <PosterGrid
          label="Filmes encontrados"
          movies={movies}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          emptyTitle="Nenhum filme com esses filtros"
          emptyMessage="Tente outro gênero, um ano diferente ou uma nota mínima menor."
          emptyAction={hasAnyFilter && (
            <button type="button" className="btn btn--ghost" onClick={() => setSearchParams(new URLSearchParams())}>
              Limpar filtros
            </button>
          )}
        />

        {!isLoading && !error && movies.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
        )}
      </div>

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        description="Refine os resultados por época e avaliação."
        footer={(
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                applyFilters({ year: "", minRating: "" });
                setFiltersOpen(false);
              }}
            >
              Limpar
            </button>
            <button type="submit" form={FORM_ID} className="btn btn--primary">Aplicar filtros</button>
          </>
        )}
      >
        <AdvancedFilters
          initial={applied}
          onApply={(draft) => {
            applyFilters(draft);
            setFiltersOpen(false);
          }}
        />
      </Dialog>
    </main>
  );
};

export default Discover;
