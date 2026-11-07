import { ptBR } from "./pt-BR";

/** Idioma ativo. Quando houver outros, a escolha acontece aqui. */
export const messages = ptBR;
export const locale = "pt-BR";

/**
 * Substitui marcadores `{nome}` no texto pelos valores informados.
 * Ex.: interpolate("{hours}h", { hours: 2 }) → "2h"
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
