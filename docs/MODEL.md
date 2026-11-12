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
├── components/       layout/, ui/, movie/, title/ (partes das páginas de filme e série) e person/
├── pages/            uma página por rota
├── styles/           tokens.css, typography.css, base.css, ui.css, layout.css e breakpoints.ts
└── test/             utilitários dos testes
```

Todo o código (dados, componentes, páginas, proxy e testes) está em TypeScript `strict`, sem `allowJs`. Os textos da interface ficam em `src/i18n/pt-BR.ts` e os estilos usam só os tokens de `src/styles/tokens.css` (D-50 e D-51).

## 4. Rotas

| Rota            | Página     | Observações                                                              |
| --------------- | ---------- | ------------------------------------------------------------------------ |
| `/`             | Home       | Destaque, filmes e séries em alta, 10 mais bem avaliados, pessoas e gêneros |
| `/discover`     | Discover   | `tipo` (filmes ou séries), `genre`, `sort`, `year`, `minRating` e `page` na URL |
| `/search?q=`    | Search     | Categorias em `tipo` (filmes, `series`, `pessoas`), com `page` na URL     |
| `/movie/:id`    | Movie      | IDs não numéricos mostram a página 404 sem consultar a API               |
| `/serie/:id`    | Tv         | Mesma estrutura do filme, com temporadas                                 |
| `/pessoa/:id`   | Person     | Perfil, principais trabalhos, filmografia por área e fotos               |
| `/pessoas`      | People     | Pessoas populares, com `page` na URL                                     |
| `/colecao/:id`  | Collection | Filmes da franquia em ordem de lançamento                                |
| `/minha-lista`  | Watchlist  | Títulos salvos no navegador (`localStorage`), sem consulta à API         |
| `/sobre`        | About      | Logo e aviso do TMDB, créditos do JustWatch e do YouTube                 |
| `/privacidade`  | Privacy    | O que é coletado e quais serviços externos recebem o IP                  |
| `*`             | NotFound   | 404 dentro do layout                                                     |

Cada conteúdo leva a outros: o elenco e a ficha técnica levam aos perfis, a filmografia leva a filmes e séries, os gêneros levam à descoberta, e o filme leva à coleção e às recomendações (D-55).

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
- `useMovies`: listas, busca e descoberta de filmes e de séries (convertidas para o formato dos cards por `lib/media.ts`), com paginação, "carregar mais" e remoção de duplicados.
- `useMovie`: detalhes do filme numa chamada com `append_to_response=credits,videos,recommendations,similar,watch/providers,release_dates,images,external_ids`, vídeos em `pt`, `en` e sem idioma e imagens em `pt`, sem texto e `en`.
- `useTv`: série completa numa chamada (`aggregate_credits`, `videos`, `recommendations`, `similar`, `watch/providers`, `content_ratings`, `images`, `external_ids`).
- `usePerson`: perfil com `combined_credits`, `images` e `external_ids`; quando não há biografia em português, uma segunda consulta busca a versão em inglês.
- `useCollection` e `usePeople`: coleção com seus filmes; pessoas populares ou encontradas pelo nome.
- `useGenres`: gêneros de filmes ou de séries. Onde assistir chega junto com os detalhes.
- `useDocumentTitle`: título da aba (`Duna · Cinelux`).

### Requisições por página

| Página    | Consultas ao proxy                                                                 |
| --------- | ---------------------------------------------------------------------------------- |
| Início    | `movie/popular`, `movie/top_rated`, `movie/now_playing`, `tv/popular`, `person/popular`, `genre/movie/list` |
| Filme     | `movie/{id}` com os complementos: 1 requisição                                      |
| Série     | `tv/{id}` com os complementos: 1 requisição                                         |
| Pessoa    | `person/{id}`: 1 requisição (2 quando a biografia só existe em inglês)             |
| Coleção   | `collection/{id}`: 1 requisição                                                     |
| Pessoas   | `person/popular`                                                                   |
| Buscar    | `search/movie`, `search/tv` e `search/person` (ou `movie/popular` como sugestão, sem termo) |
| Descobrir | `discover/movie` e `genre/movie/list`, ou `discover/tv` e `genre/tv/list`           |

### Cache e pré-carregamento (D-41)

- **Cache no cliente (`services/tmdb.ts`):** pedidos iguais em andamento compartilham a mesma requisição, e respostas bem-sucedidas ficam guardadas por 5 minutos (até 100). Erros não ficam guardados, então "Tentar novamente" sempre consulta de novo. Uma requisição só é cancelada quando todos os interessados desistem.
- **Pré-carregamento (`services/prefetch.ts`):** o `loader` de cada rota dispara as mesmas consultas da página, em paralelo com o download do código dela, e devolve `null` na hora. O erro de um pré-carregamento fica guardado por 10 segundos para a página recebê-lo, sem repetir a requisição.
- **Divisão por rota:** Início e 404 estão no pacote principal; Descobrir, Busca, Filme, Sobre e Privacidade são carregados sob demanda, com `RouteFallback` no primeiro carregamento. Web Analytics e Speed Insights carregam depois da página.

### Imagens e fontes (D-40)

- **Pôsteres:** `srcset` e `sizes` medidos nos cinco tamanhos de tela (`POSTER_VARIANTS` em `lib/images.ts`): cards com `w185`/`w342`, ranking com `w92`/`w185` e pôster do filme com `w185` a `w500`. Os backdrops usam `w780`/`w1280`.
- **Fontes:** DM Sans e Space Grotesk (identidade original, D-54) servidas pelo próprio site (`src/assets/fonts`, `src/styles/fonts.css`), nos subconjuntos latin e latin-ext, com `font-display: swap`. Não há requisições ao Google.

### Minha lista

`useWatchlist` guarda os títulos salvos em `localStorage` (`cinelux:minha-lista:v1`), no formato validado por `lib/watchlist.ts`: só id, tipo, título, caminho do pôster, data, nota e o momento em que foi salvo. Nada vai para o servidor. As abas abertas se atualizam pelo evento `storage`; sem armazenamento disponível, a lista vale só para a aba. O conteúdo lido é sempre validado, porque pode ter sido alterado fora do site.

### Regras de descoberta

Os valores da URL são validados em `lib/discover.ts` e `lib/pagination.ts`: ordenações permitidas, ano entre 1900 e 2100, nota entre 0 e 10 e página entre 1 e 500 (limite do TMDB). A ordenação por nota exige 200 votos e o filtro de nota mínima, 50. O formulário de filtros mantém um rascunho e só altera a URL ao ser enviado.

### Onde assistir

`lib/watchProviders.ts` separa a resposta do Brasil em assinatura, gratuito, com anúncios, aluguel e compra, na ordem de prioridade do TMDB. Sem dados para a região, a interface diz que o TMDB não lista opções, sem afirmar que o filme está indisponível. Os dados são do JustWatch, com crédito na seção e no rodapé.

### Camada de vidro

Os tokens `--glass-*` e `--surface-*` de `tokens.css` definem as superfícies translúcidas. O desfoque do fundo (`backdrop-filter`) fica só no cabeçalho, nos atalhos de seção, nos diálogos e na barra inferior; cards e painéis usam tinta e brilho, sem desfoque, para não custar desempenho. Com `prefers-reduced-transparency: reduce`, os mesmos tokens viram superfícies opacas. O CSS declara só `backdrop-filter`, sem prefixo: o build acrescenta `-webkit-` (D-56).

## 6. Proxy do TMDB

| Endpoint permitido                                                    | Cache na Vercel (`s-maxage` e `stale-while-revalidate`) |
| --------------------------------------------------------------------- | ------------------------------------------------------- |
| `genre/movie/list`, `genre/tv/list`                                   | 24 h                                                    |
| `movie/popular`, `top_rated`, `now_playing`, `tv/popular`, `person/popular`, `discover/movie`, `discover/tv` | 1 h              |
| `movie/{id}`, `movie/{id}/watch/providers`, `tv/{id}`, `person/{id}`, `collection/{id}` | 6 h                                  |
| `search/movie`, `search/tv`, `search/person`                          | 10 min                                                  |

- O navegador recebe `max-age=60`; a Vercel consome o `s-maxage` (D-19).
- Erros sempre com `no-store`: endpoint fora da lista recebe 404 `unknown_endpoint`, outros métodos recebem 405 (com `Allow: GET`; a função exporta todos os métodos para o proxy responder, D-43) e falha de conexão com o TMDB recebe 502.
- Parâmetros aceitos: `language`, `region`, `page`, `query`, `include_adult`, `sort_by`, `with_genres`, `primary_release_year`, `primary_release_date.lte`, `first_air_date_year`, `first_air_date.lte`, `vote_average.gte`, `vote_count.gte`, `append_to_response` (só `credits`, `videos`, `recommendations`, `similar`, `watch/providers`, `release_dates`, `images`, `external_ids`, `aggregate_credits`, `content_ratings` e `combined_credits`), `include_video_language` e `include_image_language`. Os demais são descartados.

| Variável       | Onde                                                            | Uso                                     |
| -------------- | --------------------------------------------------------------- | --------------------------------------- |
| `TMDB_API_KEY` | Vercel (Secret, Production e Preview) e `.env` no ambiente local | Chave v3 ou token de leitura v4 do TMDB |

## 7. Observabilidade e privacidade

`src/components/layout/Observability.tsx` carrega o Vercel Web Analytics e o Speed Insights. Antes do envio, `lib/analytics.ts` remove o parâmetro `q` (termo de busca) da URL e agrupa `/movie/123` como `/movie/[id]`. Não há cookies nem armazenamento no navegador. O que é coletado está descrito em `/privacidade`.

### Cabeçalhos de segurança

Todas as respostas recebem `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` e uma `Content-Security-Policy` em modo de bloqueio (`vercel.json`). O `vite preview` envia os mesmos valores (`server/securityHeaders.ts`), e os testes E2E falham em qualquer violação da CSP (D-39 e D-43).

## 8. Testes e qualidade

### Testes unitários (Vitest)

223 testes em 23 arquivos, ao lado do código, cobrem:

- proxy: lista de permissões, chave, token v4, tempo limite, cache por tipo e erros sem cache;
- serviço: montagem de URLs, códigos de erro e cancelamento;
- hooks `useMovies` e `useMovie`, e o carregamento do perfil com a biografia em inglês de reserva;
- regras de `lib/`: formatação, imagens e galeria, descoberta de filmes e séries, paginação, trailer e vídeos, equipe por departamento, filmografia e idade (`person.ts`), elenco e classificação de séries (`tv.ts`), onde assistir, Minha lista (validação do conteúdo guardado) e analytics;
- i18n: interpolação de valores e nome da marca sem tradução;
- componentes (Testing Library): estados de erro e vazio, grade de pôsteres (carregamento, erro, vazio, pôster e título ausentes) e paginação.

### Testes de interface (E2E)

O Playwright (Chromium) testa o app como o visitante usa, a partir do build de produção servido pelo `vite preview`:

```text
playwright.config.ts   webServer (build + vite preview, sem chave), 7 projetos de tela + projeto proxy
e2e/
├── fixtures/          JSON no formato do TMDB, tipados por src/types/tmdb.ts (index.ts)
├── helpers/
│   ├── tmdb.ts        page.route em /api/tmdb/**: fixture por endpoint, trocas por teste, registro das chamadas
│   └── test.ts        test estendido: mock automático, rede externa isolada, falha em erro de console
└── tests/             home, search, movie, discover, encyclopedia, watchlist, states, routes, a11y, responsive e proxy
```

- **Fluxo:** o navegador carrega o app real; as chamadas a `/api/tmdb/<endpoint>` são interceptadas antes de chegar ao servidor e respondidas com fixtures. Os testes também conferem os parâmetros enviados (idioma, região, filtros, página e complementos dos detalhes).
- **Tamanhos:** 320, 375, 390, 420, 768, 1024 e 1440 px de largura. Testes que dependem do layout (campo de busca do cabeçalho a partir de 900 px, barra inferior abaixo disso) são pulados, com o motivo, onde o elemento não existe.
- **Proxy:** o projeto `proxy` chama o `/api/tmdb` do `vite preview` por HTTP. Sem chave, nenhuma consulta chega ao TMDB; os testes cobrem método, lista de endpoints, chave ausente e `Cache-Control` dos erros.
- **Cobertura:** início; busca pelo campo da página, pelo cabeçalho e pela barra inferior; filme, trailer e onde assistir; descoberta (gênero, ordenação, filtros, paginação); carregamento, vazio, erros 503, 429, 504 e chave ausente com "Tentar novamente"; rotas diretas e 404; rodapé e créditos; teclado, foco e nomes acessíveis; alvos de toque de 44 × 44 px; alto contraste do sistema (`forced-colors`); busca com `&`, `#` e `?`; série, pessoa (inclusive biografia só em inglês), coleção, busca por categoria, descoberta de séries e os caminhos entre conteúdos (filme → pessoa → filme → direção → coleção); rolagem horizontal e diálogos em todas as larguras.

O CI está descrito no [README](../README.md#scripts).

## 9. Limitações atuais

- O limite do firewall da Vercel em `/api` (300 requisições por minuto por IP) está em modo **Log**: registra, mas ainda não bloqueia. Com o tráfego atual não há evidência que justifique o modo Block (D-34, D-47).
- A CSP não tem endpoint de coleta de relatórios: um bloqueio aparece só no console do navegador do visitante (D-43). Nos Previews da Vercel, a barra de ferramentas da Vercel (`vercel.live`) fica bloqueada pela CSP.
- O JavaScript inicial ainda tem cerca de 120 KB com gzip: quase tudo é `react-dom` e `react-router`, que a divisão por rota não reduz.
- A página de privacidade ainda não identifica o responsável pelos dados, o canal de contato nem as bases legais: depende do proprietário preencher `src/config/legal.ts` (D-44, D-47 e `docs/PENDENCIAS_PROPRIETARIO.md`).
- O Web Analytics depende de ativação no painel da Vercel; até lá, os eventos enviados pelo site são descartados. O Speed Insights já recebe dados.
- Disponibilidade de streaming só para o Brasil.
- O TMDB não fornece premiações, críticas profissionais nem notícias: essas áreas não existem no site. A filmografia mostra personagens e funções como o TMDB os registra, em parte em inglês (ex.: "Producer").
- Temporadas aparecem com ano, episódios e resumo, sem página própria nem lista de episódios.

## 10. Referências

- [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vite.dev/)
- [Vitest](https://vitest.dev/)
- [API do TMDB](https://developer.themoviedb.org/docs)
- [Vercel Web Analytics](https://vercel.com/docs/analytics)
