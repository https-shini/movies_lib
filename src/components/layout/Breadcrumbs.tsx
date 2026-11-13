import { Link } from "react-router";
import { PiCaretRight } from "react-icons/pi";
import "./Breadcrumbs.css";

export interface Crumb {
  label: string;
  /** Sem `to`, o item é a página atual. */
  to?: string | undefined;
}

/** Trilha de navegação: mostra onde a página fica dentro do site (D-61). */
const Breadcrumbs = ({ items, label }: { items: readonly Crumb[]; label: string }) => (
  <nav className="breadcrumbs" aria-label={label}>
    <ol className="breadcrumbs__list">
      {items.map((item, index) => (
        <li key={`${item.label}-${String(index)}`} className="breadcrumbs__item">
          {index > 0 && <PiCaretRight className="breadcrumbs__sep" aria-hidden="true" />}
          {item.to ? (
            <Link to={item.to} className="breadcrumbs__link">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="breadcrumbs__current">
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
