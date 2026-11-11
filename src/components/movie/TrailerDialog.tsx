import { PiArrowUpRight } from "react-icons/pi";
import { interpolate, messages } from "../../i18n";
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from "../../lib/movie";
import Dialog from "../ui/Dialog";

const text = messages.movie;

interface TrailerDialogProps {
  open: boolean;
  onClose: () => void;
  videoKey: string;
  title: string;
}

/**
 * Reproduz o trailer na própria página. O iframe só existe enquanto o
 * diálogo está aberto, então o vídeo para ao fechar.
 */
const TrailerDialog = ({ open, onClose, videoKey, title }: TrailerDialogProps) => {
  const embedUrl = getYouTubeEmbedUrl(videoKey);
  const watchUrl = getYouTubeWatchUrl(videoKey);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="media"
      title={interpolate(text.trailerTitle, { title })}
      footer={
        watchUrl && (
          <a className="btn btn--quiet" href={watchUrl} target="_blank" rel="noopener noreferrer">
            {text.openYouTube} <PiArrowUpRight aria-hidden="true" />
          </a>
        )
      }
    >
      {embedUrl && (
        <div className="trailer-frame">
          <iframe
            src={embedUrl}
            title={interpolate(text.trailerFrame, { title })}
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
