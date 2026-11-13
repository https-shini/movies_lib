import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  PiArrowDown,
  PiBroadcast,
  PiCalendarBlank,
  PiCalendarCheck,
  PiListNumbers,
  PiPencilSimpleLine,
  PiPlayFill,
  PiPulse,
  PiShieldCheck,
  PiStack,
  PiTranslate,
} from "react-icons/pi";
import { interpolate, messages, plural } from "../i18n";
import {
  formatAgeRating,
  formatLanguage,
  formatReleaseDate,
  getReleaseYear,
  textOr,
} from "../lib/format";
import { pickGalleryImages } from "../lib/images";
import { fromTv } from "../lib/media";
import { getYouTubeTrailerKey, pickGalleryVideos } from "../lib/movie";
import { sectionCounter } from "../lib/sections";
import { getBrazilianTvRating, pickTvCast } from "../lib/tv";
import { useTv } from "../hooks/useTv";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import MovieRail from "../components/movie/MovieRail";
import TrailerDialog from "../components/movie/TrailerDialog";
import WatchProviders from "../components/movie/WatchProviders";
import PeopleRail from "../components/person/PeopleRail";
import PersonLinks from "../components/person/PersonLinks";
import ExternalLinks from "../components/title/ExternalLinks";
import FactGrid, { type Fact } from "../components/title/FactGrid";
import FullCredits, { type CreditGroup } from "../components/title/FullCredits";
import { departmentLabel } from "../lib/people";
import ImageGallery from "../components/title/ImageGallery";
import SeasonList from "../components/title/SeasonList";
import SaveButton from "../components/title/SaveButton";
import SectionNav from "../components/title/SectionNav";
import TitleHero, { TitleHeroSkeleton } from "../components/title/TitleHero";
import VideoGallery from "../components/title/VideoGallery";
import SectionHeader from "../components/ui/SectionHeader";
import ShareButton from "../components/ui/ShareButton";
import StateMessage from "../components/ui/StateMessage";
import NotFound from "./NotFound";
import "./Movie.css";

const text = messages.tv;
const movieText = messages.movie;
const titleText = messages.title;

const MAX_CAST = 12;
const MAX_RELATED = 6;

