import { describe, expect, it } from "vitest";
import { collectionPath, fromTv, mediaPath, personPath } from "./media";

describe("fromTv", () => {
  it("converte a série para o formato dos cards e marca o tipo", () => {
    expect(
      fromTv({
        id: 1396,
        name: "Breaking Bad",
        original_name: "Breaking Bad",
        poster_path: "/p.jpg",
        first_air_date: "2008-01-20",
        vote_average: 8.9,
      }),
    ).toEqual({
      id: 1396,
      title: "Breaking Bad",
      original_title: "Breaking Bad",
      poster_path: "/p.jpg",
      backdrop_path: null,
      release_date: "2008-01-20",
      vote_average: 8.9,
      media_type: "tv",
    });
  });
});

describe("endereços", () => {
  it("leva filmes, séries, pessoas e coleções às suas páginas", () => {
    expect(mediaPath("movie", 550)).toBe("/movie/550");
    expect(mediaPath(undefined, 550)).toBe("/movie/550");
    expect(mediaPath("tv", 1396)).toBe("/serie/1396");
    expect(personPath(287)).toBe("/pessoa/287");
    expect(collectionPath(2344)).toBe("/colecao/2344");
  });
});
