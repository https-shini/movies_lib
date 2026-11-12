import { Link } from "react-router";
import { PiArrowRight } from "react-icons/pi";
import { messages } from "../../i18n";
import { getBackdropUrl } from "../../lib/images";
import { collectionPath } from "../../lib/media";
import type { CollectionSummary } from "../../types/tmdb";
import "./CollectionBanner.css";

const text = messages.title;

/** Chamada para a coleção ou franquia a que o filme pertence. */
const CollectionBanner = ({ collection }: { collection: CollectionSummary }) => {
  const backdrop = getBackdropUrl(collection.backdrop_path, "w780");

  return (
    <Link to={collectionPath(collection.id)} className="collection-banner">
      {backdrop && (
        <img className="collection-banner__image" src={backdrop} alt="" loading="lazy" />
      )}
      <span className="collection-banner__body">
        <span className="collection-banner__kicker mono">{text.collectionKicker}</span>
        <span className="collection-banner__name display">{collection.name}</span>
        <span className="collection-banner__cta">
          {text.collectionCta} <PiArrowRight aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
};

export default CollectionBanner;
