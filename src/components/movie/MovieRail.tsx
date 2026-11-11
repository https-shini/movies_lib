import { useRef, type ReactNode } from "react";
import { interpolate, messages } from "../../i18n";
import type { MovieSummary } from "../../types/tmdb";
import SectionHeader from "../ui/SectionHeader";
import StateMessage from "../ui/StateMessage";
import Rail, { RailControls } from "../ui/Rail";
import PosterCard, { PosterCardSkeleton } from "./PosterCard";

interface MovieRailProps {
  id: string;
  index?: string | undefined;
  title: string;
  subtitle?: string | undefined;
  movies: readonly MovieSummary[];
  isLoading: boolean;
  error?: string | undefined;
  onRetry?: (() => void) | undefined;
  link?: ReactNode | undefined;
}

/** Seção com cabeçalho numerado e faixa horizontal de pôsteres. */
const MovieRail = ({
  id,
  index,
  title,
  subtitle,
  movies,
  isLoading,
  error = "",
  onRetry,
  link,
}: MovieRailProps) => {
  const railRef = useRef<HTMLUListElement>(null);
  const hasMovies = !isLoading && !error && movies.length > 0;

  return (
    <section className="section" aria-labelledby={id}>
      <SectionHeader
        id={id}
        index={index}
        title={title}
        subtitle={subtitle}
        aside={
          <>
            {link}
            {hasMovies && <RailControls railRef={railRef} label={title} />}
          </>
        }
      />

      {isLoading && (
        <Rail label={interpolate(messages.rail.loading, { title })}>
          {Array.from({ length: 8 }, (_, item) => (
            <li key={item}>
              <PosterCardSkeleton />
            </li>
          ))}
        </Rail>
      )}

      {error && (
        <StateMessage
          tone="error"
          compact
          title={messages.rail.error}
          message={error}
          onRetry={onRetry}
        />
      )}

      {!isLoading && !error && !movies.length && (
        <StateMessage compact title={messages.rail.empty} />
      )}

      {hasMovies && (
        <Rail railRef={railRef} label={title} className="reveal">
          {movies.map((movie) => (
            <li key={movie.id}>
              <PosterCard movie={movie} />
            </li>
          ))}
        </Rail>
      )}
    </section>
  );
};

export default MovieRail;
