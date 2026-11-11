# Documentação técnica do Cinelux

## 1. Visão geral

O Cinelux é uma aplicação web de descoberta e consulta de filmes, com dados da API do The Movie Database (TMDB). É um frontend React servido como site estático na Vercel, com uma única função serverless que intermedeia as consultas ao TMDB e guarda a chave no servidor.

**Não há banco de dados, autenticação nem API própria de domínio.** Esta documentação descreve só o que existe no código; o que está planejado fica no [Roadmap](./ROADMAP.md) e as escolhas feitas ao longo da refatoração ficam em [DECISIONS.md](./DECISIONS.md).

## 2. Arquitetura

```text
Navegador
  │
  ├─ React 19 + React Router 8 (createBrowserRouter)
  │    páginas → hooks → services/tmdb.ts
  │                         │  fetch /api/tmdb/<endpoint>?<parâmetros>
  │                         ▼
  │   Vercel: vercel.json reescreve /api/tmdb/:path+ → /api/tmdb?path=:path+
  │                         │
  │                         ▼
  │   api/tmdb.ts → server/tmdbProxy.ts
  │     - só GET; lista fechada de endpoints e parâmetros
  │     - acrescenta TMDB_API_KEY (v3 na URL ou v4 no cabeçalho Bearer)
  │     - tempo limite de 8 s
  │     - Cache-Control por tipo de dado; erros com no-store
  │                         │
  │                         ▼
  │                    API do TMDB
  │
  ├─ image.tmdb.org      pôsteres, fundos e fotos (direto do navegador)
  ├─ Google Fonts        fontes
  ├─ youtube-nocookie    trailer, só quando a pessoa escolhe assistir
  └─ /_vercel/insights e /_vercel/speed-insights   estatísticas sem cookies
```

Em `npm run dev` e `npm run preview`, o plugin `server/viteTmdbProxy.ts` atende `/api/tmdb` com o mesmo `handleTmdbProxy`, lendo a chave do `.env`.

## 3. Organização do código

```text
api/tmdb.ts           função da Vercel; importa o proxy com extensão .js (D-15)
server/               tmdbProxy.ts (regras do proxy) e viteTmdbProxy.ts (servidor local)
src/
├── main.tsx          rotas e estilos globais
├── App.tsx           layout, ScrollRestoration e Observability
├── services/tmdb.ts  única porta de saída para a API, com TmdbError e códigos de erro
├── hooks/            estado assíncrono e acesso aos dados
├── lib/              regras puras e testáveis
├── types/tmdb.ts     tipos das respostas do TMDB
├── i18n/             pt-BR.ts (todos os textos da interface) e interpolate
├── components/       layout/, ui/ e movie/
├── pages/            uma página por rota
├── styles/           tokens.css, base.css, ui.css e layout.css
└── test/             utilitários dos testes
```

A camada de dados (`services`, `hooks`, `lib`, `types`, `i18n`), o proxy e as páginas `About` e `Privacy` estão em TypeScript `strict`. Os demais componentes e páginas ainda são `.jsx`, aceitos pelo `allowJs` até as fases de componentes do Cinelux.

## 4. Rotas

| Rota            | Página    | Observações                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| `/`             | Home      | Destaque, Em alta, 10 mais bem avaliados, Nos cinemas e gêneros   |
| `/discover`     | Discover  | `genre`, `sort`, `year`, `minRating` e `page` na URL              |
| `/search?q=`    | Search    | Busca por título, com `page` na URL                               |
| `/movie/:id`    | Movie     | IDs não numéricos mostram a página 404 sem consultar a API        |
| `/sobre`        | About     | Logo e aviso do TMDB, créditos do JustWatch e do YouTube          |
| `/privacidade`  | Privacy   | O que é coletado e quais serviços externos recebem o IP           |
| `*`             | NotFound  | 404 dentro do layout                                              |

Erros de renderização são capturados por `RouteError` (`errorElement`) sem perder a navegação. Na Vercel, toda rota fora de `/api/` é servida pelo `index.html`; rotas inexistentes respondem 200 e mostram a 404 do próprio app.

## 5. Fluxos de dados

### Camada de serviço

`src/services/tmdb.ts` monta a URL do proxy (`buildProxyUrl`, com cada segmento e parâmetro codificado), envia `language=pt-BR` em todas as consultas e `region=BR` onde a API aceita. Respostas que não são `ok` viram `TmdbError` com um código e a mensagem correspondente de `i18n/pt-BR.ts`:

| Situação                              | Código             |
| ------------------------------------- | ------------------ |
| Falha de rede                         | `network`          |
| Chave ausente no servidor             | `missingServerKey` |
| 401 ou 403                            | `unauthorized`     |
| 404                                   | `notFound`         |
| 400 ou 422                            | `invalidRequest`   |
| 429                                   | `rateLimited`      |
| 502 ou 504                            | `upstream`         |
| Outros 5xx                            | `unavailable`      |
| Resposta sem JSON válido              | `invalidResponse`  |

Requisições canceladas (`AbortError`) são repassadas sem conversão.

