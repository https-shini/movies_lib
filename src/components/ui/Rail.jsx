import { useCallback, useEffect, useState } from "react";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import "./Rail.css";

/**
 * Faixa horizontal com rolagem por toque (snap) e botões de navegação para
 * mouse e teclado. Os botões ficam desabilitados nas extremidades.
 */
export const RailControls = ({ railRef, label }) => {
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

  const scrollByPage = (direction) => {
    const element = railRef.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: "smooth" });
  };

  if (edges.start && edges.end) return null;

  return (
    <div className="rail-controls">
      <button type="button" className="icon-btn" onClick={() => scrollByPage(-1)} disabled={edges.start} aria-label={`Voltar em ${label}`}>
        <PiCaretLeft aria-hidden="true" />
      </button>
      <button type="button" className="icon-btn" onClick={() => scrollByPage(1)} disabled={edges.end} aria-label={`Avançar em ${label}`}>
        <PiCaretRight aria-hidden="true" />
      </button>
    </div>
  );
};

const Rail = ({ railRef, label, className = "", children }) => (
  <ul ref={railRef} className={`rail ${className}`} role="list" aria-label={label}>
    {children}
  </ul>
);

export default Rail;
