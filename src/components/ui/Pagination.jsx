import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import "./Pagination.css";

const pad = (value) => String(value).padStart(2, "0");

const Pagination = ({ page, totalPages, onPageChange, label = "Paginação dos resultados" }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" className="btn btn--ghost" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        <PiCaretLeft aria-hidden="true" /> Anterior
      </button>
      <p className="pagination__status mono" aria-current="page">
        <span className="sr-only">Página </span>
        <strong>{pad(page)}</strong>
        <span aria-hidden="true"> / </span>
        <span className="sr-only"> de </span>
        {pad(totalPages)}
      </p>
      <button type="button" className="btn btn--ghost" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Próxima <PiCaretRight aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
