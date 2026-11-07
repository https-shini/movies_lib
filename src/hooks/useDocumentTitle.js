import { useEffect } from "react";

export const APP_NAME = "MoviesLib";
const DEFAULT_TITLE = `${APP_NAME} | Descubra seu próximo filme`;

export function formatDocumentTitle(title) {
  const normalized = typeof title === "string" ? title.trim() : "";
  return normalized ? `${normalized} | ${APP_NAME}` : DEFAULT_TITLE;
}

/** Atualiza o título da aba, útil para histórico, favoritos e leitores de tela. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = formatDocumentTitle(title);
  }, [title]);
}
