import { useMemo } from "react";
import { Link } from "react-router";
import { PiArrowRight } from "react-icons/pi";
import { messages } from "../i18n";
import { useGenres } from "../hooks/useGenres";
import { useMovies, type MovieSource } from "../hooks/useMovies";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import FeaturedHero from "../components/movie/FeaturedHero";
import MovieRail from "../components/movie/MovieRail";
import RankedList from "../components/movie/RankedList";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import "./Home.css";

const text = messages.home;

const POPULAR: MovieSource = { kind: "list", list: "popular" };
const TOP_RATED: MovieSource = { kind: "list", list: "top_rated" };
const NOW_PLAYING: MovieSource = { kind: "list", list: "now_playing" };

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

  const [featured, ...trending] = popular.movies;

  return (
    <main className="home">
      {popular.error ? (
        <div className="shell home__hero-error">
          <StateMessage
            tone="error"
            title={text.featuredError}
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
            title={text.trendingTitle}
            subtitle={text.trendingSubtitle}
            movies={trending}
            isLoading={popular.isLoading}
            onRetry={popular.reload}
            link={
              <Link to="/discover" className="text-link">
                {text.seeAll}
              </Link>
            }
          />
        )}

        <section className="section" aria-labelledby="ranked-title">
          <SectionHeader
            id="ranked-title"
            index="02"
            title={text.rankedTitle}
            subtitle={text.rankedSubtitle}
            aside={
              <Link to="/discover?sort=vote_average.desc" className="text-link">
                {text.rankedLink}
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
          title={text.nowPlayingTitle}
          subtitle={text.nowPlayingSubtitle}
          movies={nowPlaying.movies}
          isLoading={nowPlaying.isLoading}
          error={nowPlaying.error}
          onRetry={nowPlaying.reload}
          link={
            <Link to="/discover?sort=primary_release_date.desc" className="text-link">
              {text.nowPlayingLink}
            </Link>
          }
        />

        <section className="section" aria-labelledby="genres-title">
          <SectionHeader
            id="genres-title"
            index="04"
            title={text.genresTitle}
            subtitle={text.genresSubtitle}
          />
          {genres.error ? (
            <StateMessage
              tone="error"
              compact
              title={text.genresError}
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
