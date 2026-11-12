import { useState } from "react";
import { Link, useParams } from "react-router";
import { PiUser } from "react-icons/pi";
import { interpolate, locale, messages, plural } from "../i18n";
import { formatReleaseDate, textOr } from "../lib/format";
import { getProfileUrl, pickGalleryImages } from "../lib/images";
import { mediaPath, type MediaType } from "../lib/media";
import { buildFilmography, getAge, pickKnownFor, type FilmographyEntry } from "../lib/person";
import { sectionCounter } from "../lib/sections";
import { usePerson } from "../hooks/usePerson";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { MovieSummary } from "../types/tmdb";
import MovieRail from "../components/movie/MovieRail";
import ExternalLinks from "../components/title/ExternalLinks";
import { departmentLabel } from "../lib/people";
import ImageGallery from "../components/title/ImageGallery";
import SectionNav from "../components/title/SectionNav";
import Rating from "../components/ui/Rating";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import NotFound from "./NotFound";
import "./Person.css";

const text = messages.person;

/** Biografias mais longas que isto começam recolhidas. */
const BIOGRAPHY_PREVIEW = 700;

const PersonSkeleton = () => (
  <main className="page person" aria-busy="true" aria-label={text.loading}>
    <div className="shell">
      <div className="person-head">
        <div className="person-head__photo skeleton" />
        <div className="person-head__info">
          <span className="skeleton skeleton--text" style={{ width: "8rem" }} />
          <span className="skeleton person-head__title-skeleton" />
          <span className="skeleton skeleton--text" style={{ width: "min(26rem, 90%)" }} />
        </div>
      </div>
    </div>
  </main>
);

const toCard = (entry: FilmographyEntry): MovieSummary => ({
  id: entry.id,
  title: entry.title,
  poster_path: entry.posterPath,
  ...(entry.date ? { release_date: entry.date } : {}),
  ...(entry.voteAverage !== null ? { vote_average: entry.voteAverage } : {}),
  media_type: entry.mediaType,
});

