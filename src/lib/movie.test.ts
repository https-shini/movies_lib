import { describe, expect, it } from "vitest";
import type { MovieSummary, Video } from "../types/tmdb";
import {
  getYouTubeEmbedUrl,
  getYouTubeTrailerKey,
  getYouTubeWatchUrl,
  MAX_CAST,
  pickCrewNames,
  pickDirectors,
  pickRelatedMovies,
  pickWriters,
} from "./movie";

const movies = (...ids: number[]): MovieSummary[] =>
  ids.map((id) => ({ id, title: `Filme ${String(id)}`, poster_path: null }));

const page = (results: MovieSummary[]) => ({
  page: 1,
  results,
  total_pages: 1,
  total_results: results.length,
});

describe("pickRelatedMovies", () => {
  it("prefere as recomendações e limita a quantidade", () => {
    const result = pickRelatedMovies({
      id: 1,
      recommendations: page(movies(2, 3, 4, 5, 6, 7, 8)),
      similar: page(movies(9)),
    });
    expect(result.map(({ id }) => id)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it("usa os semelhantes quando não há recomendações", () => {
    const result = pickRelatedMovies({
      id: 1,
      recommendations: page([]),
      similar: page(movies(9, 10)),
    });
    expect(result.map(({ id }) => id)).toEqual([9, 10]);
  });

  it("remove o próprio filme e trata dados ausentes", () => {
    expect(
      pickRelatedMovies({ id: 1, recommendations: page(movies(1, 2)) }).map(({ id }) => id),
    ).toEqual([2]);
    expect(pickRelatedMovies(null)).toEqual([]);
  });
});

describe("equipe técnica", () => {
  const credits = {
    crew: [
      { job: "Producer", name: "Produtora", credit_id: "a", id: 1 },
      { job: "Director", name: "Diretora Um", credit_id: "b", id: 2 },
      { job: "Screenplay", name: "Roteirista", credit_id: "c", id: 3 },
      { job: "Novel", name: "Autor", credit_id: "d", id: 4 },
      { job: "Director", name: "Diretora Um", credit_id: "e", id: 2 },
      { job: "Writer", name: "Roteirista", credit_id: "f", id: 3 },
      { job: "Director", name: "Diretor Dois", credit_id: "g", id: 5 },
      { job: "Director", name: "Diretor Três", credit_id: "h", id: 6 },
    ],
  };

  it("lista diretores únicos, no máximo dois", () => {
    expect(pickDirectors(credits)).toEqual(["Diretora Um", "Diretor Dois"]);
  });

  it("lista roteiristas e autores da obra original, sem repetir", () => {
    expect(pickWriters(credits)).toEqual(["Roteirista", "Autor"]);
  });

  it("trata créditos ausentes", () => {
    expect(pickDirectors(undefined)).toEqual([]);
    expect(pickCrewNames({ crew: [] }, ["Director"])).toEqual([]);
  });

  it("define até 10 nomes no elenco principal", () => {
    expect(MAX_CAST).toBe(10);
  });
});

describe("trailers do YouTube", () => {
  const video = (key: string, extra: Partial<Video> = {}): Video => ({
    id: key,
    key,
    site: "YouTube",
    type: "Trailer",
    ...extra,
  });

  it("prefere o trailer oficial em português", () => {
    const videos = [
      video("en-official", { official: true, iso_639_1: "en" }),
      video("pt-unofficial", { iso_639_1: "pt" }),
      video("pt-official", { official: true, iso_639_1: "pt" }),
    ];
    expect(getYouTubeTrailerKey(videos)).toBe("pt-official");
  });

  it("ignora teasers e outros sites", () => {
    expect(
      getYouTubeTrailerKey([video("t", { type: "Teaser" }), video("v", { site: "Vimeo" })]),
    ).toBeNull();
    expect(getYouTubeTrailerKey(null)).toBeNull();
  });

  it("monta os links de assistir e de incorporação", () => {
    expect(getYouTubeWatchUrl("a b")).toBe("https://www.youtube.com/watch?v=a%20b");
    expect(getYouTubeEmbedUrl("abc")).toBe(
      "https://www.youtube-nocookie.com/embed/abc?autoplay=1&rel=0&modestbranding=1",
    );
    expect(getYouTubeEmbedUrl(null)).toBeNull();
  });
});
