import { Link } from "react-router";
import { PiUser } from "react-icons/pi";
import { getProfileUrl } from "../../lib/images";
import { personPath } from "../../lib/media";
import "./PersonCard.css";

export interface PersonCardData {
  id: number;
  name: string;
  /** Personagem, função ou área de atuação. */
  role?: string | undefined;
  /** Informação extra abaixo do papel (ex.: número de episódios). */
  detail?: string | undefined;
  profilePath: string | null | undefined;
}

/** Card de pessoa: o card inteiro leva ao perfil. */
const PersonCard = ({ person }: { person: PersonCardData }) => {
  const photo = getProfileUrl(person.profilePath);

  return (
    <Link to={personPath(person.id)} className="cast-card">
      <div className="cast-card__photo">
        {photo ? (
          <img src={photo} alt="" loading="lazy" decoding="async" />
        ) : (
          <PiUser aria-hidden="true" />
        )}
      </div>
      <p className="cast-card__name">{person.name}</p>
      {person.role && <p className="cast-card__role">{person.role}</p>}
      {person.detail && <p className="cast-card__detail mono">{person.detail}</p>}
    </Link>
  );
};

export const PersonCardSkeleton = () => (
  <div className="cast-card" aria-hidden="true">
    <div className="cast-card__photo skeleton" />
    <span className="skeleton skeleton--text" style={{ width: "75%" }} />
    <span className="skeleton skeleton--text" style={{ width: "45%" }} />
  </div>
);

export default PersonCard;
