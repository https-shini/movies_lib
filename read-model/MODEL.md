# Documentação técnica do MoviesLib

## 1. Visão geral

O MoviesLib é uma aplicação web de descoberta e consulta de filmes. A implementação atual utiliza React, Vite, React Router e a API pública do The Movie Database (TMDB).

A modernização é incremental. Esta documentação diferencia o que já existe do que está planejado para evitar descrever componentes futuros como se já estivessem implementados.

## 2. Arquitetura atualmente implementada

A aplicação atual é um frontend React que consome diretamente a API do TMDB pelo navegador. **Ainda não há backend próprio, banco de dados ou autenticação implementados nesta versão.**

```text
Navegador
   |
   v
React + React Router 7
   |
   +--> Páginas e componentes
   +--> Hooks de estado assíncrono
   +--> Serviço de integração TMDB
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
- TMDB API: catálogo e dados de filmes.

## 3. Organização do código

```text
src/
├── components/
├── hooks/
├── pages/
├── services/
├── utils/
├── App.jsx
├── App.css
├── index.css
└── main.jsx

tests/
├── formatters.test.js
└── tmdbUrl.test.js
```

### Responsabilidades

- `components/`: componentes reutilizáveis da interface, incluindo seções de catálogo.
- `hooks/`: hooks React que encapsulam comportamento compartilhado.
- `pages/`: componentes associados às rotas.
- `services/`: comunicação com serviços externos e montagem de requisições.
- `utils/`: funções puras reutilizáveis, sem dependência da interface.
- `tests/`: testes automatizados das funções utilitárias e regras isoladas.

## 4. Integração com TMDB

A comunicação é centralizada em `src/services/tmdb.js`. A montagem da URL fica isolada em `src/services/tmdbUrl.js`, permitindo testar parâmetros, autenticação e codificação sem acessar a rede.

Variáveis utilizadas:

| Variável | Responsabilidade |
|---|---|
| `VITE_API` | URL base dos endpoints de filmes |
| `VITE_SEARCH` | Endpoint de pesquisa |
| `VITE_DISCOVER` | Endpoint de descoberta e filtros |
| `VITE_GENRES` | Endpoint de gêneros |
| `VITE_IMG` | URL base para pôsteres e perfis |
| `VITE_BACKDROP` | URL base para imagens de fundo |
| `VITE_API_KEY` | Chave de acesso à API |

### Limitação de segurança conhecida

Variáveis com prefixo `VITE_` são incorporadas ao bundle do frontend e podem ser visualizadas por qualquer pessoa que acesse a aplicação. A chave atual do TMDB não deve ser considerada secreta.

Antes de adicionar autenticação de usuários ou dados privados, a arquitetura deverá introduzir um backend ou função serverless para intermediar chamadas externas e proteger credenciais. A chave eventualmente exposta também deverá ser rotacionada se houver suspeita de uso indevido.

## 5. Descoberta e detalhes de filmes

A página inicial agrega seções de filmes populares, mais bem avaliados e em cartaz. A página de descoberta consulta o endpoint de descoberta do TMDB e permite filtrar por gênero, ano de lançamento e nota mínima, além de ordenar e paginar resultados. Os filtros são refletidos na URL para permitir compartilhamento e navegação pelo histórico.

A página de detalhes solicita informações complementares de elenco, vídeos, recomendações e filmes semelhantes. Exibe pôster, imagem de fundo, sinopse, avaliação, dados financeiros, elenco principal e link para trailer quando disponível.

## 6. Estados assíncronos

O hook `useAsyncData` padroniza carregamento, resultado, erro e cancelamento da requisição anterior quando as dependências mudam.

O componente `AsyncState` apresenta estados de carregamento, erro e ausência de resultados.

## 7. Testes e qualidade

Os testes utilizam Vitest e cobrem atualmente:
- montagem de URLs do TMDB;
- resolução de endpoints relativos e absolutos;
- inclusão e preservação da chave de API;
- codificação de parâmetros de pesquisa;
- conversão de filtros de descoberta para parâmetros do TMDB;
- formatação de moeda, duração, notas e datas;
- seleção de trailers oficiais do YouTube;
- tratamento de dados ausentes ou inválidos.

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

- A integração com TMDB ainda ocorre diretamente pelo navegador.
- A chave do TMDB é pública quando utilizada em uma variável `VITE_`.
- Não existe backend próprio.
- A descoberta avançada oferece filtros por gênero, ano, nota mínima, ordenação e paginação.
- Não existe persistência de usuários, avaliações ou listas.
- Não existe autenticação.
- A cobertura de testes ainda é inicial e focada em funções isoladas.
- A análise estática está configurada com ESLint. O relatório de auditoria atual não identifica vulnerabilidades conhecidas nas dependências.

## 9. Evolução arquitetural planejada

1. Ampliar testes de componentes e fluxos de interface.
2. Evoluir a organização do frontend para módulos por domínio.
3. Criar backend com API própria e validação de entrada.
4. Introduzir PostgreSQL e camada de persistência.
5. Adicionar autenticação, perfis e preferências.
6. Implementar avaliações, comentários e listas pessoais.
7. Adicionar descoberta avançada, recomendações e disponibilidade em streaming.

A escolha definitiva de framework backend, ORM, banco, hospedagem e provedores de autenticação deverá ser documentada antes da implementação dessa camada.

## 10. Referências

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do React Router](https://reactrouter.com/)
- [Documentação da API do TMDB](https://developer.themoviedb.org/docs)
