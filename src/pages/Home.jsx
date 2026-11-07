import { useMemo } from "react";
import { Link } from "react-router";
import { PiArrowRight } from "react-icons/pi";
import { useGenres } from "../hooks/useGenres";
import { useMovies } from "../hooks/useMovies";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import FeaturedHero from "../components/movie/FeaturedHero";
import MovieRail from "../components/movie/MovieRail";
import RankedList from "../components/movie/RankedList";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import "./Home.css";

const POPULAR = { kind: "list", list: "popular" };
const TOP_RATED = { kind: "list", list: "top_rated" };
const NOW_PLAYING = { kind: "list", list: "now_playing" };

const Home = () => {
  useDocumentTitle("");

  const popular = useMovies(POPULAR);
  const topRated = useMovies(TOP_RATED);
  const nowPlaying = useMovies(NOW_PLAYING);
  const genres = useGenres();

  const genresById = useMemo(
    () => new Map((genres.data ?? []).map(({ id, name }) => [id, name])),
    [genres.data],
  );

  const popularMovies = popular.movies;
  const [featured, ...trending] = popularMovies;

  return (
    <main className="home">
      {popular.error ? (
        <div className="shell home__hero-error">
          <StateMessage
            tone="error"
            title="Não foi possível carregar os destaques"
            message={popular.error}
            onRetry={popular.reload}
          />
        </div>
      ) : (
        <FeaturedHero movie={featured} genresById={genresById} isLoading={popular.isLoading} />
      )}

      <div className="shell">
        {!popular.error && (
          <MovieRail
            id="trending-title"
            index="01"
            title="Em alta"
            subtitle="O que todo mundo está assistindo agora."
            movies={trending}
            isLoading={popular.isLoading}
            onRetry={popular.reload}
            link={
              <Link to="/discover" className="text-link">
                Ver tudo
              </Link>
            }
          />
        )}

        <section className="section" aria-labelledby="ranked-title">
          <SectionHeader
            id="ranked-title"
            index="02"
            title="Os 10 mais bem avaliados"
            subtitle="Clássicos e favoritos com as maiores notas do público."
            aside={
              <Link to="/discover?sort=vote_average.desc" className="text-link">
                Ranking completo
              </Link>
            }
          />
          <RankedList
            movies={topRated.movies}
            isLoading={topRated.isLoading}
            error={topRated.error}
            onRetry={topRated.reload}
          />
        </section>

        <MovieRail
          id="now-playing-title"
          index="03"
          title="Nos cinemas"
          subtitle="Em cartaz nas salas brasileiras."
          movies={nowPlaying.movies}
          isLoading={nowPlaying.isLoading}
          error={nowPlaying.error}
          onRetry={nowPlaying.reload}
          link={
            <Link to="/discover?sort=primary_release_date.desc" className="text-link">
              Lançamentos
            </Link>
          }
        />

        <section className="section" aria-labelledby="genres-title">
          <SectionHeader
            id="genres-title"
            index="04"
            title="Explore por gênero"
            subtitle="Um atalho para o catálogo filtrado."
          />
          {genres.error ? (
            <StateMessage
              tone="error"
              compact
              title="Não foi possível carregar os gêneros"
              message={genres.error}
              onRetry={genres.reload}
            />
          ) : (
            <ul className="genre-index" role="list" aria-busy={genres.isLoading}>
              {genres.isLoading
                ? Array.from({ length: 12 }, (_, index) => (
                    <li key={index}>
                      <span className="genre-index__link skeleton" aria-hidden="true" />
                    </li>
                  ))
                : genres.data?.map((genre) => (
                    <li key={genre.id}>
                      <Link className="genre-index__link" to={`/discover?genre=${genre.id}`}>
                        <span>{genre.name}</span>
                        <PiArrowRight aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default Home;
