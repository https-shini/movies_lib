import { describe, expect, it } from "vitest";
import type { PersonCredit } from "../types/tmdb";
import { buildFilmography, getAge, getInitials, pickKnownFor } from "./person";

const credit = (overrides: Partial<PersonCredit>): PersonCredit => ({
  id: 1,
  credit_id: "c",
  media_type: "movie",
  title: "Filme",
  poster_path: "/p.jpg",
  ...overrides,
});

describe("getAge", () => {
  const today = new Date(2026, 10, 12);

  it("calcula a idade considerando se o aniversário já passou", () => {
    expect(getAge("1963-12-18", null, today)).toBe(62);
    expect(getAge("1963-11-12", null, today)).toBe(63);
  });

  it("usa a data da morte quando houver", () => {
    expect(getAge("1930-05-31", "2020-05-30", today)).toBe(89);
  });

  it("devolve null sem data válida", () => {
    expect(getAge(null, null, today)).toBeNull();
    expect(getAge("1963", null, today)).toBeNull();
  });
});

describe("buildFilmography", () => {
  it("agrupa por departamento, com o principal primeiro e os demais por tamanho", () => {
    const groups = buildFilmography(
      {
        cast: [credit({ id: 1, character: "Tyler" })],
        crew: [
          credit({ id: 2, department: "Production", job: "Producer" }),
          credit({ id: 3, department: "Production", job: "Producer" }),
          credit({ id: 4, department: "Directing", job: "Director" }),
        ],
      },
      "Directing",
    );

    expect(groups.map((group) => group.department)).toEqual(["Directing", "Production", "Acting"]);
  });

  it("junta os papéis da mesma obra e ordena da mais recente para a mais antiga", () => {
    const [group] = buildFilmography(
      {
        crew: [
          credit({ id: 10, department: "Production", job: "Producer", release_date: "2013-01-01" }),
          credit({ id: 10, department: "Production", job: "Executive Producer" }),
          credit({ id: 11, department: "Production", job: "Producer", release_date: "2020-06-01" }),
          credit({ id: 12, department: "Production", job: "Producer", title: "Anunciado" }),
        ],
      },
      "Production",
    );

    expect(group?.entries.map((entry) => entry.id)).toEqual([12, 11, 10]);
    expect(group?.entries[2]?.roles).toEqual(["Producer", "Executive Producer"]);
    expect(group?.entries[0]?.year).toBeNull();
    expect(group?.entries[1]?.year).toBe("2020");
  });

  it("trata filme e série com o mesmo id como obras diferentes e usa o nome da série", () => {
    const [group] = buildFilmography(
      {
        cast: [
          credit({ id: 5, character: "A" }),
          {
            id: 5,
            credit_id: "tv",
            media_type: "tv",
            name: "Série",
            poster_path: null,
            first_air_date: "2019-01-01",
            character: "B",
            episode_count: 8,
          },
        ],
      },
      "Acting",
    );

    expect(group?.entries).toHaveLength(2);
    const show = group?.entries.find((entry) => entry.mediaType === "tv");
    expect(show).toMatchObject({ title: "Série", episodeCount: 8, roles: ["B"] });
  });

  it("devolve lista vazia sem créditos", () => {
    expect(buildFilmography(undefined, "Acting")).toEqual([]);
  });
});

describe("pickKnownFor", () => {
  it("escolhe as obras mais votadas do departamento principal, sem talk shows", () => {
    const picked = pickKnownFor(
      {
        cast: [
          credit({ id: 1, character: "Tyler Durden", vote_count: 30000 }),
          credit({ id: 2, character: "Self", vote_count: 90000 }),
          credit({ id: 3, media_type: "tv", name: "Talk", genre_ids: [10767], vote_count: 80000 }),
          credit({ id: 4, character: "Aldo", vote_count: 20000 }),
          credit({ id: 5, character: "Sem pôster", vote_count: 99000, poster_path: null }),
        ],
      },
      "Acting",
    );

    expect(picked.map((entry) => entry.id)).toEqual([1, 4]);
  });

  it("para a equipe técnica, usa só os créditos do departamento principal", () => {
    const picked = pickKnownFor(
      {
        cast: [credit({ id: 1, character: "Ponta", vote_count: 50000 })],
        crew: [
          credit({ id: 2, department: "Directing", job: "Director", vote_count: 100 }),
          credit({ id: 3, department: "Production", job: "Producer", vote_count: 900 }),
        ],
      },
      "Directing",
    );

    expect(picked.map((entry) => entry.id)).toEqual([2]);
  });
});

describe("getInitials", () => {
  it.each([
    ["Brad Pitt", "BP"],
    ["William Bradley Pitt", "WP"],
    ["Zendaya", "Z"],
    ["  joão   da silva ", "JS"],
    ["Ólafur Darri Ólafsson", "ÓÓ"],
    ['"Weird Al" Yankovic', "WY"],
    ["朱江", "朱"],
    ["รชานันท์ มหาวรรณ์", "รม"],
    ["", ""],
    [null, ""],
  ])("%s → %s", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
