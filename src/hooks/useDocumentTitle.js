import { BRAND } from "../config/brand.js";
import { useEffect } from "react";

export const APP_NAME = BRAND.name;
const DEFAULT_TITLE = `${APP_NAME} | ${BRAND.tagline}`;

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
