import { useRef, useState } from "react";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import { interpolate, messages } from "../../i18n";
import { getGalleryUrl, type GalleryImage } from "../../lib/images";
import Dialog from "../ui/Dialog";
import Rail, { RailControls } from "../ui/Rail";
import SectionHeader from "../ui/SectionHeader";
import "./ImageGallery.css";

const text = messages.title;

const ALT = {
  backdrop: text.backdropAlt,
  poster: text.posterAlt,
  profile: text.profileAlt,
} as const;

interface ImageGalleryProps {
  id: string;
  index?: string | undefined;
  heading?: string | undefined;
  subtitle?: string | undefined;
  /** Nome da obra ou da pessoa, usado no texto alternativo. */
  title: string;
  images: readonly GalleryImage[];
}

/** Galeria de imagens em faixa; cada miniatura abre a imagem ampliada num diálogo. */
const ImageGallery = ({
  id,
  index,
  heading = text.imagesTitle,
  subtitle = text.imagesSubtitle,
  title,
  images,
}: ImageGalleryProps) => {
  const railRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  if (!images.length) return null;

  const titleId = `${id}-title`;
  const total = images.length;
  const current = open === null ? null : images[open];
  const step = (delta: number) => {
    setOpen((value) => (value === null ? value : (value + delta + total) % total));
  };

  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <SectionHeader
        id={titleId}
        index={index}
        title={heading}
        subtitle={subtitle}
        aside={<RailControls railRef={railRef} label={heading} />}
      />
      <Rail railRef={railRef} label={heading} className="rail--gallery">
        {images.map((image, position) => {
          const thumb = getGalleryUrl(image.path, image.kind, "thumb");
          if (!thumb) return null;
          return (
            <li key={image.path} className={`gallery__item gallery__item--${image.kind}`}>
              <button
                type="button"
                className="gallery__thumb"
                onClick={() => {
                  setOpen(position);
                }}
                aria-label={interpolate(text.imageOpen, { index: position + 1, total })}
              >
                <img src={thumb} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          );
        })}
      </Rail>

      <Dialog
        open={current !== null}
        onClose={() => {
          setOpen(null);
        }}
        variant="media"
        title={interpolate(text.imageDialog, { index: (open ?? 0) + 1, total })}
        footer={
          total > 1 && (
            <>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  step(-1);
                }}
              >
                <PiCaretLeft aria-hidden="true" /> {text.imagePrevious}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  step(1);
                }}
              >
                {text.imageNext} <PiCaretRight aria-hidden="true" />
              </button>
            </>
          )
        }
      >
        {current && (
          <div className={`gallery__full gallery__full--${current.kind}`}>
            <img
              src={getGalleryUrl(current.path, current.kind, "full") ?? undefined}
              alt={interpolate(ALT[current.kind], { title })}
            />
          </div>
        )}
      </Dialog>
    </section>
  );
};

export default ImageGallery;
