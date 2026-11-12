import { useMemo } from "react";
import { Link } from "react-router";
import { PiArrowRight } from "react-icons/pi";
import { messages } from "../i18n";
import { useGenres } from "../hooks/useGenres";
import type { AsyncState } from "../hooks/useAsync";
import { useMovies, type MovieSource, type MoviesResult } from "../hooks/useMovies";
import { usePeople } from "../hooks/usePeople";
import { describePerson } from "../lib/people";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import FeaturedHero from "../components/movie/FeaturedHero";
import MovieRail from "../components/movie/MovieRail";
import RankedList from "../components/movie/RankedList";
import PeopleRail from "../components/person/PeopleRail";
import OnDemand from "../components/ui/OnDemand";
import SectionHeader from "../components/ui/SectionHeader";
import type { Paginated, PersonSummary } from "../types/tmdb";
import StateMessage from "../components/ui/StateMessage";
import "./Home.css";

const text = messages.home;

const POPULAR: MovieSource = { kind: "list", list: "popular" };
const TOP_RATED: MovieSource = { kind: "list", list: "top_rated" };
const NOW_PLAYING: MovieSource = { kind: "list", list: "now_playing" };
const SERIES: MovieSource = { kind: "tvPopular" };

/**
 * Seções abaixo da dobra. Cada uma tem a parte visual, que aceita `data: null` como
 * "ainda carregando", e um carregador que só é montado quando a seção chega perto da
 * tela (OnDemand): as consultas e as imagens deixam de disputar o carregamento inicial.
 */
const SeriesSection = ({ data }: { data: MoviesResult | null }) => (
  <MovieRail
    id="series-title"
    index="02"
    title={text.seriesTitle}
    subtitle={text.seriesSubtitle}
    movies={data?.movies ?? []}
    isLoading={data?.isLoading ?? true}
    error={data?.error}
    onRetry={data?.reload}
    link={
      <Link to="/discover?tipo=series" className="text-link">
        {text.seriesLink}
      </Link>
    }
  />
);
const SeriesLoader = () => <SeriesSection data={useMovies(SERIES)} />;

const RankedSection = ({ data }: { data: MoviesResult | null }) => (
  <section className="section" aria-labelledby="ranked-title">
    <SectionHeader
      id="ranked-title"
      index="03"
      title={text.rankedTitle}
      subtitle={text.rankedSubtitle}
      aside={
        <Link to="/discover?sort=vote_average.desc" className="text-link">
          {text.rankedLink}
        </Link>
      }
    />
    <RankedList
      movies={data?.movies ?? []}
      isLoading={data?.isLoading ?? true}
      error={data?.error ?? ""}
      onRetry={data?.reload ?? noop}
    />
  </section>
);
const RankedLoader = () => <RankedSection data={useMovies(TOP_RATED)} />;

const NowPlayingSection = ({ data }: { data: MoviesResult | null }) => (
  <MovieRail
    id="now-playing-title"
    index="04"
    title={text.nowPlayingTitle}
    subtitle={text.nowPlayingSubtitle}
    movies={data?.movies ?? []}
    isLoading={data?.isLoading ?? true}
    error={data?.error}
    onRetry={data?.reload}
    link={
      <Link to="/discover?sort=primary_release_date.desc" className="text-link">
        {text.nowPlayingLink}
      </Link>
    }
  />
);
const NowPlayingLoader = () => <NowPlayingSection data={useMovies(NOW_PLAYING)} />;

const PeopleSection = ({ data }: { data: AsyncState<Paginated<PersonSummary>> | null }) => {
  // Sem dados de pessoas a página segue útil: a faixa some em vez de mostrar um erro.
  if (data?.error) return null;

  return (
    <PeopleRail
      id="people"
      index="05"
      title={text.peopleTitle}
      subtitle={text.peopleSubtitle}
      isLoading={data?.isLoading ?? true}
      people={(data?.data?.results ?? []).map((person) => ({
        id: person.id,
        name: person.name,
        role: describePerson(person),
        profilePath: person.profile_path,
      }))}
      link={
        <Link to="/pessoas" className="text-link">
          {text.peopleLink}
        </Link>
      }
    />
  );
};
const PeopleLoader = () => <PeopleSection data={usePeople(null)} />;

const noop = () => undefined;

const Home = () => {
  useDocumentTitle("");

  const popular = useMovies(POPULAR);
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

        <OnDemand fallback={<SeriesSection data={null} />}>
          <SeriesLoader />
        </OnDemand>

        <OnDemand fallback={<RankedSection data={null} />}>
          <RankedLoader />
        </OnDemand>

        <OnDemand fallback={<NowPlayingSection data={null} />}>
          <NowPlayingLoader />
        </OnDemand>

        <OnDemand fallback={<PeopleSection data={null} />}>
          <PeopleLoader />
        </OnDemand>

        <section className="section" aria-labelledby="genres-title">
          <SectionHeader
            id="genres-title"
            index="06"
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
