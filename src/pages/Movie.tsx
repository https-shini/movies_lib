import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  PiArrowDown,
  PiCalendarBlank,
  PiChartLineUp,
  PiFilmSlate,
  PiHourglassMedium,
  PiPencilSimpleLine,
  PiPlayFill,
  PiShieldCheck,
  PiTranslate,
  PiWallet,
} from "react-icons/pi";
import { messages } from "../i18n";
import { pickGalleryImages } from "../lib/images";
import { sectionCounter } from "../lib/sections";
import {
  DIRECTOR_JOBS,
  getBrazilianRating,
  getYouTubeTrailerKey,
  groupCrew,
  MAX_CAST,
  pickCrew,
  pickGalleryVideos,
  pickRelatedMovies,
  WRITER_JOBS,
} from "../lib/movie";
import { useMovie } from "../hooks/useMovie";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  formatAgeRating,
  formatCurrency,
  formatLanguage,
  formatReleaseDate,
  formatRuntime,
  getReleaseYear,
  textOr,
} from "../lib/format";
import MovieRail from "../components/movie/MovieRail";
import TrailerDialog from "../components/movie/TrailerDialog";
import WatchProviders from "../components/movie/WatchProviders";
import PeopleRail from "../components/person/PeopleRail";
import PersonLinks from "../components/person/PersonLinks";
import CollectionBanner from "../components/title/CollectionBanner";
import ExternalLinks from "../components/title/ExternalLinks";
import FactGrid, { type Fact } from "../components/title/FactGrid";
import FullCredits, { type CreditGroup } from "../components/title/FullCredits";
import { departmentLabel } from "../lib/people";
import ImageGallery from "../components/title/ImageGallery";
import SectionNav from "../components/title/SectionNav";
import TitleHero, { TitleHeroSkeleton } from "../components/title/TitleHero";
import VideoGallery from "../components/title/VideoGallery";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import NotFound from "./NotFound";
import "./Movie.css";

const text = messages.movie;
const titleText = messages.title;

