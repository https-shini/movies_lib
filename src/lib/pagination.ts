/** O TMDB rejeita páginas acima de 500 nos endpoints de listagem (erro 22). */
export const MAX_TMDB_PAGE = 500;

/** Converte qualquer valor (ex.: parâmetro da URL) numa página válida entre 1 e 500. */
export function normalizePage(value: unknown): number {
  const page = typeof value === "number" ? Math.trunc(value) : Number.parseInt(String(value), 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, MAX_TMDB_PAGE);
}

/** Total de páginas disponível, limitado a 500. */
export function getTotalPages(data: { total_pages?: unknown } | null | undefined): number {
  const raw = data?.total_pages;
  const totalPages = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(totalPages) || totalPages < 1) return 1;
  return Math.min(totalPages, MAX_TMDB_PAGE);
}
