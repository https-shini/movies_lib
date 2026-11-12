import { describe, expect, it } from "vitest";
import {
  buildDiscoverParams,
  buildTvDiscoverParams,
  MIN_VOTES_FOR_RATING_FILTER,
  MIN_VOTES_FOR_RATING_SORT,
  readDiscoverFilters,
  readDiscoverMedia,
  sanitizeDiscoverFilters,
  toDiscoverSearchParams,
  toDiscoverUrlParams,
  TV_SORT_OPTIONS,
} from "./discover";

const today = new Date(2026, 10, 7, 12);

describe("buildDiscoverParams", () => {
  it("exclui conteúdo adulto e usa a ordenação padrão", () => {
    expect(buildDiscoverParams({}, 1, { today })).toEqual({
      include_adult: false,
      sort_by: "popularity.desc",
      page: 1,
    });
  });

  it("converte os filtros em parâmetros do TMDB", () => {
    expect(
      buildDiscoverParams(
        { genre: "28", sort: "revenue.desc", year: "2024", minRating: "7.5" },
        "3",
        { today },
      ),
    ).toEqual({
      include_adult: false,
      sort_by: "revenue.desc",
      with_genres: "28",
      primary_release_year: "2024",
      "vote_average.gte": "7.5",
      "vote_count.gte": MIN_VOTES_FOR_RATING_FILTER,
      page: 3,
    });
  });

  it("exige um mínimo de votos ao ordenar por nota", () => {
    const params = buildDiscoverParams({ sort: "vote_average.desc", minRating: "8" }, 1, { today });
    expect(params["vote_count.gte"]).toBe(MIN_VOTES_FOR_RATING_SORT);
  });

  it("limita lançamentos recentes a filmes já lançados", () => {
    const params = buildDiscoverParams({ sort: "primary_release_date.desc" }, 1, { today });
    expect(params["primary_release_date.lte"]).toBe("2026-11-07");
  });

  it.each([
    ["invalid", 1],
    ["0", 1],
    ["-4", 1],
    ["9999", 500],
  ])("normaliza a página %s para %i", (page, expected) => {
    expect(buildDiscoverParams({}, page).page).toBe(expected);
  });
});

describe("sanitizeDiscoverFilters", () => {
  it("descarta ordenação desconhecida, gênero e ano malformados", () => {
    expect(
      sanitizeDiscoverFilters({
        genre: "28;drop",
        sort: "title.asc",
        year: "20245",
        minRating: "abc",
      }),
    ).toEqual({ genre: "", sort: "popularity.desc", year: "", minRating: "" });
  });

  it("limita a nota, aceita vírgula e ignora zero", () => {
    expect(sanitizeDiscoverFilters({ minRating: "15" }).minRating).toBe("10");
    expect(sanitizeDiscoverFilters({ minRating: "7,5" }).minRating).toBe("7.5");
    expect(sanitizeDiscoverFilters({ minRating: "0" }).minRating).toBe("");
  });

  it("rejeita anos fora do intervalo", () => {
    expect(sanitizeDiscoverFilters({ year: "1850" }).year).toBe("");
    expect(sanitizeDiscoverFilters({ year: "1994" }).year).toBe("1994");
  });
});

describe("filtros na URL", () => {
  it("lê filtros sanitizados da URL", () => {
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

  it("omite valores padrão e vazios ao escrever na URL", () => {
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

describe("descoberta de séries", () => {
  it("lê o tipo de obra da URL", () => {
    expect(readDiscoverMedia(new URLSearchParams("tipo=series"))).toBe("tv");
    expect(readDiscoverMedia(new URLSearchParams("tipo=outro"))).toBe("movie");
    expect(readDiscoverMedia(new URLSearchParams())).toBe("movie");
  });

  it("monta a URL com o tipo e sem a ordenação por bilheteria", () => {
    expect(toDiscoverUrlParams("tv", { genre: "18", sort: "revenue.desc" }).toString()).toBe(
      "genre=18&tipo=series",
    );
    expect(toDiscoverUrlParams("movie", { genre: "18" }).toString()).toBe("genre=18");
    expect(TV_SORT_OPTIONS.map((option) => option.value)).not.toContain("revenue.desc");
  });

  it("traduz os filtros para os campos de séries", () => {
    const params = buildTvDiscoverParams(
      { genre: "18", sort: "primary_release_date.desc", year: "2011", minRating: "8" },
      2,
      { today: new Date(2026, 10, 12) },
    );

    expect(params).toEqual({
      include_adult: false,
      sort_by: "first_air_date.desc",
      page: 2,
      with_genres: "18",
      first_air_date_year: "2011",
      "vote_average.gte": "8",
      "vote_count.gte": 50,
      "first_air_date.lte": "2026-11-12",
    });
  });
});
