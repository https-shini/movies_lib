export const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao TMDB. Verifique sua conexão com a internet e tente novamente.";

/**
 * Converte o status HTTP do TMDB em uma mensagem em português para a interface.
 * As mensagens originais da API são em inglês e não são exibidas ao usuário.
 */
export function getTmdbErrorMessage(status) {
  if (status === 401) {
    return "A chave do TMDB é inválida ou não tem permissão. Verifique VITE_API_KEY.";
  }

  if (status === 404) {
    return "O conteúdo solicitado não foi encontrado no TMDB.";
  }

  if (status === 422) {
    return "O TMDB não aceitou os parâmetros da consulta. Revise os filtros e tente novamente.";
  }

  if (status === 429) {
    return "Muitas consultas em pouco tempo. Aguarde alguns instantes e tente novamente.";
  }

  if (status >= 500) {
    return "O TMDB está indisponível no momento. Tente novamente mais tarde.";
  }

  return `Não foi possível consultar o TMDB (HTTP ${status}).`;
}
