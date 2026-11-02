import { describe, expect, it } from "vitest";

import { formatCurrency, formatRating, formatReleaseDate, formatRuntime, getYouTubeTrailer } from "../src/utils/formatters.js";

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

  it("returns null when no YouTube trailer exists", () => {
    expect(getYouTubeTrailer([{ site: "YouTube", type: "Teaser", key: "teaser" }])).toBeNull();
  });
});
