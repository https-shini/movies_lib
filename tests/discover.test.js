import { describe, expect, it } from "vitest";

import { buildDiscoverParams } from "../src/services/discover.js";

describe("buildDiscoverParams", () => {
  it("uses Portuguese language, excludes adult titles and applies default sorting", () => {
    expect(buildDiscoverParams({})).toEqual({
      language: "pt-BR",
      include_adult: false,
      sort_by: "popularity.desc",
      with_genres: undefined,
      primary_release_year: undefined,
      "vote_average.gte": undefined,
      page: 1,
    });
  });

  it("maps the selected filters to TMDB query parameters", () => {
    expect(buildDiscoverParams({
      genre: "28",
      sort: "vote_average.desc",
      year: "2024",
      minRating: "7.5",
      page: "3",
    })).toEqual({
      language: "pt-BR",
      include_adult: false,
      sort_by: "vote_average.desc",
      with_genres: "28",
      primary_release_year: "2024",
      "vote_average.gte": "7.5",
      page: 3,
    });
  });

  it("normalizes invalid and lower-than-one page values", () => {
    expect(buildDiscoverParams({ page: "invalid" }).page).toBe(1);
    expect(buildDiscoverParams({ page: "0" }).page).toBe(1);
    expect(buildDiscoverParams({ page: "-4" }).page).toBe(1);
  });
});
