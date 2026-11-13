import { useEffect, useRef, useState, type ChangeEvent, type SyntheticEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { PiSlidersHorizontal, PiX } from "react-icons/pi";
import { interpolate, locale, messages } from "../i18n";
import {
  DEFAULT_DISCOVER_FILTERS,
  DISCOVER_SORT_OPTIONS,
  MAX_YEAR,
  MIN_VOTES_FOR_RATING_FILTER,
  MIN_YEAR,
  readDiscoverFilters,
  readDiscoverMedia,
  toDiscoverUrlParams,
  TV_SORT_OPTIONS,
  type DiscoverFilters,
  type DiscoverSort,
} from "../lib/discover";
import { normalizePage } from "../lib/pagination";
import { useGenres } from "../hooks/useGenres";
import { useMovies } from "../hooks/useMovies";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import PosterGrid from "../components/movie/PosterGrid";
import Dialog from "../components/ui/Dialog";
import Pagination from "../components/ui/Pagination";
import "./Discover.css";

const text = messages.discoverPage;
const FORM_ID = "discover-advanced-filters";

type AdvancedDraft = Pick<DiscoverFilters, "year" | "minRating">;

interface AdvancedFiltersProps {
  initial: AdvancedDraft;
  yearLabel: string;
  onApply: (draft: AdvancedDraft) => void;
}

/**
 * Filtros digitáveis (ano e nota) com estado próprio: só são aplicados ao enviar,
 * evitando uma requisição a cada tecla.
 */
const AdvancedFilters = ({ initial, yearLabel, onApply }: AdvancedFiltersProps) => {
  const [draft, setDraft] = useState<AdvancedDraft>({
    year: initial.year,
    minRating: initial.minRating,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(draft);
  };

  return (
    <form id={FORM_ID} className="advanced-filters" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field__label" htmlFor="discover-year">
          {yearLabel}
        </label>
        <input
          id="discover-year"
          className="input"
          name="year"
          type="number"
          inputMode="numeric"
          min={MIN_YEAR}
          max={MAX_YEAR}
          placeholder={text.yearPlaceholder}
          value={draft.year}
          onChange={handleChange}
        />
        <span className="field__hint">
          {interpolate(text.yearHint, { min: MIN_YEAR, max: MAX_YEAR })}
        </span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="discover-rating">
          {text.ratingLabel}
        </label>
        <input
          id="discover-rating"
          className="input"
          name="minRating"
          type="number"
          inputMode="decimal"
          min="0"
          max="10"
          step="0.5"
          placeholder={text.ratingPlaceholder}
          value={draft.minRating}
          onChange={handleChange}
        />
        <span className="field__hint">
          {interpolate(text.ratingHint, { votes: MIN_VOTES_FOR_RATING_FILTER })}
        </span>
      </div>
    </form>
  );
};

interface ActiveChip {
  key: "year" | "minRating";
  label: string;
}

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = normalizePage(searchParams.get("page") ?? "1");
  const applied = readDiscoverFilters(searchParams);
  const { genre, sort, year, minRating } = applied;
  const media = readDiscoverMedia(searchParams);
  const isTv = media === "tv";

  useDocumentTitle(isTv ? text.titleSeries : text.title);

  const genresState = useGenres(media);
  const genres = genresState.data ?? [];
  const genreListRef = useRef<HTMLUListElement>(null);
  const genresLoaded = genres.length > 0;

  // Mantém o gênero ativo visível na barra horizontal (ex.: ao chegar por um link).
  useEffect(() => {
    const list = genreListRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const offset = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [genre, genresLoaded]);

  const { movies, totalPages, totalResults, isLoading, error, reload } = useMovies(
    { kind: isTv ? "tvDiscover" : "discover", filters: { genre, sort, year, minRating } },
    { initialPage: page },
  );

  const applyFilters = (changes: Partial<DiscoverFilters>) => {
    setSearchParams(toDiscoverUrlParams(media, { ...applied, ...changes }));
  };

  const clearAll = () => {
    setSearchParams(toDiscoverUrlParams(media, {}));
  };

  const changePage = (nextPage: number) => {
    const nextParams = toDiscoverUrlParams(media, applied);
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  const genreName = genres.find(({ id }) => String(id) === genre)?.name;
  const advancedCount = [year, minRating].filter(Boolean).length;
  const hasAnyFilter = Boolean(
    genre || year || minRating || sort !== DEFAULT_DISCOVER_FILTERS.sort,
  );
  const activeChips: ActiveChip[] = [
    ...(year ? [{ key: "year" as const, label: interpolate(text.yearChip, { year }) }] : []),
    ...(minRating
      ? [
          {
            key: "minRating" as const,
            label: interpolate(text.ratingChip, { rating: minRating.replace(".", ",") }),
          },
        ]
      : []),
  ];

  return (
    <main className="page discover">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">
            {genreName ? (
              <>
                {isTv ? text.headingSeriesGenre : text.headingGenre}{" "}
                <em>{genreName.toLowerCase()}</em>
              </>
            ) : isTv ? (
              text.headingSeries
            ) : (
              text.heading
            )}
          </h1>
          <p className="page-head__lede">{isTv ? text.ledeSeries : text.lede}</p>
        </header>

        <nav className="media-switch segmented" aria-label={text.mediaLabel}>
          <Link to="/discover" className="chip" aria-current={isTv ? undefined : "page"}>
            {text.mediaMovies}
          </Link>
          <Link
            to="/discover?tipo=series"
            className="chip"
            aria-current={isTv ? "page" : undefined}
          >
            {text.mediaSeries}
          </Link>
        </nav>

        <nav className="genre-bar" aria-label={text.genresLabel}>
          <ul ref={genreListRef} className="genre-bar__list" role="list">
            <li>
              <button
                type="button"
                className="chip"
                aria-pressed={!genre}
                onClick={() => {
                  applyFilters({ genre: "" });
                }}
              >
                {text.allGenres}
              </button>
            </li>
            {genresState.isLoading &&
              Array.from({ length: 8 }, (_, index) => (
                <li key={index}>
                  <span className="chip skeleton genre-bar__skeleton" aria-hidden="true" />
                </li>
              ))}
            {genres.map((item) => {
              const isActive = String(item.id) === genre;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={isActive}
                    onClick={() => {
                      applyFilters({ genre: isActive ? "" : String(item.id) });
                    }}
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
          {genresState.error && (
            <button type="button" className="btn btn--quiet" onClick={genresState.reload}>
              {text.genresError}
            </button>
          )}
        </nav>

        <div className="discover-toolbar">
          <div className="discover-toolbar__sort">
            <label className="field__label" htmlFor="discover-sort">
              {text.sortLabel}
            </label>
            <select
              id="discover-sort"
              className="select"
              value={sort}
              onChange={(event) => {
                applyFilters({ sort: event.target.value as DiscoverSort });
              }}
            >
              {(isTv ? TV_SORT_OPTIONS : DISCOVER_SORT_OPTIONS).map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn btn--ghost discover-toolbar__filters"
            onClick={() => {
              setFiltersOpen(true);
            }}
          >
            <PiSlidersHorizontal aria-hidden="true" />
            <span className="discover-toolbar__filters-label">{text.filters}</span>
            {advancedCount > 0 && (
              <span
                className="count-badge"
                aria-label={interpolate(text.filtersActive, { count: advancedCount })}
              >
                {advancedCount}
              </span>
            )}
          </button>
        </div>

        <div className="discover-status">
          <p className="discover-status__count mono" aria-live="polite">
            {isLoading
              ? messages.common.searching
              : error
                ? ""
                : interpolate(isTv ? text.countSeries : text.count, {
                    count: totalResults.toLocaleString(locale),
                  })}
          </p>
          {activeChips.length > 0 && (
            <ul className="discover-status__chips" role="list" aria-label={text.activeFiltersLabel}>
              {activeChips.map(({ key, label }) => (
                <li key={key}>
                  <button
                    type="button"
                    className="chip chip--active"
                    onClick={() => {
                      applyFilters({ [key]: "" });
                    }}
                    aria-label={interpolate(text.removeFilter, { label })}
                  >
                    {label} <PiX aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {hasAnyFilter && (
            <button
              type="button"
              className="btn btn--quiet discover-status__clear"
              onClick={clearAll}
            >
              {text.clearAll}
            </button>
          )}
        </div>

        {/* Título da seção de resultados para leitores de tela: os cards usam h3 (D-65). */}
        <h2 className="sr-only">{isTv ? text.resultsLabelSeries : text.resultsLabel}</h2>
        <PosterGrid
          label={isTv ? text.resultsLabelSeries : text.resultsLabel}
          movies={movies}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          emptyTitle={isTv ? text.emptyTitleSeries : text.emptyTitle}
          emptyMessage={text.emptyMessage}
          emptyAction={
            hasAnyFilter && (
              <button type="button" className="btn btn--ghost" onClick={clearAll}>
                {text.clearFilters}
              </button>
            )
          }
        />

        {!isLoading && !error && movies.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
        )}
      </div>

      <Dialog
        open={filtersOpen}
        onClose={() => {
          setFiltersOpen(false);
        }}
        title={text.filters}
        description={text.dialogDescription}
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                applyFilters({ year: "", minRating: "" });
                setFiltersOpen(false);
              }}
            >
              {text.clear}
            </button>
            <button type="submit" form={FORM_ID} className="btn btn--primary">
              {text.apply}
            </button>
          </>
        }
      >
        <AdvancedFilters
          initial={applied}
          yearLabel={isTv ? text.yearLabelSeries : text.yearLabel}
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
