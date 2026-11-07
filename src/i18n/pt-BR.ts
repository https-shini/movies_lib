/**
 * Textos da interface em português do Brasil.
 * Nenhum componente deve escrever texto visível diretamente: tudo vem daqui,
 * para que outros idiomas (ex.: en.ts) entrem sem refatoração.
 * O nome "Cinelux" e o logo nunca são traduzidos.
 */
export const ptBR = {
  brand: {
    name: "Cinelux",
    tagline: "Seu acervo de cinema.",
  },

  documentTitle: {
    default: "Cinelux · Seu acervo de cinema",
    page: "{title} · Cinelux",
  },

  format: {
    notInformed: "Não informado",
    hours: "{hours}h",
    minutes: "{minutes}min",
    hoursAndMinutes: "{hours}h {minutes}min",
  },

  discover: {
    sort: {
      popularity: "Mais populares",
      rating: "Melhor avaliados",
      releaseDate: "Lançamentos recentes",
      revenue: "Maior bilheteria",
    },
  },

  watchProviders: {
    flatrate: "Assinatura",
    free: "Gratuito",
    ads: "Com anúncios",
    rent: "Aluguel",
    buy: "Compra",
  },

  errors: {
    network: "Não foi possível conectar. Verifique sua internet e tente de novo.",
    unauthorized: "A chave do TMDB é inválida ou não tem permissão.",
    notFound: "Não encontramos este conteúdo.",
    invalidRequest: "A consulta não foi aceita. Revise os filtros e tente de novo.",
    rateLimited: "Muitas consultas em pouco tempo. Aguarde um instante e tente de novo.",
    upstream: "O TMDB não respondeu a tempo. Tente de novo.",
    unavailable: "O TMDB está indisponível no momento. Tente mais tarde.",
    missingServerKey: "A chave do TMDB não está configurada no servidor.",
    invalidResponse: "Recebemos uma resposta inesperada. Tente de novo.",
    unknown: "Algo saiu do roteiro. Tente de novo.",
  },
} as const;

export type Messages = typeof ptBR;