const Biography = ({ biography, inEnglish }: { biography: string; inEnglish: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = biography
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const isLong = biography.length > BIOGRAPHY_PREVIEW;

  if (!paragraphs.length) return <p className="person-bio__missing">{text.biographyMissing}</p>;

  return (
    <div className="person-bio">
      {inEnglish && <p className="person-bio__note mono">{text.biographyEnglish}</p>}
      <div
        id="biography-text"
        className={`person-bio__text ${isLong && !expanded ? "person-bio__text--clamped" : ""}`}
        lang={inEnglish ? "en" : undefined}
      >
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      {isLong && (
        <button
          type="button"
          className="btn btn--ghost"
          aria-expanded={expanded}
          aria-controls="biography-text"
          onClick={() => {
            setExpanded((value) => !value);
          }}
        >
          {expanded ? text.readLess : text.readMore}
        </button>
      )}
    </div>
  );
};

type MediaFilter = "all" | MediaType;

const MEDIA_FILTERS: readonly { value: MediaFilter; label: string }[] = [
  { value: "all", label: text.filterAll },
  { value: "movie", label: text.filterMovies },
  { value: "tv", label: text.filterSeries },
];

interface FilmographyProps {
  groups: ReturnType<typeof buildFilmography>;
  index: string;
}

const Filmography = ({ groups, index }: FilmographyProps) => {
  const [department, setDepartment] = useState(groups[0]?.department ?? "");
  const [media, setMedia] = useState<MediaFilter>("all");
  const active = groups.find((group) => group.department === department) ?? groups[0];
  if (!active) return null;

  const entries = active.entries.filter((entry) => media === "all" || entry.mediaType === media);

  return (
    <section id="filmography" className="section" aria-labelledby="filmography-title">
      <SectionHeader
        id="filmography-title"
        index={index}
        title={text.filmographyTitle}
        subtitle={text.filmographySubtitle}
      />

      <div className="filmography__filters">
        {groups.length > 1 && (
          <ul className="filmography__chips" role="list" aria-label={text.departmentsLabel}>
            {groups.map((group) => (
              <li key={group.department}>
                <button
                  type="button"
                  className="chip"
                  aria-pressed={group.department === active.department}
                  onClick={() => {
                    setDepartment(group.department);
                  }}
                >
                  {interpolate(text.departmentCount, {
                    department: departmentLabel(group.department),
                    count: group.entries.length,
                  })}
                </button>
              </li>
            ))}
          </ul>
        )}
        <ul className="filmography__chips" role="list" aria-label={text.mediaFilterLabel}>
          {MEDIA_FILTERS.map(({ value, label }) => (
            <li key={value}>
              <button
                type="button"
                className="chip"
                aria-pressed={media === value}
                onClick={() => {
                  setMedia(value);
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {entries.length ? (
        <ol
          className="filmography"
          role="list"
          aria-label={interpolate(text.creditsLabel, {
            department: departmentLabel(active.department),
          })}
        >
          {entries.map((entry) => (
            <li key={`${entry.mediaType}-${String(entry.id)}`}>
              <Link to={mediaPath(entry.mediaType, entry.id)} className="filmography__row">
                <span className="filmography__year mono">{entry.year ?? text.upcoming}</span>
                <span className="filmography__body">
                  <span className="filmography__title">{entry.title}</span>
                  <span className="filmography__role">
                    {[
                      entry.roles.join(", ") || text.noRole,
                      entry.mediaType === "tv" && entry.episodeCount
                        ? plural(text.episodes, entry.episodeCount)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="filmography__aside">
                  {entry.mediaType === "tv" && (
                    <span className="filmography__badge mono">{messages.title.seriesBadge}</span>
                  )}
                  {entry.voteCount > 0 && <Rating value={entry.voteAverage} />}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <StateMessage compact title={text.emptyFilter} />
      )}
    </section>
  );
};

const PersonProfile = ({ id }: { id: string }) => {
  const { data: person, isLoading, error, reload } = usePerson(id);
  useDocumentTitle(textOr(person?.name, isLoading ? text.loadingTitle : text.fallbackTitle));

  if (isLoading) return <PersonSkeleton />;

  if (error || !person) {
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

  const photo = getProfileUrl(person.profile_path, "h632");
  const department = person.known_for_department ?? null;
  const groups = buildFilmography(person.combined_credits, department);
  const knownFor = pickKnownFor(person.combined_credits, department).map(toCard);
  const photos = pickGalleryImages({ profiles: person.images?.profiles });
  const totalCredits = groups.reduce((sum, group) => sum + group.entries.length, 0);
  const age = getAge(person.birthday, person.deathday);
  const biography = person.biography?.trim() ?? "";

  const bornText = person.birthday ? formatReleaseDate(person.birthday) : "";
  const diedText = person.deathday ? formatReleaseDate(person.deathday) : "";
  const facts: { label: string; value: string }[] = [
    ...(bornText
      ? [
          {
            label: text.born,
            value:
              age !== null && !person.deathday
                ? `${bornText} (${interpolate(text.age, { age })})`
                : bornText,
          },
        ]
      : []),
    ...(diedText
      ? [
          {
            label: text.died,
            value:
              age !== null ? `${diedText} (${interpolate(text.ageAtDeath, { age })})` : diedText,
          },
        ]
      : []),
    ...(person.place_of_birth ? [{ label: text.birthplace, value: person.place_of_birth }] : []),
    ...(totalCredits > 0
      ? [
          {
            label: text.credits,
            value: interpolate(text.creditsCount, { count: totalCredits.toLocaleString(locale) }),
          },
        ]
      : []),
  ];

  const next = sectionCounter();
  const sections = [
    { id: "biography", label: text.biographyTitle },
    ...(knownFor.length ? [{ id: "known-for", label: text.knownForTitle }] : []),
    ...(groups.length ? [{ id: "filmography", label: text.filmographyTitle }] : []),
    ...(photos.length > 1 ? [{ id: "photos", label: text.photosTitle }] : []),
  ];

  return (
    <main className="page person">
      <div className="shell">
        <header className="person-head reveal">
          <div className="person-head__photo">
            {photo ? (
              <img src={photo} alt="" fetchPriority="high" />
            ) : (
              <PiUser aria-hidden="true" />
            )}
          </div>
          <div className="person-head__info">
            <p className="page-head__kicker mono">
              {[text.kicker, department ? departmentLabel(department) : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="person-head__title display">{person.name}</h1>
            {facts.length > 0 && (
              <dl className="person-facts">
                {facts.map(({ label, value }) => (
                  <div key={label} className="person-facts__row">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <ExternalLinks ids={person.external_ids} homepage={person.homepage} imdb="name" />
          </div>
        </header>

        <SectionNav items={sections} />

        <section id="biography" className="section" aria-labelledby="biography-title">
          <SectionHeader id="biography-title" index={next()} title={text.biographyTitle} />
          <Biography biography={biography} inEnglish={person.biographyInEnglish} />
        </section>

        {knownFor.length > 0 && (
          <MovieRail
            id="known-for-title"
            anchor="known-for"
            index={next()}
            title={text.knownForTitle}
            subtitle={text.knownForSubtitle}
            movies={knownFor}
            isLoading={false}
          />
        )}

        {groups.length > 0 && <Filmography groups={groups} index={next()} />}

        {photos.length > 1 && (
          <ImageGallery
            id="photos"
            index={next()}
            heading={text.photosTitle}
            subtitle={text.photosSubtitle}
            title={person.name}
            images={photos}
          />
        )}
      </div>
    </main>
  );
};

const Person = () => {
  const { id = "" } = useParams();
  if (!/^\d+$/.test(id)) return <NotFound />;
  return <PersonProfile key={id} id={id} />;
};

export default Person;
