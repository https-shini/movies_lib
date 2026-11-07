# MoviesLib

Aplicação web para descobrir e pesquisar filmes, consultar informações e explorar títulos usando a API do [The Movie Database (TMDB)](https://www.themoviedb.org/).

**Aplicação publicada:** https://movieslib-krd.vercel.app

## Visão geral

O MoviesLib começou como um projeto de exploração de filmes com React e TMDB. A modernização está sendo feita incrementalmente, preservando as funcionalidades existentes e preparando a aplicação para evoluir para uma plataforma de catálogo, descoberta e acompanhamento de filmes.

## Funcionalidades atuais

- Página inicial com seções de filmes em alta, mais bem avaliados e em cartaz.
- Pesquisa de filmes por título.
- Descoberta de filmes com filtros por gênero, ano, nota mínima e ordenação.
- Paginação dos resultados do catálogo.
- Página de detalhes com sinopse, orçamento, bilheteria, duração, elenco, trailer e recomendações.
- Disponibilidade de streaming, aluguel e compra no Brasil, agrupada por modalidade.
- Estados de carregamento, erro e resultados vazios.
- Navegação com React Router e página 404.
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

4. Edite o arquivo `.env` e informe sua chave do TMDB em `VITE_API_KEY`.
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

## Estrutura atual

```text
src/
├── components/
│   ├── AsyncState.jsx
│   ├── MovieCard.jsx
│   ├── MovieSection.jsx
│   ├── WatchProviders.jsx
│   └── Navbar.jsx
├── hooks/
│   └── useAsyncData.js
├── pages/
│   ├── Home.jsx
│   ├── Home.css
│   ├── Movie.jsx
│   ├── Movie.css
│   ├── Discover.jsx
│   ├── Discover.css
│   ├── MoviesGrid.css
│   ├── NotFound.jsx
│   └── Search.jsx
├── services/
│   ├── discover.js
│   ├── tmdb.js
│   ├── tmdbUrl.js
│   └── watchProviders.js
├── utils/
│   └── formatters.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx

tests/
├── discover.test.js
├── formatters.test.js
├── tmdbUrl.test.js
└── watchProviders.test.js
```

## Prévia do projeto original

As imagens abaixo registram a versão anterior do MoviesLib e serão atualizadas conforme a reformulação visual avançar.

<div align="center">
  <img src="./docs/screenshots/001.png" width="400" alt="Tela inicial da versão original do MoviesLib" />
  <img src="./docs/screenshots/002.png" width="400" alt="Tela de pesquisa da versão original do MoviesLib" />
  <img src="./docs/screenshots/003.png" width="400" alt="Tela de detalhes da versão original do MoviesLib" />
  <img src="./docs/screenshots/004.png" width="400" alt="Outra tela da versão original do MoviesLib" />
</div>

## Segurança

Variáveis com prefixo `VITE_` são incorporadas ao código enviado ao navegador. Portanto, `VITE_API_KEY` não é uma credencial secreta. Para proteger a integração em uma implantação pública, a próxima evolução arquitetural deverá introduzir uma API backend ou função serverless que intermedeie as requisições ao TMDB e mantenha credenciais no servidor.

Não envie seu arquivo `.env` ao Git.

## Documentação e contribuição

- [Documentação técnica](./read-model/MODEL.md)
- [Como contribuir](./read-model/CONTRIBUTING.md)

## Roadmap

- Atualizar a cadeia de ferramentas e dependências.
- Ampliar a análise estática e a cobertura de testes.
- Implementar descoberta avançada, filtros, gêneros e paginação.
- Integrar disponibilidade regional de streaming, aluguel e compra.
- Evoluir para backend, persistência e autenticação.
- Adicionar perfis, avaliações, comentários, listas e recursos sociais.

## Créditos

Dados e imagens de filmes fornecidos pelo [TMDB](https://www.themoviedb.org/). Este projeto não é endossado nem certificado pelo TMDB.

## Licença

Este projeto está sob a [licença MIT](./LICENSE).
