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
      "YouTube (youtube-nocookie.com): o trailer, apenas quando você clica em assistir. Durante a reprodução, o YouTube pode guardar dados no navegador, conforme a política dele.",
    ],
    purposesTitle: "Para que usamos os dados",
    purposes: [
      "Estatísticas de visitas: saber quais páginas são usadas e decidir o que melhorar.",
      "Desempenho: encontrar páginas lentas e corrigir problemas de carregamento.",
      "Consultas ao TMDB: mostrar o catálogo, as buscas e os detalhes de cada filme.",
      "Registros técnicos: manter o site no ar e protegido contra abuso, como o excesso de consultas.",
    ],
    legalBasesTitle: "Bases legais",
    legalBasesText: "Cada tratamento se apoia em uma das hipóteses do art. 7º da LGPD:",
    legalBasisItem: "{purpose}: {basis}",
    purposeNames: {
      analytics: "Estatísticas de visitas",
      performance: "Desempenho",
      catalog: "Consultas ao TMDB",
      logs: "Registros técnicos",
    },
    storageTitle: "Cookies e armazenamento no navegador",
    storageText:
      "O Cinelux não grava cookies. Buscas e filtros ficam apenas no endereço da página, para que você possa compartilhá-los. As respostas do catálogo ficam só na memória da aba aberta, por até 5 minutos, e somem ao fechá-la.",
    hostingTitle: "Onde os dados são tratados",
    hostingText:
      "O site e o servidor que consulta o TMDB são hospedados pela Vercel Inc., nos Estados Unidos, que também processa as estatísticas de visitas e de desempenho. As consultas de filmes, inclusive o termo de busca, são enviadas ao TMDB pelo nosso servidor, sem o seu endereço IP. Como esses serviços ficam fora do Brasil, os dados técnicos descritos nesta página são tratados no exterior.",
    logsTitle: "Registros técnicos",
    logsText:
      "Como qualquer servidor, a hospedagem registra dados técnicos das requisições, como o endereço da página pedida. No plano de hospedagem atual, esses registros são mantidos por até uma hora.",
    retentionTitle: "Por quanto tempo guardamos",
    retention: [
      "Respostas do catálogo na memória da aba: até 5 minutos.",
      "Código que representa o visitante nas estatísticas: descartado em até 24 horas.",
      "Registros técnicos da hospedagem: até 1 hora.",
      "Estatísticas agregadas de visitas e de desempenho, que não identificam ninguém: ficam no painel da hospedagem pelo período que o plano oferece.",
    ],
    rightsTitle: "Seus direitos",
    rightsText:
      "A Lei Geral de Proteção de Dados (Lei nº 13.709/2018, art. 18) garante, entre outros, os direitos de confirmar se seus dados são tratados, acessá-los, corrigi-los, pedir anonimização, bloqueio ou eliminação, obter informações sobre compartilhamento e revogar o consentimento.",
    contactTitle: "Responsável e contato",
    contactController: "Responsável pelo tratamento: {controller}",
    contactEmail: "Pedidos sobre dados pessoais: {email}",
    contactProcedure:
      "Para exercer qualquer direito, envie um e-mail dizendo qual pedido quer fazer. A LGPD prevê que a declaração completa seja entregue em até 15 dias (art. 19, II).",
    updated: "Atualizado em 11 de novembro de 2026.",
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
