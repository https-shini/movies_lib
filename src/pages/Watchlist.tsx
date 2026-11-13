import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PiBookmarkSimple, PiTrash, PiX } from "react-icons/pi";
import { interpolate, locale, messages, plural } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useWatchlist } from "../hooks/useWatchlist";
import { showToast } from "../lib/toast";
import {
  countWatchlist,
  filterWatchlist,
  isWatchlistSort,
  sortWatchlist,
  watchlistKey,
  WATCHLIST_SORTS,
  type WatchlistItem,
  type WatchlistMedia,
  type WatchlistSort,
} from "../lib/watchlist";
import type { MovieSummary } from "../types/tmdb";
import PosterCard from "../components/movie/PosterCard";
import Dialog from "../components/ui/Dialog";
import StateMessage from "../components/ui/StateMessage";
import "./Watchlist.css";

const text = messages.watchlist;

/** Filtro e ordem ficam na URL, como em Descobrir: sobrevivem ao recarregar e ao voltar. */
const MEDIA_PARAM: Record<Exclude<WatchlistMedia, "all">, string> = {
  movie: "filmes",
  tv: "series",
};
const SORT_PARAM: Record<WatchlistSort, string> = {
  recent: "",
  oldest: "antigos",
  title: "titulo",
  rating: "nota",
  release: "lancamento",
};

function readMedia(value: string | null): WatchlistMedia {
  if (value === MEDIA_PARAM.movie) return "movie";
  if (value === MEDIA_PARAM.tv) return "tv";
  return "all";
}

function readSort(value: string | null): WatchlistSort {
  return WATCHLIST_SORTS.find((sort) => SORT_PARAM[sort] === value) ?? "recent";
}

const MEDIA_OPTIONS: readonly { value: WatchlistMedia; label: string }[] = [
  { value: "all", label: text.filterAll },
  { value: "movie", label: text.filterMovies },
  { value: "tv", label: text.filterSeries },
];

const toCard = (item: WatchlistItem): MovieSummary => ({
  id: item.id,
  title: item.title,
  poster_path: item.posterPath,
  ...(item.date ? { release_date: item.date } : {}),
  ...(item.voteAverage !== null ? { vote_average: item.voteAverage } : {}),
  media_type: item.mediaType,
});

/**
 * Filmes e séries salvos neste navegador (D-67): filtro por tipo, ordenação e remoção de
 * cada título, com "Desfazer". O que fica guardado não muda de formato.
 */
