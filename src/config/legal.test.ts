import { describe, expect, it } from "vitest";
import { hasLegalContact, legalContact } from "./legal";

describe("dados do responsável (LGPD)", () => {
  it("só considera preenchido com responsável e e-mail", () => {
    expect(hasLegalContact({ controller: "", email: "" })).toBe(false);
    expect(hasLegalContact({ controller: "Nome", email: " " })).toBe(false);
    expect(hasLegalContact({ controller: "Nome", email: "dados@exemplo.com" })).toBe(true);
  });

  it("continua pendente até o proprietário preencher (nada inventado)", () => {
    expect(legalContact).toEqual({ controller: "", email: "" });
  });
});
