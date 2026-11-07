import { describe, expect, it } from "vitest";
import { interpolate, messages } from ".";

describe("i18n", () => {
  it("substitui marcadores e preserva os desconhecidos", () => {
    expect(interpolate("{hours}h {minutes}min", { hours: 2, minutes: 15 })).toBe("2h 15min");
    expect(interpolate("{missing}", {})).toBe("{missing}");
  });

  it("não traduz o nome da marca", () => {
    expect(messages.brand.name).toBe("Cinelux");
  });
});
