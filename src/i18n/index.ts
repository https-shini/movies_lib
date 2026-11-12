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

/**
 * Escolhe a forma singular ou plural e preenche `{count}` com o número formatado.
 * Ex.: plural({ one: "{count} filme", other: "{count} filmes" }, 3) → "3 filmes"
 */
export function plural(forms: { one: string; other: string }, count: number): string {
  return interpolate(count === 1 ? forms.one : forms.other, {
    count: count.toLocaleString(locale),
  });
}
