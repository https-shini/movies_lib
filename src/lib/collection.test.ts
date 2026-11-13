import { describe, expect, it } from "vitest";
import type { MovieSummary } from "../types/tmdb";
import {
  collectionPeriod,
  isLongCollectionName,
  sequenceNumber,
  sortCollectionParts,
} from "./collection";

const movie = (id: number, title: string, release_date?: string): MovieSummary => ({
  id,
  title,
  poster_path: null,
  ...(release_date === undefined ? {} : { release_date }),
});

describe("sortCollectionParts", () => {
  it("ordena por lançamento, com os sem data por último", () => {
    const parts = [
      movie(1, "Matrix Revolutions", "2003-11-05"),
      movie(2, "Matrix 5"),
      movie(3, "Matrix", "1999-03-31"),
      movie(4, "Matrix Reloaded", "2003-05-15"),
      movie(5, "Matrix Antigo", ""),
    ];
    expect(sortCollectionParts(parts).map((part) => part.id)).toEqual([3, 4, 1, 2, 5]);
  });

  it("desempata pelo título e mantém a ordem do TMDB quando tudo é igual", () => {
    const parts = [
      movie(1, "Beta", "2010-01-01"),
      movie(2, "alfa", "2010-01-01"),
      movie(3, "Gama"),
      movie(4, "Gama"),
    ];
    expect(sortCollectionParts(parts).map((part) => part.id)).toEqual([2, 1, 3, 4]);
  });

  it("não altera a lista original e aceita lista vazia", () => {
    const parts = [movie(1, "B", "2001-01-01"), movie(2, "A", "2000-01-01")];
    sortCollectionParts(parts);
    expect(parts.map((part) => part.id)).toEqual([1, 2]);
    expect(sortCollectionParts([])).toEqual([]);
  });
});

describe("collectionPeriod", () => {
  it("vai do primeiro ao último ano, ignorando quem não tem data", () => {
    expect(
      collectionPeriod([movie(1, "a", "2021-09-30"), movie(2, "b", "1962-10-05"), movie(3, "c")]),
    ).toBe("1962–2021");
  });

  it("mostra um ano só quando todos são do mesmo ano", () => {
    expect(collectionPeriod([movie(1, "a", "2021-01-01"), movie(2, "b", "2021-12-01")])).toBe(
      "2021",
    );
  });

  it("é null sem nenhuma data (coleção vazia ou só com filmes anunciados)", () => {
    expect(collectionPeriod([])).toBeNull();
    expect(collectionPeriod([movie(1, "a"), movie(2, "b", "")])).toBeNull();
  });
});

describe("sequenceNumber e nomes longos", () => {
  it("numera a partir de 01, com dois dígitos", () => {
    expect([0, 8, 26].map(sequenceNumber)).toEqual(["01", "09", "27"]);
  });

  it("marca como longo o nome do Star Trek, não o da Matrix", () => {
    expect(isLongCollectionName("Star Trek: Realidade Alternativa - Coleção")).toBe(true);
    expect(isLongCollectionName("Matrix: Coleção")).toBe(false);
    expect(isLongCollectionName("Os Fantasmas se Divertem: Coleção")).toBe(true);
  });
});
