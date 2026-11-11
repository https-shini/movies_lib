/**
 * Responsável pelo tratamento dos dados, canal de contato e bases legais (LGPD).
 *
 * PENDENTE: preenchimento pelo proprietário do projeto (ver docs/PENDENCIAS_PROPRIETARIO.md).
 * Nenhum dado pode ser inventado aqui: nome, CPF/CNPJ, endereço, e-mail ou a escolha da base
 * legal de cada tratamento (art. 7º) são decisões do controlador. Enquanto os campos estiverem
 * vazios, as seções correspondentes não aparecem na página de privacidade (D-44, D-47).
 */
export interface LegalContact {
  /** Nome da pessoa ou empresa responsável pelo tratamento (art. 5º, VI). */
  controller: string;
  /** E-mail para pedidos sobre dados pessoais (art. 41). */
  email: string;
}

/** Tratamentos descritos na página de privacidade, na ordem em que aparecem. */
export const LEGAL_PURPOSES = ["analytics", "performance", "catalog", "logs"] as const;
export type LegalPurpose = (typeof LEGAL_PURPOSES)[number];

/**
 * Base legal de cada tratamento, em texto livre (ex.: "Legítimo interesse (art. 7º, IX)").
 * Vazio significa "ainda não definido pelo proprietário": o item não é exibido.
 */
export type LegalBases = Record<LegalPurpose, string>;

export const legalContact: LegalContact = {
  controller: "",
  email: "",
};

export const legalBases: LegalBases = {
  analytics: "",
  performance: "",
  catalog: "",
  logs: "",
};

export function hasLegalContact(contact: LegalContact = legalContact): boolean {
  return contact.controller.trim() !== "" && contact.email.trim() !== "";
}

/** As bases legais já definidas, na ordem da página. */
export function definedLegalBases(
  bases: LegalBases = legalBases,
): { purpose: LegalPurpose; basis: string }[] {
  return LEGAL_PURPOSES.map((purpose) => ({ purpose, basis: bases[purpose].trim() })).filter(
    ({ basis }) => basis !== "",
  );
}
