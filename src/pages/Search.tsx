import { useState, type SyntheticEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { interpolate, locale, messages } from "../i18n";
import { getTotalPages, normalizePage } from "../lib/pagination";
import { useMovies, type MovieSource } from "../hooks/useMovies";
import { usePeople } from "../hooks/usePeople";
import { readSearchCategory, type SearchCategory } from "../services/prefetch";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import PosterGrid from "../components/movie/PosterGrid";
import PeopleGrid from "../components/person/PeopleGrid";
import SectionHeader from "../components/ui/SectionHeader";
import Pagination from "../components/ui/Pagination";
import "./Search.css";

const text = messages.search;

interface SearchBoxProps {
  initialQuery: string;
  onSearch: (query: string) => void;
}

/** Campo de busca da página. A `key` do pai o reinicia quando a URL muda. */
const SearchBox = ({ initialQuery, onSearch }: SearchBoxProps) => {
  const [value, setValue] = useState(initialQuery);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form className="search-box" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="search-page-input">
        {text.inputLabel}
      </label>
      <PiMagnifyingGlass className="search-box__icon" aria-hidden="true" />
      <input
        id="search-page-input"
        className="search-box__input"
        type="search"
        placeholder={text.placeholder}
        autoComplete="off"
        enterKeyHint="search"
        // Foco automático apenas quando ainda não há busca, como na aba "Buscar" do celular.
        autoFocus={!initialQuery}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      {value && (
        <button
          type="button"
          className="search-box__clear"
          onClick={() => {
            setValue("");
          }}
          aria-label={text.clear}
        >
          <PiX aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className="btn btn--primary search-box__submit"
        disabled={!value.trim()}
      >
        {text.submit}
      </button>
    </form>
  );
};

const POPULAR: MovieSource = { kind: "list", list: "popular" };

const Suggestions = () => {
  const { movies, isLoading, error, reload } = useMovies(POPULAR);

  return (
    <section className="section search-suggestions" aria-labelledby="suggestions-title">
      <SectionHeader
        id="suggestions-title"
        title={text.suggestionsTitle}
        subtitle={text.suggestionsSubtitle}
      />
      <PosterGrid
        label={text.suggestionsLabel}
        movies={movies.slice(0, 12)}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        skeletonCount={12}
      />
    </section>
  );
};

/** Valor de `?tipo=` de cada categoria; filmes é o padrão e não aparece na URL. */
const CATEGORY_PARAM: Record<SearchCategory, string | null> = {
  movies: null,
  series: "series",
  people: "pessoas",
};

function searchUrl(query: string, category: SearchCategory, page = 1): string {
  const params = new URLSearchParams({ q: query });
  const tipo = CATEGORY_PARAM[category];
  if (tipo) params.set("tipo", tipo);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const page = normalizePage(searchParams.get("page") ?? "1");
  const category = readSearchCategory(searchParams);
  const pageOf = (target: SearchCategory) => (category === target ? page : 1);

  useDocumentTitle(query ? interpolate(text.resultTitle, { query }) : text.title);

  // As três categorias são consultadas para mostrar quantos resultados cada uma tem.
  const movies = useMovies(query ? { kind: "search", query } : null, {
    initialPage: pageOf("movies"),
  });
  const series = useMovies(query ? { kind: "tvSearch", query } : null, {
    initialPage: pageOf("series"),
  });
  const people = usePeople(query, pageOf("people"));

  const categories: {
    key: SearchCategory;
    label: string;
    count: number | null;
  }[] = [
    {
      key: "movies",
      label: text.categories.movies,
      count: movies.isLoading || movies.error ? null : movies.totalResults,
    },
    {
      key: "series",
      label: text.categories.series,
      count: series.isLoading || series.error ? null : series.totalResults,
    },
    {
      key: "people",
      label: text.categories.people,
      count: people.isLoading || people.error ? null : (people.data?.total_results ?? 0),
    },
  ];

  const active =
    category === "people"
      ? {
          isLoading: people.isLoading,
          error: people.error,
          total: people.data?.total_results ?? 0,
          totalPages: getTotalPages(people.data),
          hasResults: (people.data?.results.length ?? 0) > 0,
        }
      : (() => {
          const list = category === "series" ? series : movies;
          return {
            isLoading: list.isLoading,
            error: list.error,
            total: list.totalResults,
            totalPages: list.totalPages,
            hasResults: list.movies.length > 0,
          };
        })();

  const hasOtherResults = categories.some((item) => item.key !== category && (item.count ?? 0) > 0);
  const emptyMessage = hasOtherResults ? text.emptyOtherCategories : text.emptyMessage;

  const search = (nextQuery: string) => {
    setSearchParams(nextQuery ? new URLSearchParams({ q: nextQuery }) : new URLSearchParams());
  };

  const changePage = (nextPage: number) => {
    const nextParams = new URLSearchParams({ q: query });
    const tipo = CATEGORY_PARAM[category];
    if (tipo) nextParams.set("tipo", tipo);
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  return (
    <main className="page search">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">
            {query ? (
              <>
                {text.headingResults} <em>“{query}”</em>
              </>
            ) : (
              text.headingEmpty
            )}
          </h1>
        </header>

        <SearchBox key={query} initialQuery={query} onSearch={search} />

        {query ? (
          <div className="search__results">
            <nav className="search__categories" aria-label={text.categoriesLabel}>
              <ul className="search__category-list" role="list">
                {categories.map(({ key, label, count }) => (
                  <li key={key}>
                    <Link
                      to={searchUrl(query, key)}
                      className="chip"
                      aria-current={key === category ? "page" : undefined}
                      aria-label={
                        count === null
                          ? label
                          : interpolate(text.categoryCount, {
                              count: count.toLocaleString(locale),
                              category: label,
                            })
                      }
                    >
                      {label}
                      {count !== null && (
                        <span className="search__category-count" aria-hidden="true">
                          {count.toLocaleString(locale)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="search__count mono" aria-live="polite">
              {active.isLoading
                ? messages.common.searching
                : active.error
                  ? ""
                  : interpolate(text.results, { count: active.total.toLocaleString(locale) })}
            </p>

            {category === "people" ? (
              <PeopleGrid
                label={text.peopleLabel}
                people={people.data?.results ?? []}
                isLoading={people.isLoading}
                error={people.error}
                onRetry={people.reload}
                emptyTitle={text.emptyPeopleTitle}
                emptyMessage={emptyMessage}
              />
            ) : category === "series" ? (
              <PosterGrid
                label={text.seriesLabel}
                movies={series.movies}
                isLoading={series.isLoading}
                error={series.error}
                onRetry={series.reload}
                emptyTitle={text.emptySeriesTitle}
                emptyMessage={emptyMessage}
              />
            ) : (
              <PosterGrid
                label={text.resultsLabel}
                movies={movies.movies}
                isLoading={movies.isLoading}
                error={movies.error}
                onRetry={movies.reload}
                emptyTitle={text.emptyTitle}
                emptyMessage={emptyMessage}
              />
            )}

            {!active.isLoading && !active.error && active.hasResults && (
              <Pagination page={page} totalPages={active.totalPages} onPageChange={changePage} />
            )}
          </div>
        ) : (
          <Suggestions />
        )}
      </div>
    </main>
  );
};

export default Search;
