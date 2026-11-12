import { useState } from "react";
import { PiPlayFill } from "react-icons/pi";
import { interpolate, messages } from "../../i18n";
import type { GalleryVideo } from "../../lib/movie";
import TrailerDialog from "../movie/TrailerDialog";
import SectionHeader from "../ui/SectionHeader";
import "./VideoGallery.css";

const text = messages.title;

interface VideoGalleryProps {
  id: string;
  index?: string | undefined;
  /** Nome do filme ou da série, usado no título do player. */
  title: string;
  videos: readonly GalleryVideo[];
}

/** Trailers, teasers, cenas e bastidores. Cada vídeo abre no player da própria página. */
const VideoGallery = ({ id, index, title, videos }: VideoGalleryProps) => {
  const [playing, setPlaying] = useState<GalleryVideo | null>(null);
  if (!videos.length) return null;
  const titleId = `${id}-title`;

  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <SectionHeader
        id={titleId}
        index={index}
        title={text.videosTitle}
        subtitle={text.videosSubtitle}
      />
      <ul className="video-grid" role="list" aria-label={text.videosTitle}>
        {videos.map((video) => {
          const name = video.name || text.videoTypes[video.type];
          return (
            <li key={video.id}>
              <button
                type="button"
                className="video-card"
                onClick={() => {
                  setPlaying(video);
                }}
                aria-label={interpolate(text.videoPlay, { name })}
              >
                <span className="video-card__play" aria-hidden="true">
                  <PiPlayFill />
                </span>
                <span className="video-card__body">
                  <span className="video-card__type mono">{text.videoTypes[video.type]}</span>
                  <span className="video-card__name">{name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {playing && (
        <TrailerDialog
          open
          onClose={() => {
            setPlaying(null);
          }}
          videoKey={playing.key}
          title={playing.name ? `${title}: ${playing.name}` : title}
        />
      )}
    </section>
  );
};

export default VideoGallery;
