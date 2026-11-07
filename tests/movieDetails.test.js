import { describe, expect, it } from "vitest";

import { formatDocumentTitle } from "../src/hooks/useDocumentTitle.js";
import {
  pickCrewNames,
  pickDirectors,
  pickRelatedMovies,
  pickWriters,
} from "../src/services/movieDetails.js";

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
    const result = pickRelatedMovies({
      id: 1,
      recommendations: { results: [] },
      similar: { results: movies(9, 10) },
    });
    expect(result.map(({ id }) => id)).toEqual([9, 10]);
  });

  it("removes the current movie and invalid entries", () => {
    const result = pickRelatedMovies({
      id: 1,
      recommendations: { results: [...movies(1, 2), {}, null] },
    });
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
    expect(formatDocumentTitle("  ")).toBe("MoviesLib | Seu diário de cinema");
    expect(formatDocumentTitle(undefined)).toBe("MoviesLib | Seu diário de cinema");
  });
});

describe("crew helpers", () => {
  const credits = {
    crew: [
      { job: "Producer", name: "Produtora" },
      { job: "Director", name: "Diretora Um" },
      { job: "Screenplay", name: "Roteirista" },
      { job: "Novel", name: "Autor" },
      { job: "Director", name: "Diretora Um" },
      { job: "Writer", name: "Roteirista" },
      { job: "Director", name: "Diretor Dois" },
      { job: "Director", name: "Diretor Três" },
    ],
  };

  it("lists unique directors, capped at two", () => {
    expect(pickDirectors(credits)).toEqual(["Diretora Um", "Diretor Dois"]);
  });

  it("lists unique writers from screenplay, story and source material jobs", () => {
    expect(pickWriters(credits)).toEqual(["Roteirista", "Autor"]);
  });

  it("handles missing credits", () => {
    expect(pickDirectors(undefined)).toEqual([]);
    expect(pickCrewNames({ crew: null }, ["Director"])).toEqual([]);
  });
});
