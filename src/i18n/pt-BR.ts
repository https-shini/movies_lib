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

  watchProvidersCredit: {
    source: "Dados de disponibilidade:",
    justWatch: "JustWatch",
  },

  footer: {
    navLabel: "Rodapé",
    home: "Início",
    discover: "Descobrir",
    search: "Buscar",
    about: "Sobre",
    privacy: "Privacidade",
    dataBy: "Dados e imagens fornecidos pelo",
    notice:
      "Este produto usa o TMDB e as APIs do TMDB, mas não é endossado, certificado nem aprovado pelo TMDB.",
    availabilityBy: "Disponibilidade de streaming:",
  },

  about: {
    title: "Sobre",
    kicker: "Créditos",
    heading: "Sobre o Cinelux",
    lede: "Um acervo de cinema para encontrar um filme, entender do que se trata e decidir se vale assistir.",
    tmdbTitle: "Dados e imagens: TMDB",
    tmdbText:
      "Títulos, sinopses, elenco, notas, pôsteres e imagens vêm da API do The Movie Database (TMDB).",
    tmdbNoticeLabel: "Aviso exigido pelos termos de uso do TMDB:",
    tmdbNoticeOriginal:
      "This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.",
    tmdbNoticeTranslation:
      "Tradução: este produto usa o TMDB e as APIs do TMDB, mas não é endossado, certificado nem aprovado pelo TMDB.",
    tmdbLogoAlt: "The Movie Database (TMDB)",
    tmdbLink: "Visitar o TMDB",
    justWatchTitle: "Onde assistir: JustWatch",
    justWatchText:
      "As informações de streaming, aluguel e compra são fornecidas pelo JustWatch, por meio do TMDB.",
    justWatchLink: "Visitar o JustWatch",
    youTubeTitle: "Trailers: YouTube",
    youTubeText:
      "Os trailers são reproduzidos pelo YouTube, no modo de privacidade aprimorada, só depois que você escolhe assistir.",
    privacyLink: "Como tratamos seus dados",
  },

  privacy: {
    title: "Privacidade",
    kicker: "Seus dados",
    heading: "Privacidade",
    lede: "O que o Cinelux coleta, para quê, e o que fica de fora.",
    summaryTitle: "Em resumo",
    summary: [
      "Não há cadastro, login nem formulário: o Cinelux não pede nenhum dado pessoal.",
      "Não usamos cookies de rastreamento nem cookies de terceiros para publicidade.",
      "Medimos visitas e desempenho de forma anônima e agregada, sem identificar ninguém.",
    ],
    analyticsTitle: "Estatísticas de visitas (Vercel Web Analytics)",
    analyticsText:
      "Contamos visitas de forma anônima para saber quais páginas são usadas. Não usamos cookies: o visitante é representado por um código gerado a partir da requisição, descartado em até 24 horas. São registrados a página visitada (sem o termo de busca), o site de origem, o país e a região aproximados, o sistema, o navegador e o tipo de dispositivo.",
    speedTitle: "Desempenho (Vercel Speed Insights)",
    speedText:
      "Medimos o tempo de carregamento das páginas para melhorar a experiência. São registrados a página (sem o termo de busca), o tipo de conexão, o navegador, o sistema, o tipo de dispositivo, o país e as métricas de carregamento. Os dados não são associados a pessoas nem a endereços IP.",
    thirdPartyTitle: "Conteúdo de outros serviços",
    thirdPartyText:
      "Ao abrir uma página, o seu navegador busca conteúdo diretamente nestes serviços, que recebem o endereço IP como em qualquer acesso à internet:",
    thirdParty: [
      "TMDB (image.tmdb.org): pôsteres, imagens de fundo e fotos do elenco.",
      "Google Fonts: as fontes tipográficas do site.",
      "YouTube (youtube-nocookie.com): o trailer, apenas quando você clica em assistir.",
    ],
    storageTitle: "O que guardamos",
    storageText:
      "Nada no seu navegador além do necessário para a página funcionar. Buscas e filtros ficam apenas no endereço da página, para que você possa compartilhá-los.",
    updated: "Atualizado em 7 de novembro de 2026.",
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
