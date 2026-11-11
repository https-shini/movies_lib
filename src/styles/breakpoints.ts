/**
 * Breakpoints do Cinelux, em pixels CSS. Os mesmos valores estão documentados em
 * tokens.css (seção 6): variáveis CSS não funcionam dentro de `@media`, então cada
 * `@media` usa um destes números. Os testes E2E importam daqui (D-50).
 */
export const BREAKPOINTS = {
  /** Grade de pôsteres em 2 colunas fixas (até). */
  "2xs": 380,
  /** Celulares estreitos (até). */
  xs: 420,
  /** Botão de busca visível (a partir de). */
  sm: 480,
  /** Diálogos deixam de ocupar a tela toda (a partir de). */
  md: 600,
  /** Layouts de duas colunas. */
  lg: 700,
  /** Cabeçalho com navegação e busca; a barra inferior some. */
  xl: 900,
  /** Grade de pôsteres mais larga. */
  "2xl": 1024,
  /** Trilhos com 7 itens e índice de gêneros em 4 colunas. */
  "3xl": 1200,
} as const;
