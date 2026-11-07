# MoviesLib

Aplicação web para descobrir e pesquisar filmes, consultar informações e explorar títulos usando a API do [The Movie Database (TMDB)](https://www.themoviedb.org/).

**Aplicação publicada:** https://movieslib-krd.vercel.app

## Visão geral

O MoviesLib começou como um projeto de exploração de filmes com React e TMDB. A modernização está sendo feita incrementalmente, preservando as funcionalidades existentes e preparando a aplicação para evoluir para uma plataforma de catálogo, descoberta e acompanhamento de filmes.

## Funcionalidades atuais

- Página inicial com destaque do filme mais popular, faixa "Em alta", ranking dos 10 mais bem avaliados, filmes em cartaz e índice de gêneros.
- Pesquisa de filmes por título, com resultados em português e paginação.
- Descoberta de filmes com gêneros e ordenação aplicados com um toque, além de ano e nota mínima em um painel de filtros aplicado ao confirmar. Os filtros ativos aparecem como chips removíveis e ficam registrados na URL.
- Paginação dos resultados do catálogo e da busca.
- Página de detalhes com título original, gêneros clicáveis, nota, sinopse, ficha técnica (direção, roteiro, lançamento, duração, idioma, orçamento e bilheteria), trailer reproduzido na própria página (priorizando versões oficiais em português), elenco e recomendações.
- Disponibilidade de streaming, aluguel e compra no Brasil, agrupada por modalidade.
- Esqueletos de carregamento no formato de cada conteúdo, estados vazios com sugestões e erros em português com botão "Tentar novamente".
- Navegação com React Router (modo data router), restauração de rolagem, título da aba por página, página 404 e tela de erro para falhas inesperadas.
- Acessibilidade: link para pular ao conteúdo, foco visível, rótulos descritivos e suporte a `prefers-reduced-motion`.
- Interface responsiva para desktop e dispositivos móveis.

## Tecnologias

- React 18
- Vite 8
- Vitest 5
- ESLint 10 com regras para React Hooks
- React Router 7
- JavaScript (ES Modules)
- CSS
- TMDB API

## Requisitos

- Node.js 24 ou superior.
- npm 10 ou superior.
- Chave de API do TMDB.

## Configuração local

1. Clone o repositório.
2. Instale as dependências:

   ```bash
   npm ci
   ```

3. Crie seu arquivo de ambiente a partir do modelo:

   ```bash
   cp .env.example .env
   ```

   No Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Edite o arquivo `.env` e informe sua chave do TMDB em `TMDB_API_KEY` (chave da API v3 ou token de leitura v4). Ela é usada apenas pelo servidor local do Vite, que atende `/api/tmdb` em `npm run dev` e `npm run preview`.
5. Inicie o servidor local:

   ```bash
   npm run dev
   ```

## Verificações

Execute a análise estática do código:

```bash
npm run lint
```

Verifique vulnerabilidades conhecidas nas dependências:

```bash
npm audit
```

Execute os testes unitários:

```bash
npm test
```

Execute os testes em modo de observação:

```bash
npm run test:watch
```

Execute a verificação completa, incluindo lint, testes e build:

```bash
npm run check
```

Para gerar e visualizar a versão de produção:

```bash
npm run build
npm run preview
```

O GitHub Actions executa instalação limpa, auditoria de dependências, ESLint, testes unitários e build nos pushes e pull requests.

## Implantação

Na Vercel, a pasta `api/` é publicada como função serverless (`/api/tmdb`) e o restante como site estático.

1. Em **Settings → Environment Variables**, cadastre `TMDB_API_KEY` com o tipo **Secret**, nos ambientes **Production** e **Preview**.
2. Faça um novo deploy para que a função passe a usar a chave.

O arquivo `vercel.json` redireciona as demais rotas para `index.html`, permitindo abrir diretamente endereços como `/movie/550` ou `/discover?genre=18`. As respostas do proxy são armazenadas em cache na CDN da Vercel (`s-maxage`), reduzindo chamadas ao TMDB.

## Estrutura atual

```text
api/
└── tmdb.js                    # função serverless da Vercel (/api/tmdb)

server/
├── tmdbProxy.js               # validação, chave e cache do proxy do TMDB
└── viteTmdbProxy.js           # /api/tmdb no servidor local do Vite

src/
├── config/brand.js            # nome, slogan e descrição do produto
├── styles/
│   ├── tokens.css             # cores, tipografia, espaçamento, movimento
│   ├── base.css               # reset e estilos globais
│   ├── ui.css                 # botões, chips, campos, seções, esqueletos
│   └── layout.css             # estrutura do app e cabeçalhos de página
├── components/
│   ├── layout/                # AppHeader, MobileTabBar, SiteFooter, BrandMark
│   ├── ui/                    # Dialog, Rail, Pagination, Rating, SectionHeader,
│   │                          # StateMessage, StatusScreen
│   └── movie/                 # PosterCard, PosterGrid, MovieRail, RankedList,
│                              # FeaturedHero, TrailerDialog, WatchProviders
├── hooks/                     # useAsyncData, useDocumentTitle
├── pages/                     # Home, Discover, Search, Movie, NotFound, RouteError
├── services/                  # TMDB, filtros, busca, paginação, detalhes, provedores
├── utils/formatters.js
├── App.jsx
└── main.jsx

tests/                         # testes unitários (Vitest)
```

Cada componente e página importa o próprio arquivo `.css`, ao lado do `.jsx`.

Os arquivos `.css` ficam ao lado do componente ou da página que estilizam.

## Prévia do projeto original

As imagens abaixo registram a versão anterior do MoviesLib e serão atualizadas conforme a reformulação visual avançar.

<div align="center">
  <img src="./docs/screenshots/001.png" width="400" alt="Tela inicial da versão original do MoviesLib" />
  <img src="./docs/screenshots/002.png" width="400" alt="Tela de pesquisa da versão original do MoviesLib" />
  <img src="./docs/screenshots/003.png" width="400" alt="Tela de detalhes da versão original do MoviesLib" />
  <img src="./docs/screenshots/004.png" width="400" alt="Outra tela da versão original do MoviesLib" />
</div>

## Identidade visual

A interface segue a direção **Sala Escura**, inspirada nos programas impressos de cinematecas:

- **Cores:** fundo em tinta quente (`--ink-*`), texto em marfim (`--paper-*`) e um único acento vermelho (`--accent`), a luz da cabine de projeção. As combinações de texto atendem ao contraste WCAG AA.
- **Tipografia:** Fraunces (títulos e numerais), Instrument Sans (interface) e IBM Plex Mono (dados técnicos: ano, duração, notas, contadores).
- **Forma:** pôsteres com cantos quase retos, linhas finas no lugar de caixas pesadas e seções numeradas (01, 02…).
- **Movimento:** transições curtas e funcionais; tudo respeita `prefers-reduced-motion`.

Todos os valores ficam em `src/styles/tokens.css`. Para renomear o produto, altere `src/config/brand.js` e o `<title>`/`<meta>` de `index.html`.

### Experiência no celular

- Barra de navegação inferior (Início, Descobrir, Buscar), ao alcance do polegar.
- Faixas horizontais com rolagem por toque e encaixe (scroll snap).
- Filtros avançados e trailer em painéis inferiores (`<dialog>` nativo, com foco preso e Esc).
- Botões, links e campos com 44px de altura (chips com pelo menos 36px) e ausência de rolagem horizontal, verificados de 320px a 1440px.

## Segurança

O navegador nunca recebe a chave do TMDB. Todas as consultas passam pelo proxy `/api/tmdb` (`server/tmdbProxy.js`), que:

- lê `TMDB_API_KEY` apenas no servidor;
- aceita somente `GET` e os endpoints usados pela aplicação (lista de permissões);
- descarta parâmetros desconhecidos, inclusive tentativas de enviar outra `api_key`;
- define cache na CDN para respostas bem-sucedidas.

Não use o prefixo `VITE_` para segredos: variáveis com esse prefixo são incorporadas ao código enviado ao navegador.

Não envie seu arquivo `.env` ao Git.

## Documentação e contribuição

- [Documentação técnica](./read-model/MODEL.md)
- [Roadmap de evolução](./read-model/ROADMAP.md)
- [Como contribuir](./read-model/CONTRIBUTING.md)

## Roadmap

O plano de evolução completo está em [read-model/ROADMAP.md](./read-model/ROADMAP.md): diagnóstico, recursos da API do TMDB, 25 iniciativas priorizadas com status e o plano por fases.

| Fase | Foco |
|---|---|
| 0 — Conformidade | Crédito ao JustWatch, página "Sobre" com o logo do TMDB, licença comercial e política sem IA |
| 1 — Eficiência e dados | Imagens no tamanho certo, página do filme em 1 requisição, classificação indicativa, lançamentos do Brasil, cache e proxy mais resistente |
| 2 — Catálogo | Páginas de pessoas, busca de pessoas, filtro por streaming, mais filtros e coleções |
| 3 — Plataforma social | Autenticação, banco de dados, diário, notas, listas, recomendações por regras e prévia ao compartilhar |
| 4 — Expansão | Séries de TV, escolha de região, palavras-chave e galeria |

## Créditos

Dados e imagens de filmes fornecidos pelo [TMDB](https://www.themoviedb.org/). Este projeto não é endossado nem certificado pelo TMDB.

## Licença

Este projeto está sob a [licença MIT](./LICENSE).
