import type { ReactNode } from "react";
import { messages } from "../../i18n";
import type { MovieSummary } from "../../types/tmdb";
import StateMessage from "../ui/StateMessage";
import PosterCard, { PosterCardSkeleton } from "./PosterCard";

interface PosterGridProps {
  movies: readonly MovieSummary[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  label: string;
  emptyTitle?: string | undefined;
  emptyMessage?: string | undefined;
  emptyAction?: ReactNode | undefined;
  skeletonCount?: number | undefined;
}

/** Grade de filmes com estados de carregamento, erro (com nova tentativa) e vazio. */
const PosterGrid = ({
  movies,
  isLoading,
  error,
  onRetry,
  label,
  emptyTitle = messages.grid.emptyTitle,
  emptyMessage,
  emptyAction,
  skeletonCount = 12,
}: PosterGridProps) => {
  if (isLoading) {
    return (
      <div className="poster-grid" aria-busy="true" aria-label={messages.grid.loading}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <PosterCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <StateMessage
        tone="error"
        title={messages.common.loadError}
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!movies.length) {
    return (
      <StateMessage tone="empty" title={emptyTitle} message={emptyMessage} action={emptyAction} />
    );
  }

  return (
    <ul className="poster-grid reveal" role="list" aria-label={label}>
      {movies.map((movie, index) => (
        <li key={movie.id}>
          {/* O primeiro pôster costuma ser o maior elemento visível (LCP). */}
          <PosterCard movie={movie} priority={index === 0} />
        </li>
      ))}
    </ul>
  );
};

export default PosterGrid;
