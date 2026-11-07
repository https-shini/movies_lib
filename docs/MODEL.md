# Documentação técnica do MoviesLib

## 1. Visão geral

O MoviesLib é uma aplicação web de descoberta e consulta de filmes. A implementação atual utiliza React, Vite, React Router e a API pública do The Movie Database (TMDB).

A modernização é incremental. Esta documentação diferencia o que já existe do que está planejado para evitar descrever componentes futuros como se já estivessem implementados.

## 2. Arquitetura atualmente implementada

A aplicação é um frontend React servido como site estático, com uma função serverless (`/api/tmdb`) que intermedeia as consultas ao TMDB e mantém a chave no servidor. **Ainda não há banco de dados nem autenticação implementados nesta versão.**

```text
Navegador
   |
   v
React + React Router 7 (data router)
   |
   +--> Layout (App), ScrollRestoration e tela de erro de rota
   +--> Páginas e componentes
   +--> Hooks de estado assíncrono
   +--> Serviços de integração TMDB
              |
              v
   /api/tmdb (função serverless na Vercel / middleware no Vite local)
     - lista de permissões de endpoints e parâmetros
     - adiciona TMDB_API_KEY no servidor
     - cache na CDN (s-maxage)
              |
              v
          API do TMDB
```

### Tecnologias

- React 18: composição da interface.
- Vite 8: desenvolvimento e build.
- Vitest 5: testes unitários.
- ESLint 10: análise estática e regras para React Hooks.
- React Router: navegação entre páginas.
- JavaScript ES Modules: implementação da aplicação.
- CSS: estilos e responsividade.
- TMDB API: catálogo, dados de filmes e disponibilidade regional.

## 3. Organização do código

```text
api/              tmdb.js: função serverless da Vercel (/api/tmdb)
server/           tmdbProxy (validação, chave, cache) e viteTmdbProxy (servidor local)
src/
├── config/       brand: nome e textos do produto
├── styles/       tokens, base, ui (primitivos) e layout
├── components/
│   ├── layout/   cabeçalho, barra inferior do celular, rodapé, marca
│   ├── ui/       diálogo, faixa horizontal, paginação, nota, estados, telas de status
│   └── movie/    pôster, grade, faixa, ranking, destaque, trailer, provedores
├── hooks/        useAsyncData (com nova tentativa), useDocumentTitle
├── pages/        Home, Discover, Search, Movie, NotFound, RouteError
├── services/     tmdb, tmdbUrl, tmdbErrors, discover, search, pagination, movieDetails, watchProviders
├── utils/        formatters
├── App.jsx       layout com cabeçalho, conteúdo, rodapé, barra inferior e ScrollRestoration
└── main.jsx      estilos globais e definição das rotas (createBrowserRouter)

tests/            testes unitários de serviços, formatadores e regras isoladas
```

### Rotas

| Rota | Página | Observações |
|---|---|---|
| `/` | Home | Seções Em alta, Mais bem avaliados e Nos cinemas |
| `/discover` | Discover | Filtros `genre`, `sort`, `year`, `minRating` e `page` na URL |
| `/search?q=` | Search | Busca por título com `page` na URL |
| `/movie/:id` | Movie | IDs não numéricos exibem a página 404 sem consultar a API |
| `*` | NotFound | Página 404 dentro do layout |

Erros inesperados de renderização são capturados por `RouteError` (`errorElement`), mantendo a navegação disponível.

### Responsabilidades

- `components/`: componentes reutilizáveis da interface, incluindo catálogo e disponibilidade de provedores.
- `hooks/`: hooks React que encapsulam comportamento compartilhado.
- `pages/`: componentes associados às rotas.
- `services/`: comunicação com serviços externos, normalização de respostas e montagem de requisições.
- `utils/`: funções puras reutilizáveis, sem dependência da interface.
- `tests/`: testes automatizados das funções utilitárias e regras isoladas.

## 4. Integração com TMDB

No navegador, a comunicação é centralizada em `src/services/tmdb.js`, que chama o proxy interno `/api/tmdb?path=<endpoint>&<parâmetros>`. A URL é montada por `src/services/tmdbUrl.js`. No servidor, `server/tmdbProxy.js` valida o endpoint e os parâmetros, adiciona a chave (como `api_key` ou, para tokens v4, no cabeçalho `Authorization: Bearer`) e repassa a consulta ao TMDB com tempo limite de 8 segundos.

Endpoints permitidos: `movie/popular`, `movie/top_rated`, `movie/now_playing`, `movie/{id}`, `movie/{id}/watch/providers`, `search/movie`, `discover/movie` e `genre/movie/list`.

A disponibilidade por filme é consultada por `src/services/watchProviders.js`, usando o endpoint `/movie/{id}/watch/providers`. A resposta é normalizada por região e separada nas modalidades de assinatura, gratuito, com anúncios, aluguel e compra. A interface atual apresenta a região brasileira (BR), ordena provedores pela prioridade retornada pelo TMDB e oferece o link de consulta da própria fonte quando disponível.

Erros HTTP e de rede são convertidos em mensagens em português por `src/services/tmdbErrors.js` (chave ausente no servidor, 401, 404, 422, 429, 502/504, 5xx e falhas de conexão). Requisições canceladas (`AbortError`) são propagadas sem alteração.

Variáveis de ambiente:

| Variável | Onde | Responsabilidade |
|---|---|---|
| `TMDB_API_KEY` | Servidor (Vercel: tipo Secret, Production e Preview; local: `.env`) | Chave da API v3 ou token de leitura v4 do TMDB |

