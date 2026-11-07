import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import { fetchTmdb } from "../services/tmdb";
import { buildSearchParams } from "../services/search";
import { getTotalPages, normalizePage } from "../services/pagination";
import { useAsyncData } from "../hooks/useAsyncData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import PosterGrid from "../components/movie/PosterGrid";
import SectionHeader from "../components/ui/SectionHeader";
import Pagination from "../components/ui/Pagination";
import "./Search.css";

/** Campo de busca da página. A `key` do pai o reinicia quando a URL muda. */
const SearchBox = ({ initialQuery, onSearch }) => {
  const [value, setValue] = useState(initialQuery);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form className="search-box" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="search-page-input">
        Buscar filmes pelo título
      </label>
      <PiMagnifyingGlass className="search-box__icon" aria-hidden="true" />
      <input
        id="search-page-input"
        className="search-box__input"
        type="search"
        placeholder="Título do filme"
        autoComplete="off"
        enterKeyHint="search"
        // Foco automático apenas quando ainda não há busca, como na aba "Buscar" do celular.
        autoFocus={!initialQuery}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-box__clear"
          onClick={() => setValue("")}
          aria-label="Limpar texto"
        >
          <PiX aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className="btn btn--primary search-box__submit"
        disabled={!value.trim()}
      >
        Buscar
      </button>
    </form>
  );
};

const Suggestions = () => {
  const loadPopular = useCallback(
    (signal) => fetchTmdb("movie/popular", { params: { language: "pt-BR", region: "BR" }, signal }),
    [],
  );
  const { data, isLoading, error, reload } = useAsyncData(loadPopular);

  return (
    <section className="section search-suggestions" aria-labelledby="suggestions-title">
      <SectionHeader
        id="suggestions-title"
        title="Populares agora"
        subtitle="Sem ideia do que procurar? Comece por aqui."
      />
      <PosterGrid
        label="Filmes populares"
        movies={data?.results?.slice(0, 12)}
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
  const query = (searchParams.get("q") || "").trim();
  const page = normalizePage(searchParams.get("page") || "1");

  useDocumentTitle(query ? `Busca: ${query}` : "Buscar filmes");

  const loadResults = useCallback(
    (signal) =>
      query
        ? fetchTmdb("search/movie", { params: buildSearchParams({ query, page }), signal })
        : Promise.resolve(null),
    [query, page],
  );
  const { data, isLoading, error, reload } = useAsyncData(loadResults);
  const movies = data?.results ?? [];
  const totalPages = getTotalPages(data);

  const search = (nextQuery) => {
    setSearchParams(nextQuery ? new URLSearchParams({ q: nextQuery }) : new URLSearchParams());
  };

  const changePage = (nextPage) => {
    const nextParams = new URLSearchParams({ q: query });
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  return (
    <main className="page search">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">Busca</p>
          <h1 className="page-head__title display">
            {query ? (
              <>
                Resultados para <em>“{query}”</em>
              </>
            ) : (
              "O que vamos assistir?"
            )}
          </h1>
        </header>

        <SearchBox key={query} initialQuery={query} onSearch={search} />

        {query ? (
          <div className="search__results">
            <p className="search__count mono" aria-live="polite">
              {isLoading
                ? "Buscando…"
                : error
                  ? ""
                  : `${(data?.total_results ?? 0).toLocaleString("pt-BR")} resultados`}
            </p>
            <PosterGrid
              label="Resultados da busca"
              movies={movies}
              isLoading={isLoading}
              error={error}
              onRetry={reload}
              emptyTitle="Nenhum filme encontrado"
              emptyMessage="Confira a grafia ou tente o título original do filme."
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
