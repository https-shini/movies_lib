import StateMessage from "../ui/StateMessage";
import PosterCard, { PosterCardSkeleton } from "./PosterCard";

/**
 * Grade de filmes com estados de carregamento, erro (com nova tentativa) e vazio.
 */
const PosterGrid = ({
  movies,
  isLoading,
  error,
  onRetry,
  label,
  emptyTitle = "Nada por aqui",
  emptyMessage,
  emptyAction,
  skeletonCount = 12,
}) => {
  if (isLoading) {
    return (
      <div className="poster-grid" aria-busy="true" aria-label="Carregando filmes">
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
        title="Não foi possível carregar"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!movies?.length) {
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