As URLs de imagens (`image.tmdb.org`) são públicas e definidas em `src/services/tmdb.js`.

A integração de provedores usa o mesmo proxy e a mesma chave, portanto não exige uma nova variável de ambiente.

### Segurança

A chave do TMDB fica apenas no servidor e não é incorporada ao bundle. O proxy aceita somente `GET`, restringe endpoints e parâmetros a uma lista de permissões e descarta qualquer `api_key` enviada pelo cliente. Respostas de erro não são armazenadas em cache.

O proxy ainda não aplica limite de requisições por usuário; isso deverá ser avaliado junto com a autenticação. Uma chave que tenha sido exposta em versões anteriores deve ser rotacionada.

## 5. Descoberta, detalhes e disponibilidade de filmes

A página inicial agrega seções de filmes populares, mais bem avaliados e em cartaz. A página de descoberta consulta o endpoint de descoberta do TMDB e permite filtrar por gênero, ano de lançamento e nota mínima, além de ordenar e paginar resultados. A URL é a fonte dos filtros aplicados; o formulário mantém um rascunho próprio e só dispara a consulta ao ser enviado. Valores da URL são validados (ordenações permitidas, ano entre 1900 e 2100, nota entre 0 e 10, página entre 1 e 500, limite aceito pelo TMDB).

Para evitar resultados pouco representativos, a ordenação por nota exige ao menos 200 votos e o filtro de nota mínima exige ao menos 50 votos. A ordenação por lançamentos recentes considera apenas filmes com data de lançamento até o dia atual.

A página de detalhes solicita informações complementares de elenco, vídeos, recomendações e filmes semelhantes. Exibe pôster, imagem de fundo, título original, sinopse, avaliação, dados financeiros, elenco principal e link para trailer quando disponível. Os vídeos são solicitados em português, inglês e sem idioma (`include_video_language`), priorizando trailers oficiais em português. Quando não há recomendações, são exibidos filmes semelhantes.

O componente `WatchProviders` consulta a disponibilidade do filme para o Brasil e apresenta provedores agrupados por modalidade: assinatura, gratuito, com anúncios, aluguel e compra. Quando a região não possui dados, a interface informa que nenhuma opção foi retornada, sem inferir que o filme não esteja disponível em todos os serviços. Preços e condições não são estimados; o usuário é direcionado à fonte para confirmar os detalhes.

## 6. Estados assíncronos

O hook `useAsyncData` padroniza carregamento, resultado, erro, cancelamento da requisição anterior e nova tentativa (`reload`).

Os componentes de lista exibem esqueletos no formato final do conteúdo durante o carregamento. `StateMessage` apresenta estados vazios e de erro, com a ação "Tentar novamente" ligada ao `reload`.

O hook `useDocumentTitle` atualiza o título da aba conforme a página e o filme exibido.

## 7. Testes e qualidade

Os testes utilizam Vitest e cobrem atualmente:

- montagem de URLs do TMDB;
- resolução de endpoints relativos e absolutos;
- inclusão e preservação da chave de API;
- codificação de parâmetros de pesquisa;
- conversão e validação de filtros de descoberta, incluindo leitura e escrita na URL;
- parâmetros de busca e normalização de paginação;
- requisições ao proxy com mensagens de erro em português e cancelamento;
- proxy do TMDB: lista de permissões, chave no servidor, token v4, cache, erros e métodos;
- seleção de recomendações com alternativa para filmes semelhantes;
- formatação do título da aba;
- formatação de moeda, duração, notas e datas;
- seleção de trailers do YouTube, priorizando versões oficiais em português;
- normalização de provedores por região e modalidade;
- ordenação e tratamento de provedores ausentes ou inválidos.

Comandos:

```bash
npm run lint
npm test
npm run test:watch
npm run build
npm run check
```

O GitHub Actions executa instalação limpa, auditoria de dependências com nível mínimo moderado, ESLint, testes e build.

## 8. Limitações atuais

- O backend se limita ao proxy do TMDB; não há API própria de domínio.
- O proxy não aplica limite de requisições por usuário.
- A disponibilidade de provedores está atualmente apresentada para a região brasileira.
- A API do TMDB pode não retornar provedores para todos os filmes ou regiões.
- Não existe persistência de usuários, avaliações ou listas.
- Não existe autenticação.
- A cobertura de testes ainda é inicial e focada em funções isoladas.
- A análise estática está configurada com ESLint. O relatório de auditoria atual não identifica vulnerabilidades conhecidas nas dependências.

## 9. Evolução arquitetural planejada

A evolução do projeto está detalhada no [Roadmap de evolução](./ROADMAP.md), que reúne:

- o diagnóstico da arquitetura e do uso atual da API;
- as regras e limites do TMDB que afetam o projeto (limite de requisições, `append_to_response`, cache de no máximo 6 meses, atribuição ao TMDB e ao JustWatch, uso comercial e restrição a IA);
- 25 iniciativas com justificativa, endpoints, impacto técnico, esforço, prioridade e status;
- o plano de implementação em fases.

A escolha definitiva de framework backend, ORM, banco, hospedagem e provedores de autenticação deverá ser documentada antes da implementação da fase 3 do roadmap.

## 10. Referências

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do React Router](https://reactrouter.com/)
- [Documentação da API do TMDB](https://developer.themoviedb.org/docs)
