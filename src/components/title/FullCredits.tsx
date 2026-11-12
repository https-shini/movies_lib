import { Link } from "react-router";
import { interpolate, messages } from "../../i18n";
import { personPath } from "../../lib/media";
import "./FullCredits.css";

const text = messages.title;

export interface CreditPerson {
  id: number;
  name: string;
  /** Personagens ou funções. */
  role: string;
}

export interface CreditGroup {
  key: string;
  label: string;
  people: readonly CreditPerson[];
}

/** Elenco e equipe completos, fechados por padrão para não alongar a página. */
const FullCredits = ({ groups }: { groups: readonly CreditGroup[] }) => {
  const visible = groups.filter((group) => group.people.length > 0);
  const total = visible.reduce((sum, group) => sum + group.people.length, 0);
  if (!total) return null;

  return (
    <details className="credits">
      <summary className="credits__summary btn btn--ghost">
        {interpolate(text.fullCredits, { count: total })}
      </summary>
      <div className="credits__groups">
        {visible.map((group) => (
          <section key={group.key} className="credits__group">
            <h3 className="credits__label mono">{group.label}</h3>
            <ul className="credits__list" role="list" aria-label={group.label}>
              {group.people.map((person) => (
                <li key={`${String(person.id)}-${person.role}`}>
                  <Link to={personPath(person.id)} className="credits__row">
                    <span className="credits__name">{person.name}</span>
                    {person.role && <span className="credits__role">{person.role}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
};

export default FullCredits;
