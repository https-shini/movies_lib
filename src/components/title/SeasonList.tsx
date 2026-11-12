import { messages, plural } from "../../i18n";
import { getReleaseYear } from "../../lib/format";
import { sortSeasons } from "../../lib/tv";
import type { Season } from "../../types/tmdb";
import { Poster } from "../movie/PosterCard";
import SectionHeader from "../ui/SectionHeader";
import "./SeasonList.css";

const text = messages.tv;

interface SeasonListProps {
  id: string;
  index?: string | undefined;
  seasons: readonly Season[];
}

/** Temporadas da série: pôster, ano de estreia, episódios e resumo. */
const SeasonList = ({ id, index, seasons }: SeasonListProps) => {
  if (!seasons.length) return null;
  const titleId = `${id}-title`;

  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <SectionHeader
        id={titleId}
        index={index}
        title={text.seasonsTitle}
        subtitle={text.seasonsSubtitle}
      />
      <ul className="seasons" role="list" aria-label={text.seasonsLabel}>
        {sortSeasons(seasons).map((season) => (
          <li key={season.id} className="season">
            <Poster
              path={season.poster_path}
              title={season.name}
              className="season__poster"
              variant="thumb"
            />
            <div className="season__body">
              <h3 className="season__name">{season.name}</h3>
              <p className="season__meta mono">
                {[
                  getReleaseYear(season.air_date),
                  season.episode_count ? plural(text.episodesCount, season.episode_count) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {season.overview && <p className="season__overview">{season.overview}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SeasonList;
