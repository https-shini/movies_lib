import "./Pagination.css";

const Pagination = ({ page, totalPages, onPageChange, label = "Paginação dos resultados" }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Anterior
      </button>
      <span aria-current="page">Página {page} de {totalPages}</span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Próxima
      </button>
    </nav>
  );
};

export default Pagination;