### Hooks

- `useAsync`: carregamento, dados, erro, código do erro e `reload`, com `AbortController` a cada nova consulta.
- `useMovies`: listas, busca e descoberta, com paginação, "carregar mais" e remoção de duplicados.
- `useMovie`: detalhes do filme numa chamada com `append_to_response=credits,videos,recommendations,similar` e vídeos em `pt`, `en` e sem idioma.
- `useGenres` e `useWatchProviders`: gêneros e onde assistir.
- `useDocumentTitle`: título da aba (`Duna · Cinelux`).

### Requisições por página

| Página  | Consultas ao proxy                                                       |
| ------- | ------------------------------------------------------------------------ |
| Início  | `movie/popular`, `movie/top_rated`, `movie/now_playing`, `genre/movie/list` |
| Filme   | `movie/{id}` (com os complementos) e `movie/{id}/watch/providers`        |
| Buscar  | `search/movie` (ou `movie/popular` como sugestão, sem termo)             |
| Descobrir | `discover/movie` e `genre/movie/list`                                  |

### Regras de descoberta

Os valores da URL são validados em `lib/discover.ts` e `lib/pagination.ts`: ordenações permitidas, ano entre 1900 e 2100, nota entre 0 e 10 e página entre 1 e 500 (limite do TMDB). A ordenação por nota exige 200 votos e o filtro de nota mínima, 50. O formulário de filtros mantém um rascunho e só altera a URL ao ser enviado.

### Onde assistir

`lib/watchProviders.ts` separa a resposta do Brasil em assinatura, gratuito, com anúncios, aluguel e compra, na ordem de prioridade do TMDB. Sem dados para a região, a interface diz que o TMDB não lista opções, sem afirmar que o filme está indisponível. Os dados são do JustWatch, com crédito na seção e no rodapé.

## 6. Proxy do TMDB

| Endpoint permitido              | Cache na Vercel (`s-maxage` e `stale-while-revalidate`) |
| ------------------------------- | ------------------------------------------------------- |
| `genre/movie/list`              | 24 h                                                    |
| `movie/popular`, `top_rated`, `now_playing`, `discover/movie` | 1 h                       |
| `movie/{id}`, `movie/{id}/watch/providers` | 6 h                                          |
| `search/movie`                  | 10 min                                                  |

- O navegador recebe `max-age=60`; a Vercel consome o `s-maxage` (D-19).
- Erros sempre com `no-store`: endpoint fora da lista recebe 404 `unknown_endpoint`, outros métodos recebem 405 e falha de conexão com o TMDB recebe 502.
- Parâmetros aceitos: `language`, `region`, `page`, `query`, `include_adult`, `sort_by`, `with_genres`, `primary_release_year`, `primary_release_date.lte`, `vote_average.gte`, `vote_count.gte`, `append_to_response` (só `credits`, `videos`, `recommendations`, `similar` e `watch/providers`) e `include_video_language`. Os demais são descartados.

| Variável       | Onde                                                            | Uso                                     |
| -------------- | --------------------------------------------------------------- | --------------------------------------- |
| `TMDB_API_KEY` | Vercel (Secret, Production e Preview) e `.env` no ambiente local | Chave v3 ou token de leitura v4 do TMDB |

## 7. Observabilidade e privacidade

`src/components/layout/Observability.tsx` carrega o Vercel Web Analytics e o Speed Insights. Antes do envio, `lib/analytics.ts` remove o parâmetro `q` (termo de busca) da URL e agrupa `/movie/123` como `/movie/[id]`. Não há cookies nem armazenamento no navegador. O que é coletado está descrito em `/privacidade`.

## 8. Testes e qualidade

142 testes em 12 arquivos, ao lado do código, cobrem:

- proxy: lista de permissões, chave, token v4, tempo limite, cache por tipo e erros sem cache;
- serviço: montagem de URLs, códigos de erro e cancelamento;
- hooks `useMovies` e `useMovie`;
- regras de `lib/`: formatação, imagens, descoberta, paginação, trailer, onde assistir e analytics;
- i18n: interpolação de valores e nome da marca sem tradução.

Ainda não há testes de componentes nem de interface no navegador; eles entram no Bloco B (Playwright). O CI está descrito no [README](../README.md#scripts).

## 9. Limitações atuais

- Sem limite de requisições aplicado ao proxy: a regra do firewall da Vercel está pendente (D-31).
- Faltam cabeçalhos de segurança além do HSTS (CSP, `X-Content-Type-Options`, `Referrer-Policy`).
- Um único bundle de JavaScript (cerca de 120 KB com gzip), sem divisão por rota; pôsteres sem `srcset`; fontes do Google Fonts. São alvos do Bloco C.
- A página de privacidade ainda não identifica o responsável pelos dados nem traz canal de contato.
- Disponibilidade de streaming só para o Brasil.

## 10. Referências

- [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vite.dev/)
- [Vitest](https://vitest.dev/)
- [API do TMDB](https://developer.themoviedb.org/docs)
- [Vercel Web Analytics](https://vercel.com/docs/analytics)
