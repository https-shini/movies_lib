# Documentação técnica do MoviesLib

## 1. Visão geral

O MoviesLib é uma aplicação web de descoberta e consulta de filmes. A implementação atual utiliza React, Vite, React Router e a API pública do The Movie Database (TMDB).

O projeto está em processo de modernização incremental. Esta documentação diferencia o que já existe do que está planejado para evitar descrever componentes futuros como se já estivessem implementados.

## 2. Arquitetura atualmente implementada

A aplicação atual é um frontend React que consome diretamente a API do TMDB pelo navegador. **Ainda não há um backend próprio, banco de dados ou autenticação implementados nesta versão.**

Fluxo simplificado:

```text
Navegador
   |
   v
React + React Router
   |
   +--> Páginas e componentes
   |
   +--> Hooks de estado assíncrono
   |
   +--> Serviço de integração TMDB
              |
              v
        API do TMDB
```

### Tecnologias

- React 18: composição da interface.
- Vite: servidor de desenvolvimento e build.
- React Router: navegação entre páginas.
- JavaScript ES Modules: implementação da aplicação.
- CSS: estilos e responsividade.
- TMDB API: catálogo e dados de filmes.
- Node.js Test Runner: testes unitários das funções JavaScript independentes.

## 3. Organização do código

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
│   ├── MoviesGrid.css
│   ├── NotFound.jsx
│   └── Search.jsx
├── services/
│   ├── tmdb.js
│   └── tmdbUrl.js
├── utils/
│   └── formatters.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx

tests/
├── formatters.test.js
└── tmdbUrl.test.js
```

### Responsabilidades

- `components/`: componentes reutilizáveis da interface.
- `hooks/`: hooks React que encapsulam comportamento compartilhado.
- `pages/`: componentes associados às rotas.
- `services/`: comunicação com serviços externos e montagem de requisições.
- `utils/`: funções puras reutilizáveis, sem dependência da interface.
- `tests/`: testes automatizados das funções utilitárias e regras isoladas.

## 4. Integração com TMDB

A comunicação é centralizada em `src/services/tmdb.js`. A montagem da URL fica isolada em `src/services/tmdbUrl.js`, permitindo testar parâmetros, autenticação e codificação sem acessar a rede.

A aplicação utiliza as variáveis de ambiente:

| Variável | Responsabilidade |
|---|---|
| `VITE_API` | URL base dos endpoints de filmes |
| `VITE_SEARCH` | Endpoint de pesquisa |
| `VITE_IMG` | URL base para imagens |
| `VITE_API_KEY` | Chave de acesso à API |

### Limitação de segurança conhecida

Variáveis com prefixo `VITE_` são incorporadas ao bundle do frontend e podem ser visualizadas por qualquer pessoa que acesse a aplicação. A chave atual do TMDB não deve ser considerada secreta.

Antes de adicionar autenticação de usuários ou dados privados, a arquitetura deverá introduzir um backend ou função serverless para intermediar chamadas externas e proteger credenciais. A chave eventualmente exposta também deverá ser rotacionada se houver suspeita de uso indevido.

## 5. Estados assíncronos

O hook `useAsyncData` padroniza:

- carregamento;
- resultado;
- erro;
- cancelamento da requisição anterior quando as dependências mudam.

O componente `AsyncState` apresenta estados de carregamento, erro e ausência de resultados.

## 6. Testes e qualidade

Os testes atuais utilizam o executor nativo `node:test`, sem adicionar dependências ao projeto.

Comandos:

```bash
npm test
npm run test:watch
npm run build
npm run check
```

O GitHub Actions executa instalação limpa, testes e build em cada atualização da branch e pull request para a branch principal.

## 7. Limitações atuais

- A integração com TMDB ainda ocorre diretamente pelo navegador.
- A chave do TMDB é pública quando utilizada em uma variável `VITE_`.
- Não existe backend próprio.
- Não existe persistência de usuários, avaliações ou listas.
- Não existe autenticação.
- A cobertura de testes ainda é inicial e focada em funções puras.
- A cadeia de ferramentas e dependências ainda precisa ser atualizada para versões suportadas.

## 8. Evolução arquitetural planejada

A arquitetura deverá evoluir por etapas, sem introduzir complexidade antes de existir necessidade funcional:

1. Atualizar dependências, padronizar lint e ampliar testes.
2. Evoluir a organização do frontend para módulos por domínio.
3. Criar backend com API própria e validação de entrada.
4. Introduzir PostgreSQL e camada de persistência.
5. Adicionar autenticação, perfis e preferências.
6. Implementar avaliações, comentários e listas pessoais.
7. Adicionar descoberta avançada, recomendações e disponibilidade em streaming.

A escolha definitiva de framework backend, ORM, banco, hospedagem e provedores de autenticação deverá ser documentada antes da implementação dessa camada.

## 9. Referências

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Documentação do React Router](https://reactrouter.com/)
- [Documentação da API do TMDB](https://developer.themoviedb.org/docs)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
