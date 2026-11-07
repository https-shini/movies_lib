# Decisões técnicas do Cinelux

Registro das decisões tomadas durante a refatoração que não estão cobertas pelos documentos de referência (`diagnostico-movies_lib.md`, `tokens.css` e `Cinelux_Identidade_Visual.md`), ou que os interpretam.

Cada decisão tem: contexto, decisão e consequência. As decisões D-01 a D-11 foram aprovadas na Fase 0.

---

## D-01. Diagnóstico de referência

- **Contexto:** o arquivo `docs/diagnostico-movies_lib.md` não foi recebido.
- **Decisão:** usar como referência os 24 problemas do diagnóstico original do projeto (segurança da chave, `.gitignore`, `.env.example`, `dist/` versionado, imagens do README no `dist/`, falta de tratamento de erro, pôster ausente, busca sem codificação, dependências do `useEffect`, concorrência de requisições, estados de interface, `console.log`, idioma, paginação, responsividade, seletores CSS, CSS redundante, `index.html`, acessibilidade, arquivos sem uso, README, `MODEL.md`, `STRUCTURE.md` e nomes inconsistentes).
- **Consequência:** se o arquivo for enviado, a tabela de status será revisada contra ele.

## D-02. Branch e pull request

- **Contexto:** o prompt descreve a `main` (versão de 2024), mas o trabalho mais recente está em `feature/foundation-modernization` (PR #1, sem merge), que já resolve a maior parte do diagnóstico.
- **Decisão:** desenvolver o Cinelux em `feature/cinelux`, criada a partir de `feature/foundation-modernization`, com um PR próprio empilhado sobre o PR #1.
- **Consequência:** o PR #1 continua revisável de forma independente; o PR do Cinelux mostra só as mudanças da refatoração.

## D-03. Escopo funcional

- **Contexto:** o prompt define Início ("Melhores avaliados"), Busca e Detalhes, mas também proíbe remover funcionalidade existente sem justificativa. A branch base já tem Descobrir (gêneros, ordenação, ano, nota), destaque, faixas "Em alta" e "Nos cinemas", ranking dos 10 mais bem avaliados, índice de gêneros, "Onde assistir", recomendações, ficha técnica, trailer na página e barra de navegação inferior no celular.
- **Decisão:** manter todas essas funcionalidades e redesenhá-las na identidade Cinelux, somando o que o prompt adiciona (paginação "Carregar mais", elenco, trailer, estados).
- **Consequência:** mais componentes do que a lista mínima da arquitetura-alvo; todos seguem as mesmas regras (TypeScript, CSS Modules, i18n, tokens).

## D-04. Trailer

- **Contexto:** o prompt pede link para o YouTube; a versão atual reproduz o trailer num diálogo na própria página.
- **Decisão:** manter o player na página (YouTube sem cookies) e incluir o link "Abrir no YouTube".
- **Consequência:** atende ao prompt sem remover a funcionalidade existente.

## D-05. Versões de TypeScript e ESLint (revisada na Fase 2)

- **Contexto:** as versões estáveis atuais são TypeScript 7.0.2 e ESLint 10.14.0, mas:
  - `typescript-eslint` 8.72.1 aceita TypeScript `>=4.8.4 <6.1.0`;
  - `eslint-plugin-jsx-a11y` 6.10.2 (sem versão nova desde outubro de 2024) aceita ESLint só até a 9.
- **Decisão aprovada na Fase 0:** TypeScript 6.0.3 e ESLint 9.39.5.
- **Revisão na Fase 2:** ao instalar, o npm informou que **o ESLint 9.39.5 não tem mais suporte** ("This version is no longer supported"). Foi adotado o **ESLint 10.14.0** com **`eslint-plugin-jsx-a11y-x` 0.2.0**, fork mantido pelo es-tooling (atualizado em maio de 2026) que aceita ESLint 9 e 10 e oferece as mesmas regras (36, incluindo `alt-text`, `label-has-associated-control`, `anchor-is-valid` e `control-has-associated-label`).
- **TypeScript:** mantido em **6.0.3**, por causa do `typescript-eslint`.
- **Consequência:** todas as ferramentas em versões com suporte. Revisar o TypeScript quando o `typescript-eslint` aceitar a versão 7.

## D-06. Colunas da grade de pôsteres

- **Contexto:** a tabela da seção 5.2 da identidade (2, 3, 4, 5 e 6 colunas) não é alcançável com `auto-fill` e os próprios tokens. Com `--gutter`, `--card-min` e os espaçamentos definidos, o resultado seria 1 coluna em 320px, 3 em 768px, 4 em 1024px e 5 em 1280px.
- **Decisão:** usar colunas fixas por breakpoint, `repeat(N, minmax(0, 1fr))`, com N = 2 (base), 3 (`sm`), 4 (`md`), 5 (`lg`) e 6 (`xl`).
- **Consequência:** a grade cumpre a tabela da identidade e o critério de aceite; os cards encolhem proporcionalmente em telas estreitas.

## D-07. Parâmetro `region=BR`

- **Contexto:** o prompt pede `region=BR` em todas as requisições, mas a documentação do TMDB só prevê `region` em listas (`popular`, `top_rated`, `now_playing`, `upcoming`), busca de filmes e descoberta.
- **Decisão:** enviar `region=BR` apenas onde a API aceita; `language=pt-BR` vai em todas.
- **Consequência:** nenhuma requisição carrega parâmetros ignorados ou rejeitados pela lista de permissões do proxy.

## D-08. Formato da rota do proxy

- **Contexto:** a arquitetura-alvo prevê `api/tmdb/[...path].ts`. A documentação da Vercel não confirma rota coringa automática em `api/` fora do Next.js.
- **Decisão:** implementar `api/tmdb/[...path].ts` e validar num Preview. Se a Vercel não rotear, voltar ao formato atual (`/api/tmdb?path=`).
- **Consequência:** o resultado da validação no Preview fica registrado abaixo.

## D-09. Fonte do título no card

- **Contexto:** a seção 4.4 da identidade indica Sans 500 para o "título no card"; as seções 4.5 e 9.2 indicam Fraunces 600.
- **Decisão:** Fraunces 600, que aparece em duas seções e na regra "Use Fraunces para todo nome de filme".

## D-10. Conformidade com os termos do TMDB

- **Contexto:** os documentos não cobrem duas exigências do TMDB: o crédito ao JustWatch nos dados de "Onde assistir" e o logo oficial do TMDB numa seção de créditos.
- **Decisão:** incluir o crédito ao JustWatch em "Onde assistir" e criar a página `/sobre` com o logo aprovado do TMDB e o aviso dos termos, com link no rodapé.
- **Consequência:** evita o risco de revogação do acesso à API.

## D-11. Pasta de documentação

- **Contexto:** os documentos estavam em `read-model/`; a arquitetura-alvo usa `docs/`.
- **Decisão:** mover `MODEL.md`, `CONTRIBUTING.md` e `ROADMAP.md` para `docs/`, e as imagens do README de `docs/screenshots/` para `docs/images/`.

## D-12. `role="list"` explícito

- **Contexto:** a regra `no-redundant-roles` do plugin de acessibilidade aponta `role="list"` em `<ul>` e `<ol>` como redundante.
- **Decisão:** permitir a exceção na configuração do ESLint. O papel explícito é intencional: o Safari/VoiceOver remove a semântica de lista quando o CSS usa `list-style: none`, e `role="list"` a restaura.

## D-13. Migração gradual para TypeScript

- **Contexto:** todo o código de interface será reescrito nas Fases 3 e 5. Tipar agora arquivos que serão substituídos seria trabalho descartado.
- **Decisão:** TypeScript `strict` ativo desde a Fase 2, com `allowJs` temporário. Arquivos de configuração, entrada (`main.tsx`, `App.tsx`), função da Vercel e proxy já são TypeScript. Os módulos de dados migram na Fase 3; componentes e páginas, na Fase 5.
- **Consequência:** ao fim da Fase 5, `allowJs` é removido e não resta nenhum `.js`/`.jsx` em `src`, `api` ou `server`.

## D-14. Tamanho do bundle após React 19 e React Router 8

- **Contexto:** as versões exigidas aumentaram o JavaScript inicial de 90,7 KB para 114,5 KB (gzip). Pelo mapa de origem, `react-dom` 19 ocupa 202 KB minificados (56% do bundle) e `react-router` 8 ocupa 96 KB (27%); o código do projeto ocupa 41 KB (11%).
- **Decisão:** aceitar o aumento, que vem das versões exigidas pelo prompt, e reduzir o carregamento inicial na Fase 5 com carregamento das páginas sob demanda (`lazy` nas rotas).

## D-15. Extensões nos imports do servidor (corrigida na Fase 3)

- **Contexto:** o Vite avisa que o carregador de configuração nativo, que será o padrão numa próxima versão, não aceita imports sem extensão a partir de `vite.config.ts`. Na Fase 2 foi adotada a extensão `.ts` em todos os imports do servidor.
- **Problema encontrado:** no Preview, a função falhou com `ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/server/tmdbProxy.ts'`. A Vercel compila `api/` e `server/` para `.js`, mas mantém o caminho do import como está.
- **Decisão:**
  - a função da Vercel (`api/`) importa com extensão **`.js`**, convenção do TypeScript para ESM no Node (o TypeScript resolve para o `.ts` na verificação de tipos);
  - a cadeia usada só pelo Vite (`vite.config.ts` → `server/viteTmdbProxy.ts` → `server/tmdbProxy.ts`) mantém a extensão `.ts`.
- **Consequência:** a validação no Preview está registrada em D-08.

## D-16. Módulos além da arquitetura-alvo

- **Contexto:** a arquitetura-alvo lista `lib/format.ts`, `lib/images.ts` e os hooks `useMovies`, `useMovie` e `useDocumentTitle`. As funcionalidades mantidas por D-03 precisam de mais regras e dados.
- **Decisão:** módulos adicionais, todos puros ou finos e cobertos por testes:
  - `lib/discover.ts` (filtros de Descobrir), `lib/pagination.ts`, `lib/movie.ts` (equipe, recomendações e trailer), `lib/watchProviders.ts`;
  - `hooks/useAsync.ts` (base dos hooks), `hooks/useGenres.ts`, `hooks/useWatchProviders.ts`;
  - `i18n/index.ts` (idioma ativo e interpolação);
  - `src/test/fetch.ts` (utilitário de testes).
- **Consequência:** `services/tmdb.ts` continua sendo a única porta de saída para a API.

## D-17. Formato da nota

- **Contexto:** a identidade (4.5 e 12.3) define uma casa decimal com ponto (`8.7`, via `toFixed(1)`); a versão anterior usava vírgula (`8,7`).
- **Decisão:** seguir a identidade: `8.7`.

## D-18. Paginação durante a transição

- **Contexto:** o "Carregar mais" do prompt depende dos componentes da Fase 5.
- **Decisão:** o hook `useMovies` já oferece `loadMore` (Fase 3). Até a Fase 5, Busca e Descobrir continuam com a paginação numerada pela URL, usando `useMovies` com `initialPage`.
