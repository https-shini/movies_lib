import { useRef } from "react";
import SectionHeader from "../ui/SectionHeader";
import StateMessage from "../ui/StateMessage";
import Rail, { RailControls } from "../ui/Rail";
import PosterCard, { PosterCardSkeleton } from "./PosterCard";

/**
 * Seção com cabeçalho numerado e faixa horizontal de pôsteres.
 */
const MovieRail = ({ id, index, title, subtitle, movies, isLoading, error, onRetry, link }) => {
  const railRef = useRef(null);
  const hasMovies = !isLoading && !error && movies?.length > 0;

  return (
    <section className="section" aria-labelledby={id}>
      <SectionHeader
        id={id}
        index={index}
        title={title}
        subtitle={subtitle}
        aside={(
          <>
            {link}
            {hasMovies && <RailControls railRef={railRef} label={title} />}
          </>
        )}
      />

      {isLoading && (
        <Rail label={`Carregando ${title}`}>
          {Array.from({ length: 8 }, (_, item) => <li key={item}><PosterCardSkeleton /></li>)}
        </Rail>
      )}

      {error && <StateMessage tone="error" compact title="Não foi possível carregar esta seção" message={error} onRetry={onRetry} />}

      {!isLoading && !error && !movies?.length && (
        <StateMessage compact title="Nenhum filme nesta seção por enquanto." />
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
