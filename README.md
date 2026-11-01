# MoviesLib

Aplicação web para descobrir e pesquisar filmes, consultar informações e explorar títulos usando a API do [The Movie Database (TMDB)](https://www.themoviedb.org/).

## Tecnologias

- React 18
- Vite
- React Router
- JavaScript (ES Modules)
- CSS responsivo
- TMDB API

## Funcionalidades atuais

- Catálogo inicial de filmes mais bem avaliados.
- Pesquisa de filmes por título.
- Página de detalhes com sinopse, orçamento, receita, duração e avaliação.
- Estados de carregamento, erro e resultados vazios.
- Interface responsiva para desktop e dispositivos móveis.

## Requisitos e configuração

- Node.js LTS, npm e uma chave de API do TMDB.
- Configure as variáveis de ambiente em um arquivo `.env` na raiz do projeto:

```env
VITE_API=https://api.themoviedb.org/3/movie/
VITE_SEARCH=https://api.themoviedb.org/3/search/movie
VITE_IMG=https://image.tmdb.org/t/p/w500
VITE_API_KEY=api_key=YOUR_TMDB_API_KEY
```

Instale e execute:

```bash
npm install
npm run dev
```

Build de produção e pré-visualização:

```bash
npm run build
npm run preview
```

## Estrutura atual

```text
src/
├── components/
│   ├── AsyncState.jsx
│   ├── MovieCard.jsx
│   └── Navbar.jsx
├── hooks/
│   └── useAsyncData.js
├── pages/
│   ├── Home.jsx
│   ├── Movie.jsx
│   └── Search.jsx
├── services/
│   └── tmdb.js
├── App.jsx
├── App.css
└── index.css
```

## Segurança da chave da API

Variáveis com prefixo `VITE_` são incorporadas ao código enviado ao navegador. Portanto, `VITE_API_KEY` não é uma credencial secreta. Para uma implantação pública com proteção adequada, a evolução arquitetural deve introduzir uma API backend ou função serverless que intermedeie as requisições ao TMDB e mantenha credenciais no servidor.

Não envie seu arquivo `.env` ao Git.

## Próximas etapas planejadas

- Migrar gradualmente para TypeScript e uma arquitetura modular.
- Adicionar testes automatizados e integração contínua.
- Implementar filtros, gêneros, paginação e descoberta avançada.
- Criar backend, persistência e autenticação.
- Adicionar perfis, avaliações, listas e recursos sociais.

## Créditos

Dados e imagens de filmes fornecidos pelo [TMDB](https://www.themoviedb.org/). Este projeto não é endossado nem certificado pelo TMDB.

## Licença

Consulte o arquivo [LICENSE](./LICENSE).
