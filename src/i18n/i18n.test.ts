import { describe, expect, it } from "vitest";
import { interpolate, messages, plural } from ".";

describe("i18n", () => {
  it("substitui marcadores e preserva os desconhecidos", () => {
    expect(interpolate("{hours}h {minutes}min", { hours: 2, minutes: 15 })).toBe("2h 15min");
    expect(interpolate("{missing}", {})).toBe("{missing}");
  });

  it("não traduz o nome da marca", () => {
    expect(messages.brand.name).toBe("Cinelux");
  });

  it("escolhe singular ou plural e formata o número", () => {
    const forms = { one: "{count} filme", other: "{count} filmes" };
    expect(plural(forms, 1)).toBe("1 filme");
    expect(plural(forms, 0)).toBe("0 filmes");
    expect(plural(forms, 1234)).toBe("1.234 filmes");
  });
});
