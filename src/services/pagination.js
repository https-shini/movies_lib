/** O TMDB rejeita páginas acima de 500 nos endpoints de listagem. */
export const MAX_TMDB_PAGE = 500;

export function normalizePage(value) {
  const page = Number.parseInt(value, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, MAX_TMDB_PAGE);
}

export function getTotalPages(data) {
  const totalPages = Number.parseInt(data?.total_pages, 10);
  if (!Number.isFinite(totalPages) || totalPages < 1) return 1;
  return Math.min(totalPages, MAX_TMDB_PAGE);
}
