import { describe, expect, it } from "vitest";
import {
  formatCompactNumber,
  formatCurrency,
  formatLanguage,
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getReleaseYear,
} from "./format";

describe("formatCurrency", () => {
  it("formata dólares no padrão brasileiro, sem centavos", () => {
    // O Intl usa espaço não separável entre "US$" e o número.
    expect(formatCurrency(160000000).replace(/\s/g, " ")).toBe("US$ 160.000.000");
  });

  it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY, null, undefined])(
    "usa 'Não informado' para valores ausentes: %s",
    (amount) => {
      expect(formatCurrency(amount)).toBe("Não informado");
    },
  );
});

describe("formatRuntime", () => {
  it.each([
    [45, "45min"],
    [60, "1h"],
    [135, "2h 15min"],
  ])("formata %i minutos como %s", (minutes, expected) => {
    expect(formatRuntime(minutes)).toBe(expected);
  });

  it.each([0, null, undefined, Number.NaN])("usa 'Não informado' sem duração: %s", (minutes) => {
    expect(formatRuntime(minutes)).toBe("Não informado");
  });
});

describe("formatRating", () => {
  it("usa uma casa decimal com ponto, como na identidade visual", () => {
    expect(formatRating(8.712)).toBe("8.7");
    expect(formatRating(8)).toBe("8.0");
  });

  it.each([0, -1, 10.1, Number.NaN, null, undefined])(
    "retorna null sem nota válida: %s",
    (value) => {
      expect(formatRating(value)).toBeNull();
    },
  );
});

describe("formatReleaseDate", () => {
  it("formata a data por extenso em português", () => {
    expect(formatReleaseDate("1999-10-15")).toBe("15 de outubro de 1999");
  });

  it.each(["", "1999-13-40", "15/10/1999", null, undefined])(
    "trata datas inválidas: %s",
    (value) => {
      expect(formatReleaseDate(value)).toBe("Não informado");
    },
  );
});

describe("getReleaseYear", () => {
  it.each([
    ["1999-10-15", "1999"],
    ["", null],
    [undefined, null],
    ["abc", null],
  ])("lê %s como %s", (value, expected) => {
    expect(getReleaseYear(value)).toBe(expected);
  });
});

describe("formatCompactNumber", () => {
  it("formata contagens grandes de forma compacta", () => {
    expect(formatCompactNumber(33263).replace(/\s/g, " ")).toBe("33,3 mil");
    expect(formatCompactNumber(950)).toBe("950");
    expect(formatCompactNumber(Number.NaN)).toBe("0");
  });
});

describe("formatLanguage", () => {
  it("traduz códigos ISO para o nome do idioma", () => {
    expect(formatLanguage("en")).toBe("Inglês");
    expect(formatLanguage("pt")).toBe("Português");
  });

  it("trata códigos inválidos", () => {
    expect(formatLanguage("")).toBe("Não informado");
    expect(formatLanguage(null)).toBe("Não informado");
  });
});
