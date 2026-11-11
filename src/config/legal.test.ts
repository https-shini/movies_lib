import { describe, expect, it } from "vitest";
import { definedLegalBases, hasLegalContact, legalBases, legalContact } from "./legal";

describe("dados do responsável (LGPD)", () => {
  it("só considera preenchido com responsável e e-mail", () => {
    expect(hasLegalContact({ controller: "", email: "" })).toBe(false);
    expect(hasLegalContact({ controller: "Nome", email: " " })).toBe(false);
    expect(hasLegalContact({ controller: "Nome", email: "dados@exemplo.com" })).toBe(true);
  });

  it("continua pendente até o proprietário preencher (nada inventado)", () => {
    expect(legalContact).toEqual({ controller: "", email: "" });
    expect(legalBases).toEqual({ analytics: "", performance: "", catalog: "", logs: "" });
    expect(definedLegalBases()).toEqual([]);
  });

  it("lista só as bases legais preenchidas, na ordem da página", () => {
    expect(
      definedLegalBases({ analytics: "  ", performance: "B", catalog: "", logs: "A" }),
    ).toEqual([
      { purpose: "performance", basis: "B" },
      { purpose: "logs", basis: "A" },
    ]);
  });
});
