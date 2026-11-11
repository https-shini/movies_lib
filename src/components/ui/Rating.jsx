import { PiStarFill } from "react-icons/pi";
import { formatRating } from "../../utils/formatters";

/** Nota do TMDB (0–10) em mono, com uma estrela de acento. */
const Rating = ({ value, className = "" }) => {
  const rating = formatRating(Number(value));
  if (rating === "N/A" || Number(value) === 0) return null;

  return (
    <span className={`rating mono ${className}`} aria-label={`Nota ${rating} de 10`}>
      <PiStarFill aria-hidden="true" />
      {rating}
    </span>
  );
};

export default Rating;
