import { describe, expect, it } from "vitest";
import { getBrazilianTvRating, pickTvCast, sortSeasons } from "./tv";

describe("getBrazilianTvRating", () => {
  it("lê só a classificação do Brasil", () => {
    const ratings = {
      results: [
        { iso_3166_1: "US", rating: "TV-MA" },
        { iso_3166_1: "BR", rating: "16" },
      ],
    };
    expect(getBrazilianTvRating(ratings)).toBe("16");
    expect(getBrazilianTvRating({ results: [{ iso_3166_1: "US", rating: "TV-MA" }] })).toBeNull();
  });

  it("descarta valores fora da tabela do ClassInd e ausência de dados", () => {
    expect(getBrazilianTvRating({ results: [{ iso_3166_1: "BR", rating: "TV-14" }] })).toBeNull();
    expect(getBrazilianTvRating(undefined)).toBeNull();
  });
});

describe("pickTvCast", () => {
  it("ordena pelo destaque e lista os personagens pelo número de episódios", () => {
    const cast = pickTvCast([
      {
        id: 2,
        name: "Coadjuvante",
        profile_path: null,
        order: 5,
        total_episode_count: 10,
        roles: [{ credit_id: "a", character: "Vizinho", episode_count: 10 }],
      },
      {
        id: 1,
        name: "Protagonista",
        profile_path: "/a.jpg",
        order: 0,
        total_episode_count: 62,
        roles: [
          { credit_id: "b", character: "Narrador", episode_count: 2 },
          { credit_id: "c", character: "Walter White", episode_count: 62 },
          { credit_id: "d", character: " ", episode_count: 1 },
        ],
      },
    ]);

    expect(cast.map((member) => member.name)).toEqual(["Protagonista", "Coadjuvante"]);
    expect(cast[0]).toMatchObject({ characters: ["Walter White", "Narrador"], episodeCount: 62 });
    expect(pickTvCast(undefined)).toEqual([]);
  });
});

describe("sortSeasons", () => {
  it("põe as temporadas em ordem e os especiais por último", () => {
    const seasons = [{ season_number: 2 }, { season_number: 0 }, { season_number: 1 }];
    expect(sortSeasons(seasons).map((season) => season.season_number)).toEqual([1, 2, 0]);
  });
});
