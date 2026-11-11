import { PiVideoCamera } from "react-icons/pi";
import { messages } from "../../i18n";

interface BrandMarkProps {
  showName?: boolean | undefined;
}

/** Marca: câmera de cinema dourada e o nome em Space Grotesk (identidade original, D-54). */
const BrandMark = ({ showName = true }: BrandMarkProps) => (
  <span className="brand">
    <PiVideoCamera className="brand__mark" aria-hidden="true" />
    {showName && <span className="brand__name">{messages.brand.name}</span>}
  </span>
);

export default BrandMark;
