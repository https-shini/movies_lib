import { messages } from "../../i18n";
import "./SectionNav.css";

export interface SectionLink {
  id: string;
  label: string;
}

/** Atalhos para as seções da página; rola na horizontal no celular. */
const SectionNav = ({ items }: { items: readonly SectionLink[] }) => {
  if (items.length < 2) return null;

  return (
    <nav className="section-nav" aria-label={messages.title.sectionsLabel}>
      <ul className="section-nav__list" role="list">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a className="chip" href={`#${id}`}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SectionNav;