const TvDetailsPage = ({ id }: { id: string }) => {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { data: show, isLoading, error, reload } = useTv(id);
  useDocumentTitle(textOr(show?.name, isLoading ? text.loadingTitle : text.fallbackTitle));

  if (isLoading) return <TitleHeroSkeleton label={text.loading} />;

  if (error || !show) {
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

  const title = textOr(show.name, messages.common.untitled);
  const trailerKey = getYouTubeTrailerKey(show.videos?.results);
  const fullCast = pickTvCast(show.aggregate_credits?.cast);
  const cast = fullCast.slice(0, MAX_CAST);
  const videos = pickGalleryVideos(show.videos?.results);
  const images = pickGalleryImages(show.images);
  const seasons = show.seasons ?? [];
  const seasonCount = show.number_of_seasons ?? 0;
  const episodeCount = show.number_of_episodes ?? 0;
  const creators = show.created_by ?? [];
  const networks = (show.networks ?? []).map((network) => network.name).join(", ");
  const status = show.status
    ? ((text.statuses as Record<string, string>)[show.status] ?? show.status)
    : "";

  const recommendations = show.recommendations?.results ?? [];
  const related = (recommendations.length ? recommendations : (show.similar?.results ?? []))
    .filter((item) => item.id !== show.id)
    .slice(0, MAX_RELATED)
    .map(fromTv);

  const facts: Fact[] = [
    ...(creators.length
      ? [
          {
            label: text.createdBy,
            value: <PersonLinks people={creators} />,
            Icon: PiPencilSimpleLine,
          },
        ]
      : []),
    { label: text.firstAir, value: formatReleaseDate(show.first_air_date), Icon: PiCalendarBlank },
    ...(show.last_air_date
      ? [
          {
            label: text.lastAir,
            value: formatReleaseDate(show.last_air_date),
            Icon: PiCalendarCheck,
          },
        ]
      : []),
    ...(seasonCount ? [{ label: text.seasons, value: String(seasonCount), Icon: PiStack }] : []),
    ...(episodeCount
      ? [{ label: text.episodes, value: String(episodeCount), Icon: PiListNumbers }]
      : []),
    ...(status ? [{ label: text.status, value: status, Icon: PiPulse }] : []),
    ...(networks ? [{ label: text.networks, value: networks, Icon: PiBroadcast }] : []),
    {
      label: movieText.ageRating,
      value: formatAgeRating(getBrazilianTvRating(show.content_ratings)),
      Icon: PiShieldCheck,
    },
    { label: movieText.language, value: formatLanguage(show.original_language), Icon: PiTranslate },
  ];

  const crewGroups = new Map<string, { id: number; name: string; role: string }[]>();
  for (const member of show.aggregate_credits?.crew ?? []) {
    const people = crewGroups.get(member.department) ?? [];
    if (!people.some((person) => person.id === member.id)) {
      people.push({
        id: member.id,
        name: member.name,
        role: member.jobs.map((job) => job.job).join(", "),
      });
    }
    crewGroups.set(member.department, people);
  }

  const creditGroups: CreditGroup[] = [
    {
      key: "cast",
      label: titleText.fullCast,
      people: fullCast.map((person) => ({
        id: person.id,
        name: person.name,
        role: person.characters.join(", "),
      })),
    },
    ...[...crewGroups.entries()].map(([department, people]) => ({
      key: department,
      label: departmentLabel(department),
      people,
    })),
  ];

  const kicker =
    [
      getReleaseYear(show.first_air_date),
      seasonCount ? plural(text.seasonsCount, seasonCount) : null,
    ]
      .filter(Boolean)
      .join(" · ") || text.fallbackTitle;

  const next = sectionCounter();
  const sections = [
    { id: "overview", label: titleText.overview },
    ...(seasons.length ? [{ id: "seasons", label: titleText.seasons }] : []),
    { id: "where-to-watch", label: titleText.whereToWatch },
    ...(cast.length ? [{ id: "cast", label: titleText.cast }] : []),
    ...(videos.length ? [{ id: "videos", label: titleText.videos }] : []),
    ...(images.length ? [{ id: "images", label: titleText.images }] : []),
    ...(related.length ? [{ id: "related", label: titleText.related }] : []),
  ];

  return (
    <main className="movie">
      <TitleHero
        titleId="tv-title"
        title={title}
        kicker={kicker}
        originalTitle={show.original_name}
        backdropPath={show.backdrop_path}
        posterPath={show.poster_path}
        genres={(show.genres ?? []).map((genre) => ({
          ...genre,
          href: `/discover?tipo=series&genre=${String(genre.id)}`,
        }))}
        voteAverage={show.vote_average}
        voteCount={show.vote_count}
      >
        {trailerKey && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setTrailerOpen(true);
            }}
          >
            <PiPlayFill aria-hidden="true" /> {movieText.watchTrailer}
          </button>
        )}
        <a className="btn btn--ghost" href="#where-to-watch">
          {movieText.whereToWatch} <PiArrowDown aria-hidden="true" />
        </a>
        <SaveButton
          item={{
            id: show.id,
            mediaType: "tv",
            title,
            posterPath: show.poster_path,
            date: show.first_air_date ?? "",
            voteAverage: show.vote_average ?? null,
          }}
        />
        <ShareButton title={title} />
      </TitleHero>

      <div className="shell">
        <SectionNav items={sections} />

        <div id="overview" className="movie-body section">
          <section className="movie-body__overview" aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">
              {movieText.overviewTitle}
            </h2>
            {show.tagline && <p className="movie-tagline">{show.tagline}</p>}
            <p className="movie-overview">{textOr(show.overview, movieText.noOverview)}</p>
            <ExternalLinks ids={show.external_ids} homepage={show.homepage} imdb="title" />
          </section>

          <FactGrid titleId="facts-title" title={movieText.factsTitle} facts={facts} />
        </div>

        <SeasonList
          id="seasons"
          showId={show.id}
          index={seasons.length ? next() : undefined}
          seasons={seasons}
        />

        <section id="where-to-watch" className="section" aria-labelledby="providers-title">
          <SectionHeader
            id="providers-title"
            index={next()}
            title={movieText.providersTitle}
            subtitle={text.providersSubtitle}
          />
          <WatchProviders providers={show["watch/providers"]} />
        </section>

        <PeopleRail
          id="cast"
          index={cast.length ? next() : undefined}
          title={movieText.castTitle}
          subtitle={text.castSubtitle}
          people={cast.map((person) => ({
            id: person.id,
            name: person.name,
            role: textOr(person.characters[0], movieText.noCharacter),
            detail: person.episodeCount
              ? interpolate(text.episodesIn, { count: person.episodeCount })
              : undefined,
            profilePath: person.profilePath,
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

const Tv = () => {
  const { id = "" } = useParams();
  if (!/^\d+$/.test(id)) return <NotFound />;
  return <TvDetailsPage key={id} id={id} />;
};

export default Tv;