const Watchlist = () => {
  const { items, clear, remove, reinsert } = useWatchlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(false);
  // Depois de remover, o foco vai para o título vizinho (ou para o filtro, se a lista
  // esvaziou), para quem usa teclado não ser jogado para o topo da página.
  const pendingFocus = useRef<string | null>(null);
  useDocumentTitle(text.title);

  const media = readMedia(searchParams.get("tipo"));
  const sort = readSort(searchParams.get("ordem"));
  const counts = countWatchlist(items);
  const visible = sortWatchlist(filterWatchlist(items, media), sort);

  useEffect(() => {
    const key = pendingFocus.current;
    if (key === null) return;
    pendingFocus.current = null;
    const target =
      document.querySelector<HTMLElement>(`[data-watchlist-key="${key}"] a`) ??
      document.querySelector<HTMLElement>(".watchlist__filters [aria-pressed='true']") ??
      document.querySelector<HTMLElement>(".watchlist-empty__actions a");
    target?.focus();
  }, [items]);

  const update = (next: { media?: WatchlistMedia; sort?: WatchlistSort }) => {
    const params = new URLSearchParams();
    const nextMedia = next.media ?? media;
    const nextSort = next.sort ?? sort;
    if (nextMedia !== "all") params.set("tipo", MEDIA_PARAM[nextMedia]);
    if (SORT_PARAM[nextSort]) params.set("ordem", SORT_PARAM[nextSort]);
    setSearchParams(params, { replace: true });
  };

  const removeItem = (item: WatchlistItem, position: number) => {
    const neighbor = visible[position + 1] ?? visible[position - 1];
    pendingFocus.current = neighbor ? watchlistKey(neighbor.mediaType, neighbor.id) : "";
    const removed = remove(item.mediaType, item.id);
    if (!removed) {
      pendingFocus.current = null;
      return;
    }
    showToast(interpolate(text.removed, { title: item.title }), {
      action: {
        label: messages.toast.undo,
        onAction: () => {
          reinsert(removed.item, removed.index);
        },
      },
    });
  };

  const emptyFilterTitle = media === "tv" ? text.emptySeries : text.emptyMovies;

  return (
    <main className="page watchlist">
      <div className="shell">
        <header className="page-head watchlist__head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">{text.heading}</h1>
          <p className="page-head__lede">{text.lede}</p>
          {items.length > 0 && (
            <div className="watchlist__summary">
              <p className="watchlist__total" aria-live="polite">
                <span className="watchlist__total-number display">
                  {visible.length.toLocaleString(locale)}
                </span>{" "}
                <span className="watchlist__total-label">
                  {plural(text.savedLabel, visible.length)}
                </span>
              </p>
              <button
                type="button"
                className="btn btn--quiet watchlist__clear"
                onClick={() => {
                  setConfirming(true);
                }}
              >
                <PiTrash aria-hidden="true" /> {text.clear}
              </button>
            </div>
          )}
        </header>

        {items.length > 0 ? (
          <>
            <div className="watchlist__toolbar">
              <ul
                className="watchlist__filters segmented segmented--fill"
                role="list"
                aria-label={text.filterLabel}
              >
                {MEDIA_OPTIONS.map(({ value, label }) => (
                  <li key={value}>
                    <button
                      type="button"
                      className="chip"
                      aria-pressed={media === value}
                      aria-label={interpolate(text.filterCount, {
                        category: label,
                        count: counts[value].toLocaleString(locale),
                      })}
                      onClick={() => {
                        update({ media: value });
                      }}
                    >
                      {label}
                      <span className="watchlist__filter-count" aria-hidden="true">
                        {counts[value].toLocaleString(locale)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="watchlist__sort">
                <label className="field__label" htmlFor="watchlist-sort">
                  {text.sortLabel}
                </label>
                <select
                  id="watchlist-sort"
                  className="select"
                  value={sort}
                  onChange={(event) => {
                    if (isWatchlistSort(event.target.value)) update({ sort: event.target.value });
                  }}
                >
                  {WATCHLIST_SORTS.map((value) => (
                    <option key={value} value={value}>
                      {text.sorts[value]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Título da seção para leitores de tela: os cards usam h3 (D-67). */}
            <h2 className="sr-only">{text.listLabel}</h2>

            {visible.length > 0 ? (
              <ul className="poster-grid watchlist__grid" role="list" aria-label={text.listLabel}>
                {visible.map((item, index) => {
                  const key = watchlistKey(item.mediaType, item.id);
                  return (
                    <li key={key} className="watchlist__item" data-watchlist-key={key}>
                      <PosterCard movie={toCard(item)} priority={index === 0} />
                      <button
                        type="button"
                        className="icon-btn watchlist__remove"
                        aria-label={interpolate(text.remove, { title: item.title })}
                        onClick={() => {
                          removeItem(item, index);
                        }}
                      >
                        <PiX aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <StateMessage
                tone="empty"
                title={emptyFilterTitle}
                message={text.emptyFilterMessage}
                action={
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      update({ media: "all" });
                    }}
                  >
                    {text.emptyFilterAction}
                  </button>
                }
              />
            )}
          </>
        ) : (
          <section className="watchlist-empty" aria-labelledby="watchlist-empty-title">
            <span className="watchlist-empty__mark" aria-hidden="true">
              <PiBookmarkSimple />
            </span>
            <h2 id="watchlist-empty-title" className="watchlist-empty__title display">
              {text.emptyTitle}
            </h2>
            <p className="watchlist-empty__message">{text.emptyMessage}</p>
            <div className="watchlist-empty__actions">
              <Link to="/discover" className="btn btn--primary">
                {text.emptyAction}
              </Link>
              <Link to="/discover?tipo=series" className="btn btn--ghost">
                {text.emptyActionSeries}
              </Link>
            </div>
          </section>
        )}
      </div>

      <Dialog
        open={confirming}
        onClose={() => {
          setConfirming(false);
        }}
        title={text.clearTitle}
        description={text.clearDescription}
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setConfirming(false);
              }}
            >
              {text.clearCancel}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                clear();
                setConfirming(false);
              }}
            >
              {text.clearConfirm}
            </button>
          </>
        }
      />
    </main>
  );
};

export default Watchlist;
