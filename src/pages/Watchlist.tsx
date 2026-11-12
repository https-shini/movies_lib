import { useState } from "react";
import { Link } from "react-router";
import { PiTrash } from "react-icons/pi";
import { messages, plural } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useWatchlist } from "../hooks/useWatchlist";
import type { MovieSummary } from "../types/tmdb";
import PosterGrid from "../components/movie/PosterGrid";
import Dialog from "../components/ui/Dialog";
import "./Watchlist.css";

const text = messages.watchlist;

/** Filmes e séries salvos neste navegador, do mais recente ao mais antigo. */
const Watchlist = () => {
  const { items, clear } = useWatchlist();
  const [confirming, setConfirming] = useState(false);
  useDocumentTitle(text.title);

  const cards: MovieSummary[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    poster_path: item.posterPath,
    ...(item.date ? { release_date: item.date } : {}),
    ...(item.voteAverage !== null ? { vote_average: item.voteAverage } : {}),
    media_type: item.mediaType,
  }));

  return (
    <main className="page watchlist">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">{text.heading}</h1>
          <p className="page-head__lede">{text.lede}</p>
        </header>

        {items.length > 0 && (
          <div className="watchlist__toolbar">
            <p className="watchlist__count mono" aria-live="polite">
              {plural(text.count, items.length)}
            </p>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                setConfirming(true);
              }}
            >
              <PiTrash aria-hidden="true" /> {text.clear}
            </button>
          </div>
        )}

        <PosterGrid
          label={text.listLabel}
          movies={cards}
          isLoading={false}
          error=""
          onRetry={() => undefined}
          emptyTitle={text.emptyTitle}
          emptyMessage={text.emptyMessage}
          emptyAction={
            <Link to="/discover" className="btn btn--primary">
              {text.emptyAction}
            </Link>
          }
        />
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
