import { messages } from "../../i18n";

interface BrandMarkProps {
  showName?: boolean | undefined;
}

/** Marca: uma lente de projetor (anel marfim) com a luz vermelha ao centro. */
const BrandMark = ({ showName = true }: BrandMarkProps) => (
  <span className="brand">
    <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="4.2" fill="var(--color-accent-default)" />
    </svg>
    {showName && <span className="brand__name">{messages.brand.name}</span>}
  </span>
);

export default BrandMark;
