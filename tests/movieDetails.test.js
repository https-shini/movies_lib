import { describe, expect, it } from "vitest";

import { formatDocumentTitle } from "../src/hooks/useDocumentTitle.js";
import { pickRelatedMovies } from "../src/services/movieDetails.js";

const movies = (...ids) => ids.map((id) => ({ id, title: `Filme ${id}` }));

describe("pickRelatedMovies", () => {
  it("prefers recommendations and limits the amount", () => {
    const result = pickRelatedMovies({
      id: 1,
      recommendations: { results: movies(2, 3, 4, 5, 6, 7, 8) },
      similar: { results: movies(9) },
    });

    expect(result.map(({ id }) => id)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it("falls back to similar movies when recommendations are empty", () => {
    const result = pickRelatedMovies({ id: 1, recommendations: { results: [] }, similar: { results: movies(9, 10) } });
    expect(result.map(({ id }) => id)).toEqual([9, 10]);
  });

  it("removes the current movie and invalid entries", () => {
    const result = pickRelatedMovies({ id: 1, recommendations: { results: [...movies(1, 2), {}, null] } });
    expect(result.map(({ id }) => id)).toEqual([2]);
  });

  it("handles missing data", () => {
    expect(pickRelatedMovies(null)).toEqual([]);
  });
});

describe("formatDocumentTitle", () => {
  it("appends the application name", () => {
    expect(formatDocumentTitle("Cidade de Deus")).toBe("Cidade de Deus | MoviesLib");
  });

  it("uses the default title when empty", () => {
    expect(formatDocumentTitle("  ")).toBe("MoviesLib | Descubra seu próximo filme");
    expect(formatDocumentTitle(undefined)).toBe("MoviesLib | Descubra seu próximo filme");
  });
});
