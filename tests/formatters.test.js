import { describe, expect, it } from "vitest";

import { formatCurrency, formatRating, formatRuntime } from "../src/utils/formatters.js";

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
