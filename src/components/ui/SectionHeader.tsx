import type { ReactNode } from "react";

interface SectionHeaderProps {
  id: string;
  index?: string | undefined;
  title: string;
  subtitle?: string | undefined;
  aside?: ReactNode | undefined;
}

/** Cabeçalho de seção numerado, como num programa de cinemateca. */
const SectionHeader = ({ id, index, title, subtitle, aside }: SectionHeaderProps) => (
  <div className="section-head">
    <div>
      {index && <span className="section-head__index mono">{index}</span>}
      <h2 id={id} className="section-head__title display">
        {title}
      </h2>
      {subtitle && <p className="section-head__subtitle">{subtitle}</p>}
    </div>
    {aside && <div className="section-head__aside">{aside}</div>}
  </div>
);

export default SectionHeader;
