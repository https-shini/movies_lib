import { PiArrowUpRight } from "react-icons/pi";
import { getYouTubeEmbedUrl } from "../../lib/movie";
import Dialog from "../ui/Dialog";

/**
 * Reproduz o trailer na própria página. O iframe só existe enquanto o
 * diálogo está aberto, então o vídeo para ao fechar.
 */
const TrailerDialog = ({ open, onClose, videoKey, title }) => {
  const embedUrl = getYouTubeEmbedUrl(videoKey);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="media"
      title={`Trailer: ${title}`}
      footer={
        videoKey && (
          <a
            className="btn btn--quiet"
            href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir no YouTube <PiArrowUpRight aria-hidden="true" />
          </a>
        )
      }
    >
      {embedUrl && (
        <div className="trailer-frame">
          <iframe
            src={embedUrl}
            title={`Trailer de ${title}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
    </Dialog>
  );
};

export default TrailerDialog;
