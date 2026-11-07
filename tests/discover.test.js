import { describe, expect, it } from "vitest";

import {
  buildDiscoverParams,
  MIN_VOTES_FOR_RATING_FILTER,
  MIN_VOTES_FOR_RATING_SORT,
  readDiscoverFilters,
  sanitizeDiscoverFilters,
  toDiscoverSearchParams,
} from "../src/services/discover.js";

const today = new Date(2026, 10, 7, 12);

describe("buildDiscoverParams", () => {
  it("uses Portuguese language, excludes adult titles and applies default sorting", () => {
    expect(buildDiscoverParams({}, { today })).toEqual({
      language: "pt-BR",
      include_adult: false,
      sort_by: "popularity.desc",
      page: 1,
    });
  });

  it("maps the selected filters to TMDB query parameters", () => {
    expect(
      buildDiscoverParams(
        {
          genre: "28",
          sort: "revenue.desc",
          year: "2024",
          minRating: "7.5",
          page: "3",
        },
        { today },
      ),
    ).toEqual({
      language: "pt-BR",
      include_adult: false,
      sort_by: "revenue.desc",
      with_genres: "28",
      primary_release_year: "2024",
      "vote_average.gte": "7.5",
      "vote_count.gte": MIN_VOTES_FOR_RATING_FILTER,
      page: 3,
    });
  });

  it("requires a minimum number of votes when sorting by rating", () => {
    const params = buildDiscoverParams({ sort: "vote_average.desc", minRating: "8" }, { today });
    expect(params["vote_count.gte"]).toBe(MIN_VOTES_FOR_RATING_SORT);
  });

  it("limits recent releases to titles already released", () => {
    const params = buildDiscoverParams({ sort: "primary_release_date.desc" }, { today });
    expect(params["primary_release_date.lte"]).toBe("2026-11-07");
  });

  it("normalizes invalid, lower-than-one and out-of-range page values", () => {
    expect(buildDiscoverParams({ page: "invalid" }).page).toBe(1);
    expect(buildDiscoverParams({ page: "0" }).page).toBe(1);
    expect(buildDiscoverParams({ page: "-4" }).page).toBe(1);
    expect(buildDiscoverParams({ page: "9999" }).page).toBe(500);
  });
});

describe("sanitizeDiscoverFilters", () => {
  it("discards unknown sort values, malformed genres and years", () => {
    expect(
      sanitizeDiscoverFilters({
        genre: "28;drop",
        sort: "title.asc",
        year: "20245",
        minRating: "abc",
      }),
    ).toEqual({ genre: "", sort: "popularity.desc", year: "", minRating: "" });
  });

  it("clamps ratings, accepts comma decimals and ignores zero", () => {
    expect(sanitizeDiscoverFilters({ minRating: "15" }).minRating).toBe("10");
    expect(sanitizeDiscoverFilters({ minRating: "7,5" }).minRating).toBe("7.5");
    expect(sanitizeDiscoverFilters({ minRating: "0" }).minRating).toBe("");
  });

  it("rejects years outside the supported range", () => {
    expect(sanitizeDiscoverFilters({ year: "1850" }).year).toBe("");
    expect(sanitizeDiscoverFilters({ year: "1994" }).year).toBe("1994");
  });
});

describe("URL helpers", () => {
  it("reads sanitized filters from URL search params", () => {
    const params = new URLSearchParams(
      "genre=18&sort=vote_average.desc&year=1994&minRating=8&page=2",
    );
    expect(readDiscoverFilters(params)).toEqual({
      genre: "18",
      sort: "vote_average.desc",
      year: "1994",
      minRating: "8",
    });
  });

  it("omits default and empty values when writing filters to the URL", () => {
    expect(
      toDiscoverSearchParams({
        genre: "",
        sort: "popularity.desc",
        year: "",
        minRating: "",
      }).toString(),
    ).toBe("");
    expect(
      toDiscoverSearchParams({
        genre: "35",
        sort: "revenue.desc",
        year: "2020",
        minRating: "",
      }).toString(),
    ).toBe("genre=35&sort=revenue.desc&year=2020");
  });
});
