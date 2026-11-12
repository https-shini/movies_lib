import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import "./FactGrid.css";

export interface Fact {
  label: string;
  value: ReactNode;
  Icon: IconType;
}

interface FactGridProps {
  titleId: string;
  title: string;
  facts: readonly Fact[];
}

/** Ficha técnica: pares de rótulo e valor em cards com ícone. */
const FactGrid = ({ titleId, title, facts }: FactGridProps) => (
  <aside className="movie-body__facts" aria-labelledby={titleId}>
    <h2 id={titleId} className="facts__title mono">
      {title}
    </h2>
    <dl className="facts">
      {facts.map(({ label, value, Icon }) => (
        <div key={label} className="facts__row">
          <dt>
            <Icon className="facts__icon" aria-hidden="true" />
            {label}
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  </aside>
);

export default FactGrid;
