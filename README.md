# Cinelux

Acervo de cinema para encontrar um filme, entender do que se trata e decidir se vale assistir. Os dados e as imagens vêm da API do [The Movie Database (TMDB)](https://www.themoviedb.org/).

**Aplicação publicada:** https://movies-lib-vite.vercel.app

O projeto nasceu como MoviesLib e está sendo refeito como Cinelux em fases e blocos registrados em [docs/DECISIONS.md](./docs/DECISIONS.md). O repositório e o projeto na Vercel ainda usam o nome antigo (`movies_lib` e `movies-lib`).

## Funcionalidades

- **Início:** destaque do filme mais popular, faixa "Em alta", ranking dos 10 mais bem avaliados, "Nos cinemas" e índice de gêneros.
- **Descobrir (`/discover`):** gêneros e ordenação com um toque, ano e nota mínima num painel de filtros, filtros ativos como chips removíveis, tudo registrado na URL, com paginação.
- **Buscar (`/search?q=`):** busca por título em português, com paginação e sugestões quando não há termo.
- **Filme (`/movie/:id`):** sinopse, nota, gêneros clicáveis, ficha técnica, trailer na própria página (YouTube em modo de privacidade aprimorada), elenco, recomendações e onde assistir no Brasil (dados do JustWatch).
- **Sobre (`/sobre`) e Privacidade (`/privacidade`):** créditos exigidos pelo TMDB e pelo JustWatch e o que o site coleta.
- **Estados:** esqueletos de carregamento, estados vazios, erros em português com "Tentar novamente", página 404 e tela de erro de rota.
- **Acessibilidade e responsividade:** link para pular ao conteúdo, foco visível, `prefers-reduced-motion`, barra inferior no celular e ausência de rolagem horizontal de 320 a 1440 px.

## Tecnologias

| Área            | Ferramenta                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| Interface       | React 19.3.1, React Router 8.5.1 (data router), react-icons                                                         |
| Linguagem       | TypeScript 6.0.3 em modo `strict`; os componentes visuais ainda são `.jsx` e migram nas próximas fases (`allowJs`) |
| Build           | Vite 8.3.6                                                                                                          |
| Testes          | Vitest 5.1.0, jsdom e Testing Library                                                                               |
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
| `npm run format`       | Formata o projeto com o Prettier             |
| `npm run format:check` | Confere a formatação                         |
| `npm run check`        | Lint, tipos, testes e build                  |

O GitHub Actions (`.github/workflows/quality.yml`, Node 24) roda em todo pull request e a cada push na `main`: instalação limpa, `npm audit` (nível moderado), formatação, lint, tipos, testes e build. O Dependabot propõe atualizações semanais de npm e GitHub Actions.

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
├── styles/                 tokens, base, ui e layout
└── test/                   utilitários dos testes
public/                     robots.txt, sitemap.xml e logo do TMDB
docs/                       decisões, roadmap, identidade visual e documentação técnica
```

Os testes ficam ao lado do código (`*.test.ts` e `*.test.tsx`). A arquitetura e os fluxos de dados estão em [docs/MODEL.md](./docs/MODEL.md).

## Integração com o TMDB

O navegador nunca recebe a chave. Todas as consultas vão para `/api/tmdb/<endpoint>`; o `vercel.json` encaminha esse caminho para a função `api/tmdb.ts`, que:

- aceita só `GET` e uma lista fechada de endpoints e parâmetros;
- descarta qualquer `api_key` enviada pelo cliente e acrescenta `TMDB_API_KEY` no servidor;
- desiste após 8 segundos;
- guarda respostas de sucesso no cache da Vercel (gêneros 24 h, listas 1 h, detalhes 6 h, busca 10 min) e nunca guarda erros.

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