const MovieDetails = ({ id }: { id: string }) => {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { data: movie, isLoading, error, reload } = useMovie(id);
  useDocumentTitle(textOr(movie?.title, isLoading ? text.loadingTitle : text.fallbackTitle));

  if (isLoading) return <TitleHeroSkeleton label={text.loading} />;

  if (error || !movie) {
    return (
      <main className="page">
        <div className="shell">
          <StateMessage
            tone="error"
            title={text.error}
            message={error || text.notFound}
            onRetry={reload}
            action={
              <Link to="/" className="btn btn--quiet">
                {messages.common.backHome}
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const title = textOr(movie.title, messages.common.untitled);
  const trailerKey = getYouTubeTrailerKey(movie.videos?.results);
  const fullCast = movie.credits?.cast ?? [];
  const cast = fullCast.slice(0, MAX_CAST);
  const related = pickRelatedMovies(movie);
  const directors = pickCrew(movie.credits, DIRECTOR_JOBS, 2);
  const writers = pickCrew(movie.credits, WRITER_JOBS, 3);
  const year = getReleaseYear(movie.release_date);
  const runtime = movie.runtime ?? 0;
  const videos = pickGalleryVideos(movie.videos?.results);
  const images = pickGalleryImages(movie.images);

  const facts: Fact[] = [
    ...(directors.length
      ? [{ label: text.directing, value: <PersonLinks people={directors} />, Icon: PiFilmSlate }]
      : []),
    ...(writers.length
      ? [{ label: text.writing, value: <PersonLinks people={writers} />, Icon: PiPencilSimpleLine }]
      : []),
    { label: text.release, value: formatReleaseDate(movie.release_date), Icon: PiCalendarBlank },
    { label: text.runtime, value: formatRuntime(movie.runtime), Icon: PiHourglassMedium },
    {
      label: text.ageRating,
      value: formatAgeRating(getBrazilianRating(movie.release_dates)),
      Icon: PiShieldCheck,
    },
    { label: text.language, value: formatLanguage(movie.original_language), Icon: PiTranslate },
    { label: text.budget, value: formatCurrency(movie.budget), Icon: PiWallet },
    { label: text.revenue, value: formatCurrency(movie.revenue), Icon: PiChartLineUp },
  ];

  const creditGroups: CreditGroup[] = [
    {
      key: "cast",
      label: titleText.fullCast,
      people: fullCast.map((person) => ({
        id: person.id,
        name: person.name,
        role: person.character ?? "",
      })),
    },
    ...groupCrew(movie.credits?.crew).map((group) => ({
      key: group.department,
      label: departmentLabel(group.department),
      people: group.members.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.jobs.join(", "),
      })),
    })),
  ];

  const kicker =
    [year, runtime > 0 ? formatRuntime(runtime) : null].filter(Boolean).join(" · ") ||
    text.fallbackTitle;

  const next = sectionCounter();
  const sections = [
    { id: "overview", label: titleText.overview },
    { id: "where-to-watch", label: titleText.whereToWatch },
    ...(cast.length ? [{ id: "cast", label: titleText.cast }] : []),
    ...(videos.length ? [{ id: "videos", label: titleText.videos }] : []),
    ...(images.length ? [{ id: "images", label: titleText.images }] : []),
    ...(related.length ? [{ id: "related", label: titleText.related }] : []),
  ];

  return (
    <main className="movie">
      <TitleHero
        titleId="movie-title"
        title={title}
        kicker={kicker}
        originalTitle={movie.original_title}
        backdropPath={movie.backdrop_path}
        posterPath={movie.poster_path}
        genres={(movie.genres ?? []).map((genre) => ({
          ...genre,
          href: `/discover?genre=${String(genre.id)}`,
        }))}
        voteAverage={movie.vote_average}
        voteCount={movie.vote_count}
      >
        {trailerKey && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setTrailerOpen(true);
            }}
          >
            <PiPlayFill aria-hidden="true" /> {text.watchTrailer}
          </button>
        )}
        <a className="btn btn--ghost" href="#where-to-watch">
          {text.whereToWatch} <PiArrowDown aria-hidden="true" />
        </a>
      </TitleHero>

      <div className="shell">
        <SectionNav items={sections} />

        <div id="overview" className="movie-body section">
          <section className="movie-body__overview" aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">
              {text.overviewTitle}
            </h2>
            {movie.tagline && <p className="movie-tagline">{movie.tagline}</p>}
            <p className="movie-overview">{textOr(movie.overview, text.noOverview)}</p>
            <ExternalLinks ids={movie.external_ids} homepage={movie.homepage} imdb="title" />
          </section>

          <FactGrid titleId="facts-title" title={text.factsTitle} facts={facts} />
        </div>

        {movie.belongs_to_collection && (
          <CollectionBanner collection={movie.belongs_to_collection} />
        )}

        <section id="where-to-watch" className="section" aria-labelledby="providers-title">
          <SectionHeader
            id="providers-title"
            index={next()}
            title={text.providersTitle}
            subtitle={text.providersSubtitle}
          />
          <WatchProviders providers={movie["watch/providers"]} />
        </section>

        <PeopleRail
          id="cast"
          index={cast.length ? next() : undefined}
          title={text.castTitle}
          subtitle={titleText.castSubtitle}
          people={cast.map((person) => ({
            id: person.id,
            name: person.name,
            role: textOr(person.character, text.noCharacter),
            profilePath: person.profile_path,
          }))}
        >
          <FullCredits groups={creditGroups} />
        </PeopleRail>

        <VideoGallery
          id="videos"
          index={videos.length ? next() : undefined}
          title={title}
          videos={videos}
        />

        <ImageGallery
          id="images"
          index={images.length ? next() : undefined}
          title={title}
          images={images}
        />

        {related.length > 0 && (
          <MovieRail
            id="related-title"
            anchor="related"
            index={next()}
            title={text.relatedTitle}
            movies={related}
            isLoading={false}
          />
        )}
      </div>

      {trailerKey && (
        <TrailerDialog
          open={trailerOpen}
          onClose={() => {
            setTrailerOpen(false);
          }}
          videoKey={trailerKey}
          title={title}
        />
      )}
    </main>
  );
};

const Movie = () => {
  const { id = "" } = useParams();

  // Evita uma requisição para endereços como /movie/abc.
  if (!/^\d+$/.test(id)) return <NotFound />;

  // A key reinicia o estado ao navegar entre filmes recomendados.
  return <MovieDetails key={id} id={id} />;
};

export default Movie;
