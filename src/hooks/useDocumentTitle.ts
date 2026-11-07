import { useEffect } from "react";
import { interpolate, messages } from "../i18n";

/** Título da aba: "Duna · Cinelux", ou o título padrão quando vazio. */
export function formatDocumentTitle(title: string | null | undefined): string {
  const normalized = typeof title === "string" ? title.trim() : "";
  return normalized
    ? interpolate(messages.documentTitle.page, { title: normalized })
    : messages.documentTitle.default;
}

/** Atualiza o título da aba, útil para histórico, favoritos e leitores de tela. */
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    document.title = formatDocumentTitle(title);
  }, [title]);
}
