import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import { messages } from "../../i18n";
import "./Pagination.css";

const text = messages.pagination;

const pad = (value: number) => String(value).padStart(2, "0");

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string | undefined;
}

const Pagination = ({ page, totalPages, onPageChange, label = text.label }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          onPageChange(page - 1);
        }}
        disabled={page <= 1}
      >
        <PiCaretLeft aria-hidden="true" /> {text.previous}
      </button>
      <p className="pagination__status mono" aria-current="page">
        <span className="sr-only">{text.page} </span>
        <strong>{pad(page)}</strong>
        <span aria-hidden="true"> / </span>
        <span className="sr-only"> {text.of} </span>
        {pad(totalPages)}
      </p>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          onPageChange(page + 1);
        }}
        disabled={page >= totalPages}
      >
        {text.next} <PiCaretRight aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
