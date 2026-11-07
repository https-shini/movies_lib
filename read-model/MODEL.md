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
React + React Router 7 (data router)
   |
   +--> Layout (App), ScrollRestoration e tela de erro de rota
   +--> Páginas e componentes
   +--> Hooks de estado assíncrono
   +--> Serviços de integração TMDB
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
src/
├── components/   AsyncState, MovieCard, MovieSection, Navbar, Pagination, WatchProviders
├── hooks/        useAsyncData, useDocumentTitle
├── pages/        Home, Discover, Search, Movie, NotFound, RouteError
├── services/     tmdb, tmdbUrl, tmdbErrors, discover, search, pagination, movieDetails, watchProviders
├── utils/        formatters
├── App.jsx       layout com navegação, rodapé e ScrollRestoration
└── main.jsx      definição das rotas (createBrowserRouter)

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

A comunicação geral é centralizada em `src/services/tmdb.js`. A montagem da URL fica isolada em `src/services/tmdbUrl.js`, permitindo testar parâmetros, autenticação e codificação sem acessar a rede.

A disponibilidade por filme é consultada por `src/services/watchProviders.js`, usando o endpoint `/movie/{id}/watch/providers`. A resposta é normalizada por região e separada nas modalidades de assinatura, gratuito, com anúncios, aluguel e compra. A interface atual apresenta a região brasileira (BR), ordena provedores pela prioridade retornada pelo TMDB e oferece o link de consulta da própria fonte quando disponível.

Somente `VITE_API_KEY` é obrigatória. As demais variáveis são opcionais e, quando ausentes, usam os endereços públicos do TMDB definidos em `src/services/tmdb.js`.

Erros HTTP e de rede são convertidos em mensagens em português por `src/services/tmdbErrors.js` (401, 404, 422, 429, 5xx e falhas de conexão). Requisições canceladas (`AbortError`) são propagadas sem alteração.

Variáveis utilizadas:

| Variável | Responsabilidade |
|---|---|
| `VITE_API` | URL base dos endpoints de filmes |
| `VITE_SEARCH` | Endpoint de pesquisa |
| `VITE_DISCOVER` | Endpoint de descoberta e filtros |
| `VITE_GENRES` | Endpoint de gêneros |
| `VITE_IMG` | URL base para pôsteres e perfis |
| `VITE_BACKDROP` | URL base para imagens de fundo |
| `VITE_API_KEY` | Chave de acesso à API (obrigatória) |

A integração de provedores usa a mesma chave e base de API já configuradas, portanto não exige uma nova variável de ambiente.

### Limitação de segurança conhecida

Variáveis com prefixo `VITE_` são incorporadas ao bundle do frontend e podem ser visualizadas por qualquer pessoa que acesse a aplicação. A chave atual do TMDB não deve ser considerada secreta.

Antes de adicionar autenticação de usuários ou dados privados, a arquitetura deverá introduzir um backend ou função serverless para intermediar chamadas externas e proteger credenciais. A chave eventualmente exposta também deverá ser rotacionada se houver suspeita de uso indevido.

## 5. Descoberta, detalhes e disponibilidade de filmes

A página inicial agrega seções de filmes populares, mais bem avaliados e em cartaz. A página de descoberta consulta o endpoint de descoberta do TMDB e permite filtrar por gênero, ano de lançamento e nota mínima, além de ordenar e paginar resultados. A URL é a fonte dos filtros aplicados; o formulário mantém um rascunho próprio e só dispara a consulta ao ser enviado. Valores da URL são validados (ordenações permitidas, ano entre 1900 e 2100, nota entre 0 e 10, página entre 1 e 500, limite aceito pelo TMDB).

Para evitar resultados pouco representativos, a ordenação por nota exige ao menos 200 votos e o filtro de nota mínima exige ao menos 50 votos. A ordenação por lançamentos recentes considera apenas filmes com data de lançamento até o dia atual.

A página de detalhes solicita informações complementares de elenco, vídeos, recomendações e filmes semelhantes. Exibe pôster, imagem de fundo, título original, sinopse, avaliação, dados financeiros, elenco principal e link para trailer quando disponível. Os vídeos são solicitados em português, inglês e sem idioma (`include_video_language`), priorizando trailers oficiais em português. Quando não há recomendações, são exibidos filmes semelhantes.

O componente `WatchProviders` consulta a disponibilidade do filme para o Brasil e apresenta provedores agrupados por modalidade: assinatura, gratuito, com anúncios, aluguel e compra. Quando a região não possui dados, a interface informa que nenhuma opção foi retornada, sem inferir que o filme não esteja disponível em todos os serviços. Preços e condições não são estimados; o usuário é direcionado à fonte para confirmar os detalhes.

## 6. Estados assíncronos

O hook `useAsyncData` padroniza carregamento, resultado, erro e cancelamento da requisição anterior quando as dependências mudam.

O componente `AsyncState` apresenta estados de carregamento, erro e ausência de resultados.

O hook `useDocumentTitle` atualiza o título da aba conforme a página e o filme exibido.

## 7. Testes e qualidade

Os testes utilizam Vitest e cobrem atualmente:

- montagem de URLs do TMDB;
- resolução de endpoints relativos e absolutos;
- inclusão e preservação da chave de API;
- codificação de parâmetros de pesquisa;
- conversão e validação de filtros de descoberta, incluindo leitura e escrita na URL;
- parâmetros de busca e normalização de paginação;
- requisições ao TMDB com valores padrão, mensagens de erro em português e cancelamento;
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

- A integração com TMDB ainda ocorre diretamente pelo navegador.
- A chave do TMDB é pública quando utilizada em uma variável `VITE_`.
- Não existe backend próprio.
- A disponibilidade de provedores está atualmente apresentada para a região brasileira.
- A API do TMDB pode não retornar provedores para todos os filmes ou regiões.
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
7. Ampliar a disponibilidade regional e evoluir recomendações.

A escolha definitiva de framework backend, ORM, banco, hospedagem e provedores de autenticação deverá ser documentada antes da implementação dessa camada.

## 10. Referências

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do React Router](https://reactrouter.com/)
- [Documentação da API do TMDB](https://developer.themoviedb.org/docs)
