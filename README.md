# Cinelux

Acervo de cinema para encontrar um filme, entender do que se trata e decidir se vale assistir. Os dados e as imagens vêm da API do [The Movie Database (TMDB)](https://www.themoviedb.org/).

**Aplicação publicada:** https://movies-lib-vite.vercel.app

O projeto nasceu como MoviesLib e está sendo refeito como Cinelux em fases e blocos registrados em [docs/DECISIONS.md](./docs/DECISIONS.md). O repositório e o projeto na Vercel ainda usam o nome antigo (`movies_lib` e `movies-lib`).

## Funcionalidades

- **Início:** destaque do filme mais popular, faixas "Em alta", "Séries em alta" e "Nos cinemas", ranking dos 10 mais bem avaliados, pessoas em destaque e índice de gêneros.
- **Descobrir (`/discover`):** filmes ou séries (`?tipo=series`), gêneros e ordenação com um toque, ano e nota mínima num painel de filtros, filtros ativos como chips removíveis, tudo registrado na URL, com paginação.
- **Buscar (`/search?q=`):** resultados por categoria (filmes, séries e pessoas), com a contagem de cada uma, paginação e sugestões quando não há termo.
- **Filme (`/movie/:id`):** sinopse, nota, gêneros clicáveis, ficha técnica com a classificação indicativa do Brasil, trailer na própria página (YouTube em modo de privacidade aprimorada), onde assistir no Brasil (dados do JustWatch), elenco com link para cada perfil, elenco e equipe completos, galeria de vídeos e de imagens, links oficiais, coleção e recomendações, com atalhos para cada seção.
- **Série (`/serie/:id`):** a mesma estrutura do filme, com criação, emissora, situação, temporadas e elenco de todas as temporadas.
- **Pessoa (`/pessoa/:id`) e Pessoas (`/pessoas`):** biografia (em inglês, com aviso, quando falta a tradução), principais trabalhos, filmografia completa por área de atuação com filtro de filmes e séries, fotos e perfis oficiais; e a lista das pessoas mais procuradas.
- **Coleção (`/colecao/:id`):** os filmes de uma franquia em ordem de lançamento.
- **Minha lista (`/minha-lista`):** filmes e séries salvos para ver depois, guardados só no navegador, sem cadastro. Cada página de filme, série e pessoa tem um botão de compartilhar.
- **Visual:** superfícies de vidro (transparência, desfoque e brilho de borda) sobre a paleta grafite e dourado, com versão opaca para quem reduz a transparência no sistema.
- **Sobre (`/sobre`) e Privacidade (`/privacidade`):** créditos exigidos pelo TMDB e pelo JustWatch e o que o site coleta.
- **Estados:** esqueletos de carregamento, estados vazios, erros em português com "Tentar novamente", página 404 e tela de erro de rota.
- **Acessibilidade e responsividade:** link para pular ao conteúdo, foco visível, `prefers-reduced-motion`, barra inferior no celular e ausência de rolagem horizontal de 320 a 1440 px.

## Tecnologias

| Área            | Ferramenta                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| Interface       | React 19.3.1, React Router 8.5.1 (data router), react-icons                                                         |
| Linguagem       | TypeScript 6.0.3 em modo `strict`, em todo o código (sem `.js` ou `.jsx` no app) |
| Build           | Vite 8.3.6                                                                                                          |
| Testes          | Vitest 5.1.0, jsdom e Testing Library; Playwright 1.63.0 (E2E, Chromium)                                                                               |
| Qualidade       | ESLint 10 com `typescript-eslint`, React Hooks e `jsx-a11y-x`; Prettier                                             |
| Hospedagem      | Vercel: site estático e uma função serverless (`/api/tmdb`)                                                         |
| Observabilidade | Vercel Web Analytics e Speed Insights, sem cookies                                                                  |
| Dados           | API do TMDB (v3), com disponibilidade de streaming fornecida pelo JustWatch                                         |

## Requisitos

- Node.js 24 ou superior e npm 10 ou superior.
- Uma chave da API do TMDB (chave v3 ou token de leitura v4).

## Configuração local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Crie o arquivo de ambiente a partir do modelo:

   ```bash
   cp .env.example .env
   ```

3. Informe a chave em `TMDB_API_KEY` no `.env`. Ela é lida só pelo servidor local do Vite, que atende `/api/tmdb` em `npm run dev` e `npm run preview`.
4. Inicie o servidor:

   ```bash
   npm run dev
   ```

## Scripts

| Comando                | O que faz                                    |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento com o proxy      |
| `npm run build`        | Build de produção em `dist/`                 |
| `npm run preview`      | Serve o build localmente, com o proxy        |
| `npm run lint`         | ESLint sem avisos tolerados                  |
| `npm run typecheck`    | Verificação de tipos do app e da configuração |
| `npm test`             | Testes unitários e de hooks (Vitest)         |
| `npm run test:watch`   | Testes em modo de observação                 |
| `npm run test:e2e`     | Testes de interface (Playwright)             |
| `npm run test:e2e:ui`  | Testes de interface no modo visual           |
| `npm run format`       | Formata o projeto com o Prettier             |
| `npm run format:check` | Confere a formatação                         |
| `npm run check`        | Lint, tipos, testes e build                  |

O GitHub Actions (`.github/workflows/quality.yml`, Node 24) roda em todo pull request e a cada push na `main`, com dois jobs independentes:

- **`quality`:** instalação limpa, `npm audit` (nível moderado), formatação, lint, tipos, testes unitários e build;
- **`e2e`:** testes de interface com Playwright (ver [Testes de interface](#testes-de-interface-e2e)).

O Dependabot propõe atualizações semanais de npm e GitHub Actions.

## Estrutura

```text
api/tmdb.ts                 função serverless da Vercel (/api/tmdb)
server/
├── tmdbProxy.ts            lista de permissões, chave, tempo limite e cache do proxy
└── viteTmdbProxy.ts        o mesmo proxy em npm run dev e npm run preview
src/
├── main.tsx                rotas (createBrowserRouter) e estilos globais
├── App.tsx                 layout: cabeçalho, conteúdo, rodapé, barra inferior
├── services/tmdb.ts        única porta de saída para a API (chama só /api/tmdb)
├── hooks/                  useAsync, useMovies, useMovie, useGenres,
│                           useWatchProviders, useDocumentTitle
├── lib/                    regras puras: format, images, discover, pagination,
│                           movie, watchProviders, analytics
├── types/tmdb.ts           tipos das respostas do TMDB
├── i18n/                   textos da interface (pt-BR.ts)
├── components/
│   ├── layout/             AppHeader, MobileTabBar, SiteFooter, BrandMark,
│   │                       Observability
│   ├── ui/                 Dialog, Rail, Pagination, Rating, SectionHeader,
│   │                       StateMessage, StatusScreen
│   └── movie/              PosterCard, PosterGrid, MovieRail, RankedList,
│                           FeaturedHero, TrailerDialog, WatchProviders
├── pages/                  Home, Discover, Search, Movie, About, Privacy,
│                           NotFound, RouteError
├── styles/                 tokens, tipografia, base, ui, layout e breakpoints
└── test/                   utilitários dos testes unitários
e2e/                        testes de interface (Playwright)
├── fixtures/               respostas simuladas do TMDB em JSON, tipadas
├── helpers/                mock do /api/tmdb, rede isolada e utilitários
└── tests/                  um arquivo por área (início, busca, filme…)
playwright.config.ts        servidor, tamanhos de tela e relatórios do Playwright
public/                     robots.txt, sitemap.xml e logo do TMDB
docs/                       decisões, roadmap, identidade visual e documentação técnica
```

Os testes unitários ficam ao lado do código (`*.test.ts` e `*.test.tsx`); os de interface ficam em `e2e/`. A arquitetura e os fluxos de dados estão em [docs/MODEL.md](./docs/MODEL.md).

## Testes de interface (E2E)

Os testes de interface usam o [Playwright](https://playwright.dev/) com o Chromium. Eles rodam contra o build de produção servido localmente pelo `vite preview`, nunca contra a Vercel, e não dependem do TMDB: as respostas de `/api/tmdb` vêm de fixtures locais e nenhuma chave é usada.

### Instalação

Depois do `npm ci`, instale o Chromium do Playwright (uma vez por máquina):

```bash
npx playwright install --with-deps chromium
```

### Execução

Todos os testes (o build é feito automaticamente):

```bash
npm run test:e2e
```

Um arquivo, um tamanho de tela ou um teste pelo nome:

```bash
npx playwright test e2e/tests/search.spec.ts
```

```bash
npx playwright test --project=mobile-320
```

```bash
npx playwright test -g "trailer"
```

Relatório da última execução (com trace e captura de tela das falhas):

```bash
npx playwright show-report
```

### Como funciona

- **Tamanhos de tela:** cada teste de interface roda em sete projetos, `mobile-320`, `mobile-375`, `mobile-390`, `mobile-420`, `tablet-768`, `desktop-1024` e `desktop-1440`, com essas larguras em pixels CSS. O projeto `proxy` testa o proxy por HTTP, uma vez.
- **Fixtures (`e2e/fixtures/`):** JSON no formato do TMDB, tipados com `src/types/tmdb.ts`. Se uma fixture sair do modelo, o `npm run typecheck` falha.
- **Mocks (`e2e/helpers/tmdb.ts`):** `page.route` intercepta `/api/tmdb/**` no navegador e responde com a fixture do endpoint. Um teste troca a resposta com `tmdb.on("search/movie", { status: 503 })` ou segura uma resposta para observar o carregamento.
- **Rede isolada (`e2e/helpers/test.ts`):** imagens do TMDB viram um PNG local; o player do YouTube e os scripts da Vercel viram respostas vazias. O teste falha se o app pedir outro domínio externo, um endpoint sem fixture, registrar erro no console ou violar a CSP.
- **Sem chave:** o servidor dos testes roda com `TMDB_API_KEY` vazia, mesmo que exista um `.env`.

No CI, o job `e2e` roda dentro da imagem oficial do Playwright (`mcr.microsoft.com/playwright:v1.63.0-noble`), que já traz o Chromium e as dependências do sistema. Ele confere se a versão do `@playwright/test` é a mesma da imagem, roda `npm run test:e2e` e, só quando algo falha, guarda o relatório e os traces como artefato por 7 dias. Não há novas tentativas automáticas: um teste instável falha.

Ao atualizar o `@playwright/test`, atualize também a tag da imagem e a variável `PLAYWRIGHT_IMAGE_VERSION` em `.github/workflows/quality.yml`.

## Desempenho

- **Fontes servidas pelo próprio site:** sem requisições ao Google Fonts (`src/assets/fonts`, licenças OFL junto aos arquivos).
- **Imagens responsivas:** `srcset` e `sizes` medidos para pôsteres e imagens de fundo.
- **Dados:** a página de filme faz uma única requisição; respostas bem-sucedidas ficam em cache no navegador por 5 minutos; cada rota pré-carrega seus dados enquanto o código da página é baixado.
- **Divisão por rota:** as páginas além do Início são carregadas sob demanda.

Detalhes e medições em [docs/MODEL.md](./docs/MODEL.md) e [docs/DECISIONS.md](./docs/DECISIONS.md) (D-40 e D-41).

## Integração com o TMDB

O navegador nunca recebe a chave. Todas as consultas vão para `/api/tmdb/<endpoint>`; o `vercel.json` encaminha esse caminho para a função `api/tmdb.ts`, que:

- aceita só `GET` e uma lista fechada de endpoints e parâmetros;
- descarta qualquer `api_key` enviada pelo cliente e acrescenta `TMDB_API_KEY` no servidor;
- desiste após 8 segundos;
- guarda respostas de sucesso no cache da Vercel (gêneros 24 h, listas 1 h, detalhes 6 h, busca 10 min) e nunca guarda erros.

Todas as respostas levam cabeçalhos de segurança definidos no `vercel.json`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` e uma Content-Security-Policy em modo de bloqueio. O `vite preview` usa os mesmos valores, e os testes E2E falham se a página violar a política. Para liberar um domínio novo (imagens, scripts, iframes), atualize a CSP no `vercel.json`; os testes acusam o que faltar.

Não use o prefixo `VITE_` para segredos: variáveis com esse prefixo entram no código enviado ao navegador. Não envie o `.env` ao Git.

## Implantação

1. Na Vercel, em **Settings → Environment Variables**, cadastre `TMDB_API_KEY` como **Secret** em **Production** e **Preview**.
2. Faça um novo deploy para que a função passe a usar a chave.
3. Ative **Web Analytics** e **Speed Insights** no painel do projeto para que as visitas sejam registradas.

O `vercel.json` também envia as demais rotas (exceto `/api/`) para `index.html`, o que permite abrir diretamente endereços como `/movie/550` ou `/discover?genre=18`.

## Documentação

- [Documentação técnica](./docs/MODEL.md)
- [Decisões técnicas](./docs/DECISIONS.md)
- [Roadmap](./docs/ROADMAP.md)
- [Identidade visual do Cinelux](./docs/Cinelux_Identidade_Visual.md)
- [Como contribuir](./docs/CONTRIBUTING.md)

## Créditos

Dados e imagens fornecidos pelo [TMDB](https://www.themoviedb.org/). Este produto usa o TMDB e as APIs do TMDB, mas não é endossado, certificado nem aprovado pelo TMDB. Disponibilidade de streaming fornecida pelo [JustWatch](https://www.justwatch.com/).

## Licença

[MIT](./LICENSE).
