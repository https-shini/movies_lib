import { useCallback, useEffect, useState, type ReactNode, type RefObject } from "react";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import { interpolate, messages } from "../../i18n";
import "./Rail.css";

export type RailRef = RefObject<HTMLUListElement | null>;

interface RailControlsProps {
  railRef: RailRef;
  label: string;
}

/**
 * Faixa horizontal com rolagem por toque (snap) e botões de navegação para
 * mouse e teclado. Os botões ficam desabilitados nas extremidades.
 */
export const RailControls = ({ railRef, label }: RailControlsProps) => {
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const element = railRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    setEdges({ start: element.scrollLeft <= 4, end: element.scrollLeft >= maxScroll - 4 });
  }, [railRef]);

  useEffect(() => {
    const element = railRef.current;
    if (!element) return undefined;

    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [railRef, update]);

  const scrollByPage = (direction: 1 | -1) => {
    const element = railRef.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: "smooth" });
  };

  if (edges.start && edges.end) return null;

  return (
    <div className="rail-controls">
      <button
        type="button"
        className="icon-btn"
        onClick={() => {
          scrollByPage(-1);
        }}
        disabled={edges.start}
        aria-label={interpolate(messages.rail.previous, { title: label })}
      >
        <PiCaretLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={() => {
          scrollByPage(1);
        }}
        disabled={edges.end}
        aria-label={interpolate(messages.rail.next, { title: label })}
      >
        <PiCaretRight aria-hidden="true" />
      </button>
    </div>
  );
};

interface RailProps {
  railRef?: RailRef | undefined;
  label: string;
  className?: string | undefined;
  children: ReactNode;
}

const Rail = ({ railRef, label, className = "", children }: RailProps) => (
  <ul ref={railRef} className={`rail ${className}`} role="list" aria-label={label}>
    {children}
  </ul>
);

export default Rail;
