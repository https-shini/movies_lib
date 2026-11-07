import { useCallback, useMemo } from "react";
import { Link } from "react-router";
import { PiArrowRight } from "react-icons/pi";
import { fetchTmdb } from "../services/tmdb";
import { useAsyncData } from "../hooks/useAsyncData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import FeaturedHero from "../components/movie/FeaturedHero";
import MovieRail from "../components/movie/MovieRail";
import RankedList from "../components/movie/RankedList";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import "./Home.css";

const Home = () => {
  useDocumentTitle("");

  const loadPopular = useCallback(
    (signal) => fetchTmdb("movie/popular", { params: { language: "pt-BR", region: "BR" }, signal }),
    [],
  );
  const loadTopRated = useCallback(
    (signal) => fetchTmdb("movie/top_rated", { params: { language: "pt-BR" }, signal }),
    [],
  );
  const loadNowPlaying = useCallback(
    (signal) =>
      fetchTmdb("movie/now_playing", { params: { language: "pt-BR", region: "BR" }, signal }),
    [],
  );
  const loadGenres = useCallback(
    (signal) => fetchTmdb("genre/movie/list", { params: { language: "pt-BR" }, signal }),
    [],
  );

  const popular = useAsyncData(loadPopular);
  const topRated = useAsyncData(loadTopRated);
  const nowPlaying = useAsyncData(loadNowPlaying);
  const genres = useAsyncData(loadGenres);

  const genresById = useMemo(
    () => new Map((genres.data?.genres ?? []).map(({ id, name }) => [id, name])),
    [genres.data],
  );

  const popularMovies = popular.data?.results ?? [];
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
            movies={topRated.data?.results}
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
          movies={nowPlaying.data?.results}
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
                : genres.data?.genres?.map((genre) => (
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
