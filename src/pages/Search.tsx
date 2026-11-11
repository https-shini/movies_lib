import { useState, type SyntheticEvent } from "react";
import { useSearchParams } from "react-router";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { interpolate, locale, messages } from "../i18n";
import { normalizePage } from "../lib/pagination";
import { useMovies, type MovieSource } from "../hooks/useMovies";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import PosterGrid from "../components/movie/PosterGrid";
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

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const page = normalizePage(searchParams.get("page") ?? "1");

  useDocumentTitle(query ? interpolate(text.resultTitle, { query }) : text.title);

  const results = useMovies(query ? { kind: "search", query } : null, { initialPage: page });
  const { movies, isLoading, error, reload, totalResults, totalPages } = results;

  const search = (nextQuery: string) => {
    setSearchParams(nextQuery ? new URLSearchParams({ q: nextQuery }) : new URLSearchParams());
  };

  const changePage = (nextPage: number) => {
    const nextParams = new URLSearchParams({ q: query });
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
            <p className="search__count mono" aria-live="polite">
              {isLoading
                ? messages.common.searching
                : error
                  ? ""
                  : interpolate(text.results, { count: totalResults.toLocaleString(locale) })}
            </p>
            <PosterGrid
              label={text.resultsLabel}
              movies={movies}
              isLoading={isLoading}
              error={error}
              onRetry={reload}
              emptyTitle={text.emptyTitle}
              emptyMessage={text.emptyMessage}
            />
            {!isLoading && !error && movies.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
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
