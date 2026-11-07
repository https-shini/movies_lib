import { PiStarFill } from "react-icons/pi";
import { formatRating } from "../../lib/format";

/** Nota do TMDB (0–10) em mono, com uma estrela de acento. */
const Rating = ({ value, className = "" }) => {
  const rating = formatRating(value);
  if (rating === null) return null;

  return (
    <span className={`rating mono ${className}`} aria-label={`Nota ${rating} de 10`}>
      <PiStarFill aria-hidden="true" />
      {rating}
    </span>
  );
};

export default Rating;
