import type { MovieSummary } from "../types/tmdb";
import { getReleaseYear } from "./format";

/**
 * Regras da página de coleção (D-68), fora do componente para serem testadas.
 */

/**
 * Ordem de lançamento: filmes com data primeiro, do mais antigo ao mais recente; os sem
 * data (anunciados) por último. Empates (mesma data ou nenhuma) ficam pelo título e, por
 * fim, pela ordem que veio do TMDB, para o resultado ser sempre o mesmo.
 */
export function sortCollectionParts(parts: readonly MovieSummary[]): MovieSummary[] {
  const byTitle = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });
  return parts
    .map((part, index) => ({ part, index }))
    .sort((a, b) => {
      const da = a.part.release_date ?? "";
      const db = b.part.release_date ?? "";
      if (da !== db) {
        if (!da) return 1;
        if (!db) return -1;
        return da.localeCompare(db);
      }
      return byTitle.compare(a.part.title, b.part.title) || a.index - b.index;
    })
    .map(({ part }) => part);
}

/** Período da franquia pelos filmes com data: "1962–2021", "2021" ou null. */
export function collectionPeriod(parts: readonly MovieSummary[]): string | null {
  const years = parts
    .map((part) => getReleaseYear(part.release_date))
    .filter((year): year is string => year !== null)
    .map(Number);
  if (!years.length) return null;
  const first = Math.min(...years);
  const last = Math.max(...years);
  return first === last ? String(first) : `${String(first)}–${String(last)}`;
}

/** Posição do filme na sequência, com dois dígitos: "01", "02"... "27". */
export const sequenceNumber = (index: number): string => String(index + 1).padStart(2, "0");

/**
 * Nomes acima disto usam uma escala menor no cabeçalho, para não ocupar quatro linhas no
 * celular ("Star Trek: Realidade Alternativa - Coleção" tem 42 caracteres).
 */
export const LONG_COLLECTION_NAME = 28;

export const isLongCollectionName = (name: string): boolean =>
  name.trim().length > LONG_COLLECTION_NAME;
