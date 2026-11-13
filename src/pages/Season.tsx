import { Link, useParams } from "react-router";
import { PiImage, PiStarFill } from "react-icons/pi";
import { interpolate, messages, plural } from "../i18n";
import {
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getReleaseYear,
  textOr,
} from "../lib/format";
import { backdropSrcSet, getBackdropUrl, getStillUrl, stillSrcSet } from "../lib/images";
import { mediaPath, seasonPath } from "../lib/media";
import { sortSeasons } from "../lib/tv";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useSeason } from "../hooks/useSeason";
import { isSeasonNumber } from "../services/prefetch";
import Breadcrumbs from "../components/layout/Breadcrumbs";
import { Poster } from "../components/movie/PosterCard";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import type { Episode } from "../types/tmdb";
import NotFound from "./NotFound";
import seasonStyles from "./Season.css?url";
import { loadStylesheet } from "../lib/stylesheet";

const text = messages.season;

/** Hoje no formato do TMDB (AAAA-MM-DD), no fuso de quem está vendo. */
function today(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const SeasonSkeleton = () => (
  <main className="season-page" aria-busy="true" aria-label={text.loading}>
    <section className="season-hero">
      <div className="season-hero__inner shell">
        <span className="skeleton skeleton--text" style={{ width: "14rem" }} />
        <div className="season-hero__body">
          <div className="season-hero__poster skeleton" />
          <div className="season-hero__copy">
            <span className="skeleton skeleton--text" style={{ width: "10rem" }} />
            <span className="skeleton season-hero__title-skeleton" />
          </div>
        </div>
      </div>
    </section>
  </main>
);

const EpisodeCard = ({ episode, upcoming }: { episode: Episode; upcoming: boolean }) => {
  const still = getStillUrl(episode.still_path);
  const rating = formatRating(episode.vote_average);
  const number = String(episode.episode_number).padStart(2, "0");
  const tags = [
    upcoming ? { label: text.upcoming, tone: "info" } : null,
    episode.episode_type === "finale" ? { label: text.finale, tone: "editorial" } : null,
  ].filter((tag) => tag !== null);
  const meta = [
    episode.air_date ? formatReleaseDate(episode.air_date) : null,
    episode.runtime ? formatRuntime(episode.runtime) : null,
  ].filter(Boolean);

  return (
    <li className="episode">
      <article className="episode__card" aria-labelledby={`episode-${String(episode.id)}`}>
        <div className="episode__media">
          {still ? (
            <img
              src={still}
              srcSet={stillSrcSet(episode.still_path)}
              sizes="(max-width: 699px) 40vw, 300px"
              alt=""
              width={300}
              height={169}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <PiImage className="episode__placeholder" aria-hidden="true" />
          )}
          <span className="episode__number badge badge--accent" aria-hidden="true">
            {interpolate(text.episodeShort, { number })}
          </span>
        </div>
        <div className="episode__body">
          <p className="episode__kicker mono">
            {interpolate(text.episodeNumber, { number: episode.episode_number })}
          </p>
          <h3 id={`episode-${String(episode.id)}`} className="episode__title">
            {textOr(episode.name, interpolate(text.episodeNumber, { number }))}
          </h3>
          {(meta.length > 0 || rating !== null || tags.length > 0) && (
            <p className="episode__meta">
              {meta.length > 0 && <span>{meta.join(" · ")}</span>}
              {rating && (
                <span className="episode__rating">
                  <PiStarFill aria-hidden="true" />
                  <span className="sr-only">
                    {interpolate(messages.common.ratingLabel, { rating })}
                  </span>
                  <span aria-hidden="true">{rating}</span>
                </span>
              )}
              {tags.map((tag) => (
                <span key={tag.label} className={`badge badge--${tag.tone}`}>
                  {tag.label}
                </span>
              ))}
            </p>
          )}
        </div>
        <p className={`episode__overview ${episode.overview ? "" : "episode__overview--empty"}`}>
          {textOr(episode.overview, text.noOverview)}
        </p>
      </article>
    </li>
  );
};

const SeasonDetailsPage = ({ id, number }: { id: string; number: string }) => {
  const { data, isLoading, error, reload } = useSeason(id, number);
  const showName = textOr(data?.show.name, messages.tv.fallbackTitle);
  const seasonName = textOr(data?.season.name, text.fallbackTitle);
  useDocumentTitle(
    data
      ? interpolate(text.documentTitle, { season: seasonName, show: showName })
      : isLoading
        ? text.loadingTitle
        : text.fallbackTitle,
  );

  if (isLoading) return <SeasonSkeleton />;

  if (error || !data) {
    return (
      <main className="page">
        <div className="shell">
          <StateMessage
            tone="error"
            title={text.error}
            message={error || text.notFound}
            onRetry={reload}
            action={
              <Link to={mediaPath("tv", id)} className="btn btn--quiet">
                {text.backToSeries}
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const { show, season } = data;
  const showUrl = mediaPath("tv", show.id);
  const episodes = [...season.episodes].sort((a, b) => a.episode_number - b.episode_number);
  const totalRuntime = episodes.reduce((sum, episode) => sum + (episode.runtime ?? 0), 0);
  const seasons = sortSeasons(show.seasons ?? []);
  const backdrop = getBackdropUrl(show.backdrop_path);
  const now = today();
  const rating = formatRating(season.vote_average);
  const kicker = [
    getReleaseYear(season.air_date),
    episodes.length ? plural(messages.tv.episodesCount, episodes.length) : null,
    totalRuntime ? interpolate(text.totalRuntime, { runtime: formatRuntime(totalRuntime) }) : null,
  ].filter(Boolean);

  return (
    <main className="season-page">
      <section className="season-hero" aria-labelledby="season-title">
        <div className="season-hero__media">
          {backdrop && (
            <img
              src={backdrop}
              srcSet={backdropSrcSet(show.backdrop_path, ["w780", "w1280"])}
              sizes="100vw"
              alt=""
              fetchPriority="high"
            />
          )}
        </div>
        <div className="season-hero__inner shell">
          <Breadcrumbs
            label={text.breadcrumbLabel}
            items={[
              { label: messages.nav.home, to: "/" },
              { label: showName, to: showUrl },
              { label: seasonName },
            ]}
          />
          <div className="season-hero__body reveal">
            <Poster
              path={season.poster_path ?? show.poster_path}
              title={seasonName}
              className="season-hero__poster"
              variant="thumb"
              eager
            />
            <div className="season-hero__copy">
              {kicker.length > 0 && (
                <p className="season-hero__kicker mono">{kicker.join(" · ")}</p>
              )}
              <h1 id="season-title" className="season-hero__title display">
                {seasonName}
              </h1>
              <p className="season-hero__show">
                <Link to={showUrl} className="text-link">
                  {showName}
                </Link>
                {rating && (
                  <span className="season-hero__rating">
                    <PiStarFill aria-hidden="true" />
                    <span className="sr-only">
                      {interpolate(messages.common.ratingLabel, { rating })}
                    </span>
                    <span aria-hidden="true">{rating}</span>
                  </span>
                )}
              </p>
              {season.overview && <p className="season-hero__overview">{season.overview}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="shell season-page__content">
        {seasons.length > 1 && (
          <nav className="season-switcher" aria-label={text.switcherLabel}>
            <ul className="season-switcher__list" role="list">
              {seasons.map((item) => {
                const current = String(item.season_number) === String(season.season_number);
                return (
                  <li key={item.id}>
                    <Link
                      to={seasonPath(show.id, item.season_number)}
                      className="chip"
                      aria-current={current ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <section className="section" aria-labelledby="episodes-title">
          <SectionHeader
            id="episodes-title"
            title={text.episodesTitle}
            subtitle={text.episodesSubtitle}
          />
          {episodes.length ? (
            <ol className="episodes" aria-label={text.episodesLabel}>
              {episodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  upcoming={Boolean(episode.air_date && episode.air_date > now)}
                />
              ))}
            </ol>
          ) : (
            <StateMessage tone="empty" compact message={text.noEpisodes} />
          )}
        </section>

        <p className="season-page__back">
          <Link to={showUrl} className="btn btn--quiet">
            {interpolate(text.backToShow, { show: showName })}
          </Link>
        </p>
      </div>
    </main>
  );
};

/**
 * Estilos da página fora do CSS global (D-63). O carregamento da rota espera por eles,
 * então a página nunca aparece sem estilo.
 */
export const styles = (): Promise<void> => loadStylesheet(seasonStyles);

const Season = () => {
  const { id, season } = useParams();
  if (!id || !/^\d+$/.test(id) || !isSeasonNumber(season)) return <NotFound />;
  return <SeasonDetailsPage key={`${id}-${season}`} id={id} number={season} />;
};

export default Season;
