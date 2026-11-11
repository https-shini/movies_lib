import { PiStarFill } from "react-icons/pi";
import { interpolate, messages } from "../../i18n";
import { formatRating } from "../../lib/format";

interface RatingProps {
  value: number | null | undefined;
  className?: string | undefined;
}

/** Nota do TMDB (0 a 10) em mono, com uma estrela de acento. */
const Rating = ({ value, className = "" }: RatingProps) => {
  const rating = formatRating(value);
  if (rating === null) return null;

  return (
    <span
      className={`rating mono ${className}`}
      aria-label={interpolate(messages.common.ratingLabel, { rating })}
    >
      <PiStarFill aria-hidden="true" />
      {rating}
    </span>
  );
};

export default Rating;
