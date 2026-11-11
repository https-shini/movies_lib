/**
 * Responsável pelo tratamento dos dados e canal de contato (LGPD, art. 41).
 *
 * PENDENTE: preenchimento pelo proprietário do projeto. Nenhum dado pode ser inventado
 * aqui (nome, CNPJ/CPF, endereço ou e-mail). Enquanto os campos estiverem vazios, a
 * seção "Responsável e contato" não aparece na página de privacidade (D-44).
 */
export interface LegalContact {
  /** Nome da pessoa ou empresa responsável pelo tratamento. */
  controller: string;
  /** E-mail para pedidos sobre dados pessoais. */
  email: string;
}

export const legalContact: LegalContact = {
  controller: "",
  email: "",
};

export function hasLegalContact(contact: LegalContact = legalContact): boolean {
  return contact.controller.trim() !== "" && contact.email.trim() !== "";
}
