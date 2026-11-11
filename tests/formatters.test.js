import { describe, expect, it } from "vitest";

import {
  formatCompactNumber,
  formatCurrency,
  formatLanguage,
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getReleaseYear,
  getYouTubeEmbedUrl,
  getYouTubeTrailer,
  getYouTubeTrailerKey,
} from "../src/utils/formatters.js";

describe("formatCurrency", () => {
  it("formats positive amounts as USD using pt-BR locale", () => {
    expect(formatCurrency(1250000)).toBe("US$ 1.250.000");
  });

  it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])(
    "handles unavailable amount: %s",
    (amount) => {
      expect(formatCurrency(amount)).toBe("Não informado");
    },
  );
});

describe("formatRuntime", () => {
  it.each([
    [45, "45 min"],
    [60, "1h"],
    [125, "2h 5min"],
  ])("formats %i minutes as %s", (minutes, expected) => {
    expect(formatRuntime(minutes)).toBe(expected);
  });

  it.each([0, null, Number.NaN])("handles unavailable runtime: %s", (minutes) => {
    expect(formatRuntime(minutes)).toBe("Não informada");
  });
});

describe("formatRating", () => {
  it("formats ratings with one decimal place", () => {
    expect(formatRating(8)).toBe("8,0");
    expect(formatRating(7.25)).toBe("7,3");
  });

  it.each([-1, 10.1, Number.NaN])("rejects values outside the TMDB range: %s", (rating) => {
    expect(formatRating(rating)).toBe("N/A");
  });
});

describe("formatReleaseDate", () => {
  it("formats valid release dates in Portuguese", () => {
    expect(formatReleaseDate("2024-05-20")).toBe("20 de maio de 2024");
  });

  it.each(["", "2024-13-40", "20/05/2024", null])("handles invalid dates: %s", (value) => {
    expect(formatReleaseDate(value)).toBe("Não informada");
  });
});

describe("getYouTubeTrailer", () => {
  it("prefers an official YouTube trailer", () => {
    const videos = [
      { site: "Vimeo", type: "Trailer", key: "vimeo-key", official: true },
      { site: "YouTube", type: "Teaser", key: "teaser-key", official: true },
      { site: "YouTube", type: "Trailer", key: "official-key", official: true },
    ];

    expect(getYouTubeTrailer(videos)).toBe("https://www.youtube.com/watch?v=official-key");
  });

  it("falls back to a non-official YouTube trailer and safely encodes the key", () => {
    expect(getYouTubeTrailer([{ site: "YouTube", type: "Trailer", key: "trailer key" }]))
      .toBe("https://www.youtube.com/watch?v=trailer%20key");
  });

  it("prefers an official Portuguese trailer over an official English one", () => {
    const videos = [
      { site: "YouTube", type: "Trailer", key: "en-official", official: true, iso_639_1: "en" },
      { site: "YouTube", type: "Trailer", key: "pt-unofficial", official: false, iso_639_1: "pt" },
      { site: "YouTube", type: "Trailer", key: "pt-official", official: true, iso_639_1: "pt" },
    ];

    expect(getYouTubeTrailer(videos)).toBe("https://www.youtube.com/watch?v=pt-official");
  });

  it("ignores invalid input", () => {
    expect(getYouTubeTrailer(null)).toBeNull();
    expect(getYouTubeTrailer([null, { site: "YouTube" }])).toBeNull();
  });

  it("returns null when no YouTube trailer exists", () => {
    expect(getYouTubeTrailer([{ site: "YouTube", type: "Teaser", key: "teaser" }])).toBeNull();
  });
});

describe("trailer embed helpers", () => {
  it("returns the preferred trailer key and a privacy-enhanced embed URL", () => {
    const key = getYouTubeTrailerKey([{ site: "YouTube", type: "Trailer", key: "abc 1", official: true }]);
    expect(key).toBe("abc 1");
    expect(getYouTubeEmbedUrl(key)).toBe("https://www.youtube-nocookie.com/embed/abc%201?autoplay=1&rel=0&modestbranding=1");
  });

  it("returns null without a key", () => {
    expect(getYouTubeTrailerKey([])).toBeNull();
    expect(getYouTubeEmbedUrl(null)).toBeNull();
  });
});

describe("getReleaseYear", () => {
  it.each([["1999-10-15", "1999"], ["", null], [undefined, null], ["abc", null]])("reads %s as %s", (value, expected) => {
    expect(getReleaseYear(value)).toBe(expected);
  });
});

describe("formatCompactNumber", () => {
  it("formats large counts compactly in Portuguese", () => {
    expect(formatCompactNumber(33263).replace(/\s/g, " ")).toBe("33,3 mil");
    expect(formatCompactNumber(950)).toBe("950");
    expect(formatCompactNumber(Number.NaN)).toBe("0");
  });
});

describe("formatLanguage", () => {
  it("translates ISO codes into Portuguese language names", () => {
    expect(formatLanguage("en")).toBe("Inglês");
    expect(formatLanguage("pt")).toBe("Português");
  });

  it("handles invalid codes", () => {
    expect(formatLanguage("")).toBe("Não informado");
    expect(formatLanguage(null)).toBe("Não informado");
  });
});
