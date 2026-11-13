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
- **Resultado da validação no Preview (Fase 3):** a Vercel só roteou `api/tmdb/[...path].ts` para caminhos de um segmento (`/api/tmdb/genre` chegou à função); com mais segmentos (`/api/tmdb/genre/movie/list`) respondeu `NOT_FOUND`, sem chamar a função.
- **Decisão final:** função única em `api/tmdb.ts` e uma regra no `vercel.json` que reescreve `/api/tmdb/:path+` para `/api/tmdb?path=:path+`. O cliente continua chamando `/api/tmdb/<endpoint>`; o proxy aceita os dois formatos, então funciona qualquer que seja a URL recebida pela função.

## D-09. Fonte do título no card

- **Contexto:** a seção 4.4 da identidade indica Sans 500 para o "título no card"; as seções 4.5 e 9.2 indicam Fraunces 600.
- **Decisão:** Fraunces 600, que aparece em duas seções e na regra "Use Fraunces para todo nome de filme".
- **Revisão (D-49):** com a identidade Sala Escura mantida pelo proprietário, o título no card usa Instrument Sans 600, como no visual publicado; Fraunces continua nos títulos de página, do destaque e do filme.

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

---

## Pré-lançamento: Bloco A

## D-19. Cache na borda do proxy (C1)

- **Valores anteriores:** listas 900 s, descoberta 900 s, detalhes 3600 s, onde assistir 3600 s, busca 300 s, gêneros 86400 s; `stale-while-revalidate` igual ao `s-maxage`; navegador com `max-age=60`; erros com `no-store`.
- **Valores atuais** (`CACHE_SECONDS` em `server/tmdbProxy.ts`):

  | Dado | `s-maxage` e `stale-while-revalidate` |
  |---|---|
  | Gêneros (referência) | 24 h (86400 s) |
  | Listas e descoberta | 1 h (3600 s) |
  | Detalhes e onde assistir | 6 h (21600 s) |
  | Busca | 10 min (600 s) |

- **Mantido:** `max-age=60` no navegador e `no-store` em qualquer erro (inclusive 401, 429 e 5xx).
- **Observação:** a CDN da Vercel consome o `s-maxage` e não o repassa ao navegador (o cliente vê `public, max-age=60`). A evidência fica nos testes do proxy e nos cabeçalhos `x-vercel-cache` e `age` das respostas.
- **Configuração do TMDB:** o projeto ainda não consulta `/configuration`; quando consultar, usar a faixa de 24 h.

## D-20. `robots.txt` e `sitemap.xml` (C3)

- **Rotas:** o prompt cita `/descobrir` e `/buscar`, mas as rotas reais são `/discover` e `/search`, e a regra do bloco proíbe mudar a estrutura de rotas. O sitemap lista `/`, `/discover`, `/search`, `/sobre` e `/privacidade`.
- **Domínio:** o sitemap exige URLs absolutas e `cinelux.app` ainda não está ativo; foi usado o domínio de produção atual, `movies-lib-vite.vercel.app`. **Trocar quando o domínio mudar** (ação manual listada no PR).
- `robots.txt` permite tudo, bloqueia `/api/` e aponta o sitemap.

## D-21. Página `/sobre` e atribuição ao TMDB

- **Aviso:** o §3 dos termos traz um modelo em inglês ("This [website, program, service, application, product] uses TMDB…"). A página mostra o texto exato com "product", seguido de uma tradução para o português.
- **Logo:** variante oficial "Primary long (blue)" da página de logos do TMDB, salva sem alterações em `public/tmdb-logo.svg` (inspecionada: só formas e gradiente, sem scripts nem referências externas). Exibida com 18 px de altura, menos destacada que a marca do Cinelux.
- **JustWatch:** crédito com link em "Onde assistir", na página `/sobre` e no rodapé.

## D-22. Página `/privacidade` (C4)

- **Sentry:** o prompt pede a página explicando Web Analytics, Speed Insights e Sentry, mas o Sentry só entra no Bloco D. Para a página descrever o que acontece de fato, o parágrafo do Sentry será acrescentado no Bloco D, junto com a instalação.
- **Conteúdo de terceiros:** a página também informa o carregamento de imagens do TMDB, fontes do Google Fonts (até o item 2 do Bloco C) e o trailer do YouTube, porque esses serviços recebem o IP do visitante.
- **Termo de busca:** removido das URLs enviadas ao Web Analytics e ao Speed Insights (`beforeSend` em `src/lib/analytics.ts`), porque pode conter texto pessoal.
- **Pendência:** a LGPD pede a identificação do controlador e um canal de contato. Esses dados dependem do responsável pelo produto.

## D-23. Web Analytics e Speed Insights

- Componentes `@vercel/analytics/react` e `@vercel/speed-insights/react` (versões 2.0.1 e 2.1.0), em `src/components/layout/Observability.tsx`.
- `route` informado manualmente (`/movie/[id]`), porque fora do Next.js os pacotes não conhecem as rotas dinâmicas.
- Os dois recursos precisam ser **ativados no painel da Vercel** para começar a coletar (ação manual).

## D-24. Prioridade da imagem do LCP (C2)

- Início e Filme já usavam `fetchpriority="high"` sem `loading="lazy"` na imagem principal, e `preconnect` para `image.tmdb.org`.
- Faltava nas grades (Busca e Descobrir): o primeiro pôster carregava com `loading="lazy"`. Agora o primeiro card da grade usa `priority` (`loading="eager"` e `fetchpriority="high"`); os demais continuam preguiçosos.

## D-25. Fontes na identidade visual (C5)

- `docs/Cinelux_Identidade_Visual.md` atualizado para a versão 3.1.0 com Instrument Sans e IBM Plex Mono nas seções 2, 4, 6 e 12.1. Não existe `typography.css` no projeto, então não havia arquivo de código a ajustar.
- **Divergência restante:** o código usa o token `--font-ui`; a identidade usa `--font-sans`. A unificação dos nomes de tokens fica para a Fase 4 do Cinelux.

## D-26. Branch base do Bloco A

- `chore/pre-launch-compliance` foi criada a partir de `feature/cinelux` (que contém `DECISIONS.md`, o arquivo central de textos e a identidade citados no prompt). O PR é empilhado: `chore/pre-launch-compliance` → `feature/cinelux` → `feature/foundation-modernization` → `main`.

## D-27. Gatilhos do CI

- **Contexto:** o workflow rodava em pushes para `main` e `feature/**` e em PRs para `main`. As branches deste plano (`chore/`, `test/`, `perf/`, `feat/`) e os PRs empilhados ficariam sem verificação.
- **Decisão:** rodar em todo `pull_request` (qualquer destino), em push para `main` e sob demanda (`workflow_dispatch`).

---

## Retomada: auditoria e Parada A

## D-28. Auditoria antes da retomada (7 de novembro de 2026)

- **Contexto:** antes do Bloco B, o estado real do repositório, dos PRs, do CI e da Vercel foi auditado em modo somente leitura.
- **Achados principais:**
  - PRs #1, #2 e #3 abertos, em rascunho e empilhados, sem conflitos e com CI verde.
  - A `main` pública mantinha um `dist/` versionado com uma chave v3 do TMDB em texto claro.
  - A produção servia a `main` de 2024: só `/` respondia; as rotas diretas e o proxy davam 404.
  - Sem regra de limite de requisições, sem cabeçalhos de segurança além do HSTS, Web Analytics possivelmente inativo e página de privacidade incompleta para a LGPD.
  - README, `MODEL.md` e `index.html` ainda com o nome MoviesLib e estrutura antiga.
- **Decisão:** bloquear o Bloco B até a conclusão da Parada A, com a ordem: chave, Preview, merges, firewall, produção e PR de documentação.

## D-29. Rotação da chave do TMDB

- **Evidência (11 de novembro de 2026, 13h28 UTC):** com autorização do responsável, uma única chamada ao TMDB com a chave exposta no histórico da `main` recebeu **401** (revogada). No mesmo momento, o proxy, usando o valor salvo na Vercel, recebeu **200** sem cache: a Vercel guarda outra chave, válida.
- A variável `TMDB_API_KEY` (Secret, Production e Preview) tem a última alteração em 7 de novembro às 03h42 UTC, anterior à auditoria; por isso a troca foi comprovada pelo teste e não pelo horário.
- Nenhum valor de chave foi exibido ou registrado. O histórico do Git não foi reescrito (C7): a chave antiga continua nele, mas está revogada.
- **Preview revalidado:** redeploy `dpl_FBVGtpNzLPebZFbAFD8R7zQ2fHQZ` (commit `8a1523b`, READY às 13h29 UTC), com rotas, proxy e cache verificados por HTTP e 50 de 50 verificações no navegador em 320, 375, 768, 1024 e 1440 px.

## D-30. Merges dos PRs empilhados

- **Método:** merge commit, sem squash, para preservar o histórico de cada PR e evitar que os PRs seguintes reapresentassem commits já integrados.
- **Ordem e resultado:**

  | PR | Origem | Commit do merge |
  |---|---|---|
  | #1 | `feature/foundation-modernization` | `735fd1a` |
  | #2 | `feature/cinelux` | `631fd21` |
  | #3 | `chore/pre-launch-compliance` | `ed175bd` |

- Os PRs #2 e #3 tiveram o destino trocado para `main` antes do merge. Como trocar o destino não dispara o CI (o commit é o mesmo), o resultado de cada merge foi verificado localmente antes da integração: formatação, lint, tipos, testes (128 e 142) e build.
- A `main` final é idêntica a `chore/pre-launch-compliance` e não contém mais `dist/`. O CI da `main` passou nos merges.
- As branches de origem foram mantidas; podem ser apagadas depois, sem dependências pendentes.

## D-31. Regra de limite no firewall da Vercel

- **Pedido:** caminho `/api` (prefixo), agrupado por IP, 300 requisições por minuto (janela fixa de 60 s), ação **Log**.
- **Resultado:** a API da Vercel respondeu 404 ("Seawall Config not found") ao criar a configuração por PATCH e por PUT, inclusive com o corpo mínimo. O projeto não tem configuração de firewall e ela não pôde ser criada pela API.
- **Decisão:** não usar alternativa diferente do pedido. A regra fica como ação manual no painel (projeto `movies-lib`, aba Firewall), com exatamente estes parâmetros. Depois de criada, a regra pode ser conferida pela API.
- Revisar o limite após uma semana de registros.

## D-32. Produção após a Parada A

- **Deploy:** `dpl_9BegGtnk8QaRcGmZBjkD6webJf5V`, commit `ed175bd`, READY às 13h33 UTC, servindo `movies-lib-vite.vercel.app`.
- **HTTP:** `/`, `/discover`, `/search`, `/sobre`, `/privacidade`, `/movie/550`, `/robots.txt`, `/sitemap.xml` e `/api/tmdb/genre/movie/list` respondem 200 com o tipo de conteúdo correto. Proxy: segunda chamada servida do cache (`HIT`), POST com 405, endpoint fora da lista com 404 e `no-store`, erros nunca em cache, parâmetros fora da lista descartados. Sem `noindex` em produção.
- **Navegador:** 50 de 50 verificações nos cinco tamanhos, sem erros no console nem rolagem horizontal.
- **Lighthouse mobile (mediana de 3 execuções):**

  | Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | FCP | CLS | TBT |
  |---|---|---|---|---|---|---|---|---|
  | Início | 81 | 100 | 100 | 100 | 4,5 s | 2,2 s | 0 | 70 ms |
  | Filme | 82 | 100 | 100 | 100 | 4,6 s | 2,1 s | 0 | 30 ms |

  Linha de base do Preview (Bloco A, depois): Início 77 e Filme 81 em desempenho, SEO 58 nas duas. O SEO 58 era efeito do `noindex` e do login da Vercel no Preview, como previsto; o desempenho está dentro do ruído. O INP não é medido em laboratório; o TBT é a referência.
- **Analytics:** os envios de visualização e de métricas recebem 200, com o termo de busca removido e a rota `/movie/[id]` agrupada. Porém a API de consulta respondeu `web_analytics_not_enabled`: **o Web Analytics não está ativado no projeto** e as visitas não são registradas. A ativação do Speed Insights não pôde ser confirmada pela API. Ativar os dois no painel é ação manual.

## D-33. Escopo do Bloco B e tamanhos de tela

- **Escopo aprovado:** testes de interface com Playwright (`@playwright/test`, única dependência nova), executados no CI contra o build de produção (`vite preview`), com respostas do `/api/tmdb` simuladas por fixtures locais, sem rede real e sem chave.
- **Cobertura:** rotas (inclusive acesso direto e 404), busca, descoberta (gênero, ordenação, painel de filtros e remoção de filtros), paginação, trailer (abrir e fechar), tratamento de erros (falha do proxy e "Tentar novamente") e responsividade, sem rolagem horizontal, em cinco tamanhos de tela.
- **Fora do escopo:** qualquer mudança de funcionalidade ou de layout.
- **Tamanhos:** 320, **375**, 768, 1024 e 1440 px, como decidido pelo responsável. O item I-11 do Roadmap previa 390 px; prevalece o 375 px do prompt do pré-lançamento, mais recente, que representa a largura dos iPhones compactos.
- **Consequência registrada:** o CSS atual tem pontos de quebra em `max-width: 380px` e `max-width: 420px`. O 375 px exercita a regra de 380 px (assim como o 320 px), mas a faixa de 381 a 420 px, onde ficaria o 390 px, não é coberta por nenhum dos cinco tamanhos. Se essa faixa precisar de proteção, a forma é acrescentar um sexto tamanho (390 ou 414 px), não trocar o 375.

---

## Bloco B: testes de interface (E2E)

## D-34. Firewall confirmado e conclusão da Parada A

- **Evidência (11 de novembro de 2026):** o registro de auditoria da Vercel mostra a configuração do firewall do projeto `movies-lib` alterada como rascunho e **publicada como versão 1 às 13h57 UTC**, com uma regra `rules.insert` (`rule_rate_limit_api_sfdxnK`, "Rate Limit API"): caminho com prefixo `/api`, `rate_limit` com janela fixa de 60 s, limite de 300, chave `ip`, ação `log`, ativa.
- **Divergência registrada:** a leitura da configuração ativa pela API (`GET /v1/security/firewall/config/active`) continua respondendo 404 ("Seawall Config not found") mesmo depois da publicação. A confirmação foi feita pelo registro de auditoria, que traz os parâmetros publicados. Nenhuma alteração foi feita no firewall pela API.
- **Parada A concluída:** chave rotacionada (D-29), Preview validado, PRs #1 a #3 integrados (D-30), firewall publicado (este item), produção validada (D-32) e documentação integrada pelo PR #6 (merge `a91a988`).
- A D-31 continua valendo como histórico: a criação pela API não foi possível e a regra foi criada no painel.

## D-35. Arquitetura dos testes E2E

- **Atualização:** a forma de instalar o Chromium no CI mudou na D-38.

- **Ferramenta:** `@playwright/test` **1.63.0**, versão fixa, só com o Chromium. É a mesma versão do Playwright e do Chromium já instalados no ambiente de desenvolvimento usado no projeto, publicada há mais de dois meses; a mais recente (1.65.0) fica para o Dependabot.
- **Alvo:** o build de produção servido pelo `vite preview` (`webServer` do Playwright), sempre um servidor novo e com `TMDB_API_KEY` vazia. A variável vazia no ambiente tem prioridade sobre um `.env` local (verificado com um `.env` temporário).
- **Dados:** fixtures JSON em `e2e/fixtures/`, tipadas com `src/types/tmdb.ts` pelo `index.ts`; uma fixture fora do modelo quebra o `typecheck` (verificado alterando um campo de propósito). Filmes que só aparecem em listas recebem detalhes mínimos derivados do resumo; IDs desconhecidos recebem 404 no formato do TMDB.
- **Mock:** `page.route` em `/api/tmdb/**`, no navegador. Cada teste pode trocar a resposta de um endpoint (`tmdb.on`) por todas as chamadas ou pelas próximas N, e segurar uma resposta para observar o carregamento.
- **Determinismo:** imagens do TMDB viram um PNG local de 1 px; Google Fonts e scripts da Vercel viram respostas vazias; o player do YouTube vira uma página vazia. Qualquer outro domínio externo, endpoint sem fixture ou erro no console faz o teste falhar.
- **Seletores:** papéis, nomes acessíveis e rótulos (`getByRole`, `getByLabel`), sem classes CSS.
- **Tamanhos:** cinco projetos (320, 375, 768, 1024 e 1440 px, pixels CSS, `deviceScaleFactor` 1, toque ligado até 768 px). O proxy tem um projeto próprio, sem navegador.
- **Sem novas tentativas** (`retries: 0`), local e no CI: um teste instável deve falhar e ser corrigido. Trace e captura de tela só em falhas.
- **CI:** job `e2e` independente do `quality`, no mesmo workflow e com os mesmos gatilhos (D-27); relatório e traces enviados como artefato só em falha, por 7 dias.

## D-36. Achados durante o Bloco B

- **405 sem `no-store`:** o proxy responde 405 (métodos diferentes de GET) sem `Cache-Control`, ao contrário dos outros erros. Não há risco de cache (CDNs só guardam GET e HEAD), mas é uma inconsistência. A correção (acrescentar `Cache-Control: no-store` na resposta 405 de `server/tmdbProxy.ts`) muda o proxy e **depende de autorização**; até lá, o teste do 405 afirma explicitamente a ausência do cabeçalho, para que a correção futura o atualize.
- **Foco no `<dialog>` nativo:** com `showModal`, depois do último controle o Chromium leva o foco para fora do documento (a interface do navegador) antes de voltar ao diálogo. Nenhum elemento da página atrás do diálogo recebe foco; o teste verifica essa garantia, e não um ciclo restrito ao diálogo, que não é o comportamento do HTML.
- **Botão "Buscar" abaixo de 480 px:** o CSS esconde o botão de envio da busca; o envio é pelo teclado (`enterKeyHint="search"`). Os testes seguem esse comportamento em 320 e 375 px.
- **Faixa de 381 a 420 px:** continua fora dos cinco tamanhos (D-33).

## D-37. Resultado do Bloco B

- **Testes:** 56 testes de interface por tamanho de tela × 5 tamanhos = 280, mais 16 do proxy: **296**. Em duas execuções locais seguidas: 291 aprovados, 0 reprovados e 5 pulados por não se aplicarem ao layout (busca do cabeçalho em 320, 375 e 768 px; barra inferior em 1024 e 1440 px).
- **Por área (por tamanho):** acessibilidade 9, rotas e créditos 11, responsividade 10, estados 7, descobrir 7, busca 6, filme 4, início 2.
- **Fora do escopo dos testes:** o cache da CDN e o firewall da Vercel (só existem na Vercel) e consultas reais ao TMDB (sem chave nos testes). Esses pontos seguem verificados por `curl` nos Previews e na produção (D-29 e D-32).

## D-38. Imagem oficial do Playwright no CI

- **Falha (execução #190 do PR #7):** o job `quality` passou; o `e2e` falhou em `npx playwright install --with-deps chromium` depois de 10 minutos, antes de rodar qualquer teste. O runner (`ubuntu-latest`, agora Ubuntu 26.04, região `eastus2`) não resolveu o DNS de nenhum espelho do Ubuntu (`azure.archive.ubuntu.com`, `archive.ubuntu.com`, `security.ubuntu.com`) durante toda a etapa, e o `apt` encerrou com o código 100. Os pacotes que faltavam eram só 9 pacotes de fontes. Classificação: dependências do sistema, por um problema externo de rede do runner.
- **Decisão:** rodar o job `e2e` dentro da imagem oficial `mcr.microsoft.com/playwright:v1.63.0-noble` (Ubuntu 24.04, suportado pela 1.63.0), que já traz o Chromium da mesma versão e as dependências do sistema. O job deixa de depender do `apt` e do download do navegador. Essa é uma das duas formas recomendadas na documentação do Playwright para CI.
- **Cache removido:** a documentação do Playwright desaconselha cachear os navegadores no CI. Os passos de cache da D-35 saíram junto com a instalação.
- **Versão sincronizada:** a tag da imagem precisa acompanhar o `@playwright/test`. Um passo do job compara as duas versões e falha com uma mensagem clara se divergirem (o Dependabot atualiza o `package.json`, mas não a imagem).
- **Sem mudança na cobertura:** os mesmos testes, os mesmos cinco tamanhos, nenhuma nova tentativa e o mesmo upload de relatório e traces em falha. O job `quality` não mudou.

---

## Conclusão: segurança e desempenho

## D-39. Cabeçalhos de segurança e CSP em modo de relatório

- **Cabeçalhos em todas as respostas** (`vercel.json`, regra `/(.*)`):
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin` (o player do YouTube continua recebendo a origem);
  - `X-Frame-Options: DENY` (o site não precisa ser exibido em iframe);
  - `Permissions-Policy` desligando câmera, microfone, localização, pagamento e USB;
  - `Content-Security-Policy-Report-Only` com `default-src 'self'`, scripts só do próprio site, imagens do `image.tmdb.org`, player do `youtube-nocookie.com`, `object-src 'none'`, `frame-ancestors 'none'` e sem `unsafe-inline` nem `unsafe-eval`.
- **Mesma política nos testes:** `server/securityHeaders.ts` lê o `vercel.json` e o `vite preview` envia os mesmos cabeçalhos. Todo teste de interface falha se o navegador registrar uma violação da CSP (verificado retirando `image.tmdb.org` da política de propósito: os testes falharam). `e2e/tests/headers.spec.ts` confere os cabeçalhos servidos.
- **Modo de relatório:** a CSP fica em `Report-Only` até ser verificada no domínio público sem violações; a troca para o modo de bloqueio é só renomear o cabeçalho.
- **405 com `no-store`:** o proxy passou a enviar `Cache-Control: no-store` também no 405, como nos demais erros. A pendência da D-36 está resolvida e os testes (unitário e E2E) agora exigem o cabeçalho.

## D-40. Imagens responsivas e fontes no próprio site

- **Medição antes de escolher:** a largura exibida de cada imagem foi medida nos cinco tamanhos de tela. Os cards ocupam de 132 a 200 px; o ranking, de 56 a 64 px; o pôster do filme, 112 px até 899 px de tela e até 280 px acima; os backdrops ocupam a largura da tela.
- **Escolhas (`POSTER_VARIANTS` em `src/lib/images.ts`):**
  - cards: `w185`/`w342`, com `sizes="(min-width: 700px) 200px, 45vw"`;
  - ranking: `w92`/`w185` (antes `w342`);
  - pôster do filme: `w185`/`w342`/`w500` (antes sempre `w500`);
  - backdrops do filme e do destaque: `w780`/`w1280` (antes sempre `w1280`).
- **Exceção:** o pôster do destaque no celular continua `w500` sem `srcset`. Em telas de alta densidade, um `srcset` escolheria um arquivo maior e pioraria o LCP.
- **Fontes:** os mesmos `woff2` que o Google Fonts servia, nos subconjuntos latin e latin-ext, ficam em `src/assets/fonts` (com hash no build) e são declarados em `src/styles/fonts.css` com `font-display: swap` e `unicode-range`. Saem o CSS bloqueante e as conexões com `fonts.googleapis.com` e `fonts.gstatic.com`. As licenças OFL originais das três famílias acompanham os arquivos, sem alterações (os três textos diferem só na formatação). A CSP passou a permitir estilos e fontes só do próprio site, e a página de privacidade deixou de citar o Google Fonts.

## D-41. Uma requisição no filme, cache no cliente e divisão por rota

- **Filme:** `append_to_response` inclui `watch/providers` (já permitido pelo proxy): 1 requisição em vez de 2. O componente `WatchProviders` recebe os dados prontos; o hook e a função de serviço separados foram removidos.
- **Cache no cliente:** compartilhamento de pedidos iguais em andamento, sucessos guardados por 5 minutos (até 100 entradas), cancelamento só quando todos os interessados desistem e erros fora do cache. Os testes que exigiam o mesmo `AbortSignal` do chamador no `fetch` foram trocados por testes de comportamento: cancelar o único interessado cancela a requisição, e a desistência de um não cancela a dos outros.
- **Pré-carregamento:** os `loader` das rotas disparam as consultas das páginas em paralelo com o download do código. Na primeira versão, um erro no pré-carregamento era descartado e a página consultava de novo, uma segunda tentativa silenciosa que os testes E2E de erro pegaram. Agora o erro de um pré-carregamento fica guardado por 10 segundos e é entregue uma única vez à página.
- **Divisão por rota:** Início e 404 no pacote principal, as demais páginas sob demanda; estatísticas carregadas depois. **Resultado medido:** JavaScript inicial com gzip de 118,4 KB para 116,1 KB (−2%). O restante é `react-dom` e `react-router`. O ganho maior está na página de filme, cujo código passa a chegar em paralelo com os dados.

## D-42. Preload dos dados do Início e medições do PR de desempenho

- **Onde estava o tempo:** o LCP no celular (cerca de 4,6 s) era quase todo "atraso para começar a baixar a imagem" (cerca de 3 s): HTML, depois JavaScript, depois a consulta ao proxy, e só então a imagem do destaque. Esse é o custo da arquitetura de SPA sem renderização no servidor.
- **Decisão:** o `index.html` faz `preload` de `/api/tmdb/movie/popular?language=pt-BR&page=1&region=BR`, a mesma URL de `getMovieList("popular", 1)` (garantido por `server/indexPreload.test.ts`). Verificado no navegador: o Início faz uma única requisição, porque o app reaproveita a do preload. Nas demais rotas o custo é uma consulta com cache na CDN e um aviso (não erro) no console por preload não usado.
- **Medições (Lighthouse mobile, mediana de 3, deploys autenticados da Vercel):**

  | Página | Deploy | Desempenho | LCP | FCP | Bytes |
  | --- | --- | --- | --- | --- | --- |
  | Início | `main` (`5a77a65`) | 81 | 4,60 s | 2,09 s | 1553 KB |
  | Início | PR #10 sem preload | 83 | 4,58 s | 1,80 s | 1321 KB |
  | Início | PR #10 com preload | 83 | 4,50 s | 1,83 s | 1321 KB |
  | Filme | `main` (`5a77a65`) | 81 | 4,72 s | 2,08 s | 746 KB |
  | Filme | PR #10 sem preload | 83 | 4,57 s | 1,86 s | 717 KB |
  | Filme | PR #10 com preload | 90 | 3,37 s | 1,93 s | 723 KB |

- **Leitura:** FCP e bytes melhoraram de forma consistente; o LCP do Início melhorou pouco no laboratório. O salto do Filme na última linha não vem do preload (que só acrescenta uma consulta nessa página) e é tratado como variação da simulação até a medição em produção (registrada na D-46).
- **Boas práticas 96 nos Previews:** a CSP em modo de relatório aponta o script da barra de ferramentas da Vercel (`vercel.live`), injetado só em deploys de Preview. Não é permitido na CSP; em produção esse script não existe.

## D-43. 405 da Vercel e CSP em modo de bloqueio

- **405 na Vercel:** a verificação em produção mostrou que um POST recebia 405 com `Cache-Control: public, max-age=0, must-revalidate` e sem `Allow`. Com só `GET` exportado em `api/tmdb.ts`, a própria Vercel respondia, sem chamar o proxy, e a correção da D-39 valia só no ambiente local. Agora `POST`, `PUT`, `PATCH`, `DELETE` e `OPTIONS` também chegam ao proxy, que responde 405 com `Allow: GET` e `no-store` (`api/tmdb.test.ts`).
- **CSP em modo de bloqueio:** com o deploy de `48eb833` (CSP já sem o Google Fonts), um navegador percorreu o domínio público em 320, 375, 768, 1024 e 1440 px, em `/`, `/discover`, `/search?q=duna`, `/movie/550`, `/sobre`, `/privacidade`, uma rota inexistente e o trailer aberto: zero violações e zero erros de console. Antes disso, o deploy de `5a77a65` também tinha passado sem violações em 375 e 1440 px. O cabeçalho passou de `Content-Security-Policy-Report-Only` para `Content-Security-Policy`, com a mesma política.
- **Efeitos conhecidos:** sem endpoint de relatórios, um bloqueio aparece só no console do visitante; a barra de ferramentas da Vercel, injetada só em Previews, fica bloqueada. Para liberar um domínio novo, a CSP do `vercel.json` precisa ser atualizada, e os testes E2E acusam o que faltar.
- **`Permissions-Policy`:** sem `interest-cohort`, recurso abandonado pelo Chrome.

## D-44. Privacidade: o que foi completado e o que depende do proprietário

- **Completado com fatos verificados:** hospedagem e estatísticas pela Vercel nos EUA (região `iad1` dos deploys); o termo de busca vai ao TMDB pelo servidor, sem o IP do visitante; registros técnicos da hospedagem mantidos por até uma hora no plano atual (limite informado pela API da Vercel); direitos do titular pelo art. 18 da LGPD; cache de respostas só na memória da aba.
- **Pendente do proprietário, sem nada inventado:**
  - nome do responsável pelo tratamento e e-mail de contato, em `src/config/legal.ts`; a seção "Responsável e contato" só aparece quando os dois estiverem preenchidos;
  - base legal do tratamento das estatísticas (decisão jurídica);
  - ativação do Web Analytics no painel da Vercel (a API ainda responde `web_analytics_not_enabled`); o Speed Insights já recebe dados.

## D-45. Dependências

- **PR #5 (`@types/node` 26):** não aplicado. O projeto roda em Node 24 (`engines`), e os tipos de uma versão maior permitiriam usar APIs que não existem em execução. O Dependabot passa a ignorar versões maiores de `@types/node`.
- **`@playwright/test`:** ignorado pelo Dependabot, porque a versão precisa andar junto com a imagem do CI (D-38); o job `e2e` falha com mensagem clara se divergirem.
- **PR #4 (`actions/checkout` e `actions/setup-node` v7):** as duas versões usam Node 24, compatíveis com os runners. Revisado depois dos merges desta etapa (ver o relatório da conclusão).
- **`actions/upload-artifact`:** a v4 roda em Node 20 e gera um aviso, mas funciona; não foi atualizado só para remover o aviso.

## D-46. Resultado em produção

- **Deploy:** `dpl_9uNuZx2z23iSs6EUbn7WuGahX2WE`, commit `ff288ef` da `main`, READY, servindo `movies-lib-vite.vercel.app` (11 de novembro de 2026).
- **Lighthouse mobile no domínio público (mediana de 3):**

  | Página | Medição | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | FCP | CLS |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | Início | Antes (D-32, `ed175bd`) | 81 | 100 | 100 | 100 | 4,5 s | 2,2 s | 0 |
  | Início | Depois (`ff288ef`) | 84 | 100 | 100 | 100 | 3,92 s | 1,76 s | 0 |
  | Filme | Antes (D-32, `ed175bd`) | 82 | 100 | 100 | 100 | 4,6 s | 2,1 s | 0 |
  | Filme | Depois (`ff288ef`) | 89 | 100 | 100 | 100 | 3,43 s | 1,97 s | 0 |

  As Boas práticas voltaram a 100: a queda para 96 nos Previews vinha só da barra de ferramentas da Vercel (D-42).
- **Verificado no domínio público:** rotas e proxy com 200; cache da CDN (`MISS` e depois `HIT`); erros com `no-store`; `POST`, `PUT`, `DELETE` e `OPTIONS` com 405, `Allow: GET` e `no-store`; CSP em modo de bloqueio e demais cabeçalhos; nenhuma requisição ao Google Fonts; 50 de 50 verificações no navegador nos cinco tamanhos de tela; nenhuma violação da CSP.
- **Observação:** com o trailer aberto em 320 px, o player do YouTube (dentro do iframe) registrou "Permissions policy violation: compute-pressure". É o navegador negando a um iframe de outro domínio um recurso que ele não tem por padrão; não vem da CSP nem afeta a página.

## D-47. Fechamento da versão atual: privacidade, TypeScript 7 e Firewall

- **Privacidade:** a página passou a ter finalidade de cada tratamento, cookies e armazenamento no navegador (o Cinelux não grava cookies; o YouTube pode gravar durante a reprodução), transferência internacional (Vercel, EUA), prazos de guarda e o procedimento para exercer direitos (dentro da seção de contato, com o prazo de 15 dias do art. 19, II). As bases legais (art. 7º) são escolha do controlador: ficam em `legalBases` (`src/config/legal.ts`), vazias, e a seção "Bases legais" só aparece com algum item preenchido. Tudo o que depende do proprietário está em `docs/PENDENCIAS_PROPRIETARIO.md`.
- **PR #12 (TypeScript 6 → 7):** não aplicado. O `typescript-eslint` 8.72 declara `typescript >=4.8.4 <6.1.0` como dependência par; instalar a 7 quebraria o lint com tipos (`strictTypeChecked`). O Dependabot passa a ignorar versões maiores de `typescript` até o `typescript-eslint` aceitar a nova versão.
- **Firewall ("Rate Limit API", `/api`, janela fixa, 300 por 60 s, por IP, ação Log):** mantido em Log. A API de configuração continua respondendo 404 para o projeto (divergência conhecida; a regra aparece no registro de auditoria da conta), e a Vercel não expõe por API os eventos do Firewall. Os registros de execução da produção, retidos por 1 hora no plano Hobby, mostraram 3 linhas em 50 minutos: não há volume nem evidência de abuso que justifique Block, nem como medir falsos positivos. Reavaliar pelo painel (Firewall → regra → eventos) se o tráfego crescer.
- **Speed Insights:** recebendo dados desde 11 de novembro de 2026, 13:36 UTC (evento da conta). **Web Analytics:** a API ainda responde `web_analytics_not_enabled`; a ativação é feita no painel (ver pendências).

## D-48. Sete tamanhos de tela nos testes E2E

- Os testes de interface passam a rodar também em 390 px (iPhone 12 a 15) e 420 px (Androids grandes), além dos cinco tamanhos do Bloco B (D-33). O custo é cerca de 40% a mais de tempo no job `e2e`, aceitável para cobrir as larguras mais comuns entre 375 e 768 px.

## D-49. Identidade visual: o que foi recuperado e a proposta

- **Recuperado:** só a especificação `docs/Cinelux_Identidade_Visual.md` (v3.1.0): paleta "ouro" (fundo `#07090d`, cartões `#0e1219`, títulos `#f5f2ea`, acento `#d9b25e`), tokens `--color-*`, escala de 4 px, raios, elevação e os componentes Navbar, MovieCard e página de detalhes. O `tokens.css` dessa especificação e o diagnóstico citado nas Fases 4 a 8 não existem em nenhum commit do repositório; não foram recuperados.
- **Em uso:** a identidade "Sala Escura" (`src/styles/tokens.css`): tinta quente, marfim e acento vermelhão, com as mesmas três famílias (Fraunces, Instrument Sans, IBM Plex Mono), a mesma escala de 4 px e contraste AA verificado pelos testes de acessibilidade.
- **Revisada pela D-54:** o proprietário pediu a volta à identidade original. Decisão anterior (11 de novembro de 2026): manter a identidade Sala Escura, o logo em forma de lente e os ícones Phosphor. O `tokens.css` é reconstruído e completado com a estrutura da especificação (categorias e nomes semânticos), preservando os valores em uso; CSS Modules não serão adotados sem necessidade comprovada (D-50).
- **Se um dia a paleta ouro for adotada:** a troca é concentrada em `tokens.css`, porque os componentes só usam variáveis. Mapeamento: `--ink-0` → `#07090d`, `--ink-1` → `#0e1219`, `--ink-2` → `#141922`, `--paper` → `#f5f2ea` (títulos) e `#e4e2dc` (texto), `--accent` → `#d9b25e`, `--accent-strong` → `#e5c57e`, `--accent-ink` → um tom escuro com contraste AA sobre o ouro. Depois da troca: rodar os testes de acessibilidade nos sete tamanhos e conferir o contraste do texto sobre o acento.

## D-50. Sistema de design: `tokens.css` reconstruído

- **Estrutura:** `src/styles/tokens.css` em 8 categorias (cores e superfícies, tipografia e pesos, espaçamentos, raios e bordas, sombras, breakpoints, transições, camadas e estados), com a origem de cada valor marcada como *atual*, *especificação* ou *reconstruído*. O arquivo original da especificação não existe no repositório (D-49), então nenhum valor é apresentado como "original".
- **Nomes:** os da especificação (`--color-*`, `--font-sans`, `--weight-*`, `--leading-*`, `--tracking-*`, `--duration-*`, `--radius-full`, `--elevation-*`). Os primitivos (`--ink-*`, `--paper-*`, `--vermilion-*`) só aparecem em `tokens.css`; componentes usam os semânticos. A paleta Sala Escura foi preservada valor a valor.
- **Valores escritos direto:** cores, gradientes, pesos, entrelinhas, espaçamento entre letras, raios, `z-index`, sombras, opacidades e tamanhos de ícone foram trocados por tokens. Restam só tamanhos de ícone em `em`, relativos ao texto ao lado (estrela da nota e ícones de botão).
- **Tipografia:** `typography.css` reúne as classes `.mono` e `.display`; a base do texto continua no `body`.
- **Breakpoints:** variáveis CSS não funcionam em `@media`; a escala fica documentada em `tokens.css` e exportada em `src/styles/breakpoints.ts`, usada pelos testes E2E. 1100 px passou a 1200 px (o índice de gêneros ganha a 4ª coluna a partir de 1200 px). A fusão de 380 px em 420 px foi testada e descartada, porque mudava o espaçamento da grade de pôsteres em 390 e 420 px.
- **Mudança visual intencional:** ícones na escala da seção 6 da identidade (16, 20, 24 e 32 px), em vez de 7 tamanhos soltos (17,6 a 28,8 px). Opacidade de botões desativados unificada em 0,4 (antes 0,3 e 0,4).
- **Verificação:** capturas de tela de página inteira, antes e depois, de 8 telas nos 7 tamanhos (56 comparações, imagens do TMDB substituídas por um pixel fixo). Fora dos ícones, nenhuma diferença: os maiores desvios (até 562 pixels) são o ícone de busca maior empurrando o texto do campo em poucos pixels.
- **CSS Modules:** não adotados. As classes já usam prefixo por componente (BEM), não há conflito de nomes e a migração de 22 arquivos traria risco sem ganho visível (decisão do proprietário, D-49).

## D-51. Componentes em TypeScript e textos centralizados

- **Migração:** os 24 arquivos `.jsx` (componentes e páginas) viraram `.tsx` com props tipadas, sob `strict` e `exactOptionalPropertyTypes`. O `allowJs` foi removido dos dois `tsconfig`; o único arquivo JavaScript restante é o `eslint.config.js`.
- **Textos:** cerca de 50 textos que estavam escritos direto nos componentes (títulos de seção, estados, rótulos acessíveis, filtros, paginação, 404) passaram para `src/i18n/pt-BR.ts`, em seções por tela.
- **Português:** "Melhor avaliados" virou "Mais bem avaliados" na ordenação de Descobrir.
- **Campos vazios do TMDB:** o TMDB devolve `""` (e não `null`) para sinopse, personagem e título sem tradução. A regra `prefer-nullish-coalescing` foi mantida, e um auxiliar explícito, `textOr` (`lib/format.ts`, com testes), trata texto vazio como ausente.
- **Código morto:** `getMovieTitle` deixou de ler `movie.name` (campo de séries, que o app não usa); o link do YouTube passou a usar `getYouTubeWatchUrl`, que já existia e não era usado.
- **Verificação:** as capturas de tela das 8 telas nos 7 tamanhos ficaram idênticas às da D-50 (a migração não mudou nenhum pixel), e os 420 testes E2E passaram sem mudança, exceto o rótulo corrigido da ordenação.

## D-52. Acessibilidade: alvos de toque, alto contraste e testes de componente

- **Alvos de toque (seção 11 da identidade, 44 × 44 px):** a medição nas 7 telas e larguras encontrou abaixo do mínimo os chips de gênero (36 e 40 px de altura), o botão de limpar a busca (40 × 40) e, no desktop, o link "Início" (36 px de largura) e o campo de busca do cabeçalho (42 px). Os três primeiros ganharam uma camada `::before` invisível que amplia só a área que recebe o toque, sem mudar tamanho nem espaçamento visíveis; o campo passou a 44 px. Links dentro de parágrafos ficam de fora, como prevê a WCAG 2.5.8.
- **Alto contraste (`forced-colors`):** o chip selecionado, o item ativo do menu e o contador de filtros eram indicados só pela cor e ficavam iguais aos demais no alto contraste do sistema. Agora usam `Highlight`/`HighlightText`; botões e campos ganham borda `ButtonText`, e o esqueleto de carregamento, contorno tracejado. As regras levam o prefixo `:root` para vencer `ui.css` e os CSS dos componentes, que carregam depois de `base.css` (sem o prefixo, a regra existia e não tinha efeito).
- **Testes E2E novos:** área de toque efetiva (elemento + camada invisível) em 6 páginas e 7 larguras; chip selecionado e item ativo com cor diferente do fundo da página no alto contraste; busca com `&`, `#` e `?` preservando o termo na URL, no campo e na consulta ao proxy. Os testes de toque e de alto contraste foram conferidos falhando sem a correção. A primeira versão do teste de alto contraste comparava o chip selecionado com o não selecionado e passava mesmo sem a correção; foi refeita para comparar com o fundo da página.
- **Testes de componente (Testing Library):** `StateMessage`, `PosterGrid` (carregamento, erro, vazio, pôster, título e data ausentes) e `Pagination`.
- **Visual:** capturas idênticas abaixo de 900 px; acima disso, só o campo de busca do cabeçalho 2 px mais alto.

## D-53. Classificação indicativa do Brasil

- **Fonte:** o complemento `release_dates` do TMDB, pedido na mesma consulta dos detalhes do filme (`append_to_response`), sem requisição nova. O proxy passa a aceitar esse complemento; nenhuma rota ou parâmetro novo.
- **Regra:** só a entrada `BR` é lida, e só valores da tabela do ClassInd (`L`, `10`, `12`, `14`, `16`, `18`). A classificação de outro país, como o "R" dos EUA, nunca aparece no lugar. Entre os lançamentos brasileiros, a preferência é cinema, depois digital, mídia física e os demais; entradas sem classificação são ignoradas.
- **Interface:** linha "Classificação indicativa" na ficha técnica, com "Livre", "14 anos" etc., ou "Não informada" quando o TMDB não tiver o dado. A linha não é omitida, para não sugerir que o filme é livre.
- **Testes:** `getBrazilianRating` com dados do Brasil e dos EUA, preferência pelo cinema, "Livre", valor fora da tabela e ausência de dados; E2E com a fixture do Clube da Luta (BR "16" e US "R", os mesmos valores que o TMDB devolve; conferido pelo proxy num Preview) e com um filme sem dados ("Não informada").

## D-54. Volta à identidade visual original

- **Pedido do proprietário:** recuperar a identidade visual original do projeto a partir de capturas de tela de referência, aprimorando o que fosse preciso. Substitui a decisão da D-49 de manter a Sala Escura.
- **Fonte dos valores:** o histórico do Git, antes do commit `53a57e6` (`src/index.css`, `index.html` e o CSS das páginas). Os valores recuperados estão marcados como *original* em `tokens.css`:
  - cores: fundo `#080a0f`, superfícies `#11151e` e `#171d28`, borda `#252d3a` (e `#343c49` mais forte), texto `#f4f5f7`, texto de apoio `#b3bdcc` e `#9ba5b5`, acento dourado `#f4c95d`, erro `#ff8585`;
  - fontes: DM Sans no texto e Space Grotesk nos títulos, com espaçamento negativo nos títulos e rótulos em caixa alta com 0,14em;
  - forma: 9 px em botões e campos, 14 px em cards e pôsteres, 20 px em painéis; botões dourados com texto escuro e peso 800; cards com borda sólida sobre a superfície; painel de destaque com brilho dourado sutil.
- **Componentes:** o destaque do Início e o topo da página do filme viram painéis com borda e cantos arredondados; os cards de filme ganham borda e fundo; a ficha técnica vira uma grade de cards com ícone dourado; o campo de busca do cabeçalho ganha o botão dourado ao lado; o chip selecionado fica dourado; a marca volta a ser uma câmera de cinema dourada, no favicon também.
- **Mantido:** o nome Cinelux (a troca de nome é anterior e não faz parte do pedido), os ícones Phosphor (a referência usava Boxicons; a câmera é a equivalente no Phosphor), as funcionalidades, os textos e a estrutura das páginas. Sem itálico: o Space Grotesk não tem, e a identidade original não usava.
- **Fontes servidas pelo site:** os arquivos de Fraunces, Instrument Sans e IBM Plex Mono foram removidos; DM Sans e Space Grotesk, com as licenças OFL originais, somam 96 KB nos subconjuntos latin e latin-ext.
- **Verificação:** os 172 testes unitários e os 476 E2E passam sem mudança de comportamento; o teste de fontes passou a conferir as duas famílias novas, e o da página do filme, o texto "Título original: Fight Club".

## D-55. De catálogo de filmes a enciclopédia: séries, pessoas e coleções

- **Pedido do proprietário:** reestruturar o frontend para uma enciclopédia de cinema e séries, com páginas para obras e pessoas ligadas entre si, mantendo a paleta atual.
- **Novas páginas:** série (`/serie/:id`), pessoa (`/pessoa/:id`), pessoas (`/pessoas`) e coleção (`/colecao/:id`). As rotas novas ficam em português; `/movie/:id`, `/discover` e `/search` foram mantidas para não quebrar endereços já publicados.
- **Página do filme reestruturada:** atalhos presos abaixo do cabeçalho para cada seção; elenco com link para cada perfil; elenco e equipe completos por departamento, recolhidos por padrão; galeria de vídeos (trailers, teasers, cenas e bastidores) no player da própria página; galeria de imagens com ampliação; links oficiais (site, IMDb e redes); chamada para a coleção. A série usa os mesmos componentes (`components/title/`), com temporadas e elenco de todas as temporadas.
- **Pessoa:** biografia, principais trabalhos (os mais votados do departamento principal, sem participações como ela mesma em talk shows), filmografia completa por área com filtro de filmes e séries, fotos e perfis oficiais. Sem biografia em português, uma segunda consulta busca a versão em inglês, exibida com aviso e `lang="en"`.
- **Busca por categoria:** filmes, séries e pessoas em abas com a contagem de cada uma (`?tipo=`). Três consultas separadas (`search/movie`, `search/tv` e `search/person`) em vez de `search/multi`, para ter a contagem e a paginação por categoria.
- **Descobrir:** alternância entre filmes e séries (`?tipo=series`), com os gêneros e a ordenação de cada tipo; séries não têm ordenação por bilheteria.
- **Dados:** séries são convertidas para o formato dos cards (`lib/media.ts`), então grades, faixas e ranking servem aos dois tipos; um selo "Série" distingue os dois em listas mistas. Cada página de detalhe continua fazendo uma única consulta ao proxy.
- **Proxy:** só as rotas usadas foram liberadas (`tv/popular`, `tv/{id}`, `person/popular`, `person/{id}`, `collection/{id}`, `search/tv`, `search/person`, `discover/tv`, `genre/tv/list`) e os complementos `images`, `external_ids`, `aggregate_credits`, `content_ratings` e `combined_credits`. Os identificadores de redes sociais só viram link se tiverem apenas letras, números, ponto, hífen e sublinhado.
- **Fora do alcance da fonte de dados:** premiações, críticas profissionais e notícias não existem no TMDB; não foram simuladas. Ficam como possibilidade com outra fonte (ver D-56).
- **CSP inalterada:** nenhuma origem nova. Por isso a galeria de vídeos não usa miniaturas do YouTube (viriam de `i.ytimg.com`).
- **Testes:** 217 unitários e 714 E2E nos sete tamanhos. As páginas novas entraram nas verificações de nome acessível, alvos de toque de 44 px, rolagem horizontal e abertura direta pela URL.

## D-56. Camada de vidro, Minha lista, compartilhar e integrações avaliadas

- **Pedido do proprietário:** elevar o produto com visual inspirado em Liquid Glass, recursos adicionais de valor real e integrações externas quando trouxerem benefício.
- **Vidro sobre a paleta atual:** tokens `--glass-*` (tinta translúcida, brilho de borda, reflexo, sombra e luz ambiente). O desfoque do fundo fica só nas camadas flutuantes (cabeçalho, atalhos de seção, diálogos e barra inferior, que virou uma cápsula flutuante); cards e painéis ganham tinta, brilho e um reflexo ao passar o cursor, sem desfoque, porque dezenas de `backdrop-filter` na mesma tela pesam em celulares. Quem pede menos transparência no sistema (`prefers-reduced-transparency`) recebe superfícies opacas.
- **Defeito encontrado e corrigido:** com `backdrop-filter` e `-webkit-backdrop-filter` escritos juntos usando uma variável, o minificador manteve só a versão com prefixo, que o Chromium não aplica: o vidro saía sem desfoque. O CSS passou a declarar só `backdrop-filter`, e o build acrescenta o prefixo. Um teste E2E confere o desfoque calculado e o fundo translúcido nas camadas flutuantes, e a versão opaca com transparência reduzida.
- **Minha lista:** salvar filmes e séries sem cadastro, em `localStorage`. Sem conta, banco de dados ou custo; o conteúdo guardado é validado a cada leitura, tem limite de 500 itens e nunca sai do navegador. A página de privacidade descreve o armazenamento.
- **Compartilhar:** folha de compartilhamento do sistema (`navigator.share`) quando existe; nos demais casos, copia o link e avisa.
- **Integrações avaliadas e não adotadas agora:**
  - **OMDb** (premiações, nota do IMDb e do Rotten Tomatoes): exige chave e, acima de 1.000 consultas por dia, plano pago. Cobriria a lacuna de premiações e críticas (D-55), mas depende de o proprietário criar a conta e aceitar os termos.
  - **Wikipédia e Wikidata** (biografia em português quando o TMDB só tem em inglês): gratuitas e sem chave, com crédito obrigatório (CC BY-SA). Viável pelo servidor, sem mudar a CSP; fica como próximo passo recomendado, porque pede uma segunda função de proxy com sua própria lista de permissões e testes.
  - **Miniaturas do YouTube** nos cards de vídeo: exigiriam liberar `i.ytimg.com` na CSP; não compensam abrir uma nova origem.
  - **Contas, listas sincronizadas e avaliações próprias:** dependem de autenticação e banco de dados (I-19 do roadmap), com custo e obrigações de LGPD; fora deste escopo.
- **Testes:** 223 unitários e 777 E2E nos sete tamanhos.

## D-57. Desempenho do Início: seções sob demanda e uma folha de estilo

- **Problema:** com as faixas de séries e de pessoas (D-55), o Início caiu de 91 para 82 no Lighthouse de celular: de 50 para 83 requisições e tempo de bloqueio de 136 para 324 ms.
- **Diagnóstico (relatórios do Lighthouse):** duas consultas a mais ao proxy na abertura e 26 imagens a mais, todas de seções abaixo da dobra; o `loading="lazy"` não segura imagens de faixas horizontais próximas da tela. Além disso, o build passou a entregar três folhas de estilo e três arquivos pequenos de script antes da primeira pintura, onde antes havia uma folha.
- **Seções sob demanda:** `OnDemand` e `useNearViewport` (IntersectionObserver, margem de 200 px) montam Séries em alta, Os 10 mais bem avaliados, Nos cinemas e Pessoas em destaque só quando chegam perto da tela. Até lá, a seção mostra o mesmo esqueleto, com as mesmas dimensões, então o layout não salta. O pré-carregamento da rota ficou só com o destaque, "Em alta" e os gêneros. Cache, erro com "Tentar novamente" e cancelamento não mudaram; sem IntersectionObserver, o conteúdo carrega direto.
- **Build:** `cssCodeSplit: false` (uma folha de cerca de 10 KB com gzip) e as bibliotecas num único pacote, com as estatísticas da Vercel fora dele (D-41).
- **Descartado:** um grupo de pacote para o código compartilhado da aplicação. Ele mudava a ordem das regras no CSS único, e o ícone de busca do cabeçalho reaparecia no desktop; os testes E2E acusaram. A ordem atual ainda depende da ordem de importação dos módulos: se um dia isso incomodar, a saída robusta são camadas de cascata (`@layer`).
- **Testes:** os testes genéricos (nome acessível, alvos de toque, rolagem horizontal) percorrem a página inteira antes de verificar (`loadWholePage`). Novos: nenhuma consulta das seções adiadas na primeira tela, uma única consulta de cada ao percorrer a página, nenhuma repetição ao voltar, e erro com nova tentativa numa seção adiada.

## D-58. Cascata em camadas (`@layer`)

- **Problema:** a precedência das regras dependia da ordem de importação dos módulos (D-57). No build, o CSS de todos os módulos é concatenado num arquivo, e a ordem segue o grafo de módulos, não os imports de `main.tsx`: o CSS de `StateMessage` chegava antes dos tokens e da base.
- **Decisão:** `src/styles/layers.css` declara `tokens, base, typography, primitives, layout, components, pages, utilities, overrides`, e cada folha de estilo vive na sua camada. Uma camada posterior vence a anterior independentemente da especificidade ou da ordem.
- **Plugin `cssLayerOrder` (`build/`):** o minificador mescla blocos da mesma camada e descarta a declaração isolada, e a primeira aparição define a ordem. O plugin lê a declaração de `layers.css` (fonte única) e a põe no início de cada CSS emitido. Testes unitários cobrem o caso real (um bloco de componente chegando primeiro).
- **Alto contraste e movimento reduzido** ficam em `overrides`; o prefixo `:root` usado só para ganhar especificidade (D-52) saiu. Não há `!important` fora do bloco de movimento reduzido, então a inversão de precedência dos importantes entre camadas não afeta nada.
- **Verificação:** capturas de 14 páginas em 7 larguras antes e depois, pixel a pixel. A única diferença foi o selo "Série": `.mono` sobrescrevia o tamanho declarado no componente por acidente de ordem; agora vale o que o código declara.

## D-59. Paleta expandida e tokens complementares

- **Paleta:** o grafite e o dourado continuam como base. Entram um azul de lente (secundária, informação), uma brasa (terciária, alerta e "em alta") e um violeta de projeção (destaques editoriais, uso raro), cada um com tom de texto (300), de preenchimento (500), fundo suave e borda. Estados semânticos completos: sucesso, erro, alerta e informação.
- **Tokens novos:** gradientes de marca, contêineres (`--container-prose`, `-narrow`, `-wide`), espaçamento entre seções, escala de elevação 1 a 4, desfoque (`--blur-*`), opacidades, camadas de menu e de avisos, curvas e durações de movimento.
- **Contraste verificado por teste:** `build/tokensContrast.test.ts` lê `tokens.css`, resolve as variáveis e exige 4,5:1 para cada cor de texto sobre cada superfície, e para o texto escuro sobre os preenchimentos fortes (56 combinações).
- **Primitivo `.badge`** com variantes por papel (destaque, contorno, informação, alerta, sucesso, erro, editorial), no lugar de dois estilos isolados.

## D-60. Avisos temporários (toasts)

- **Store mínimo** em `lib/toast.ts`, lido com `useSyncExternalStore`, sem dependência. No máximo três avisos; os com ação ficam 6,5 s, os demais 3,5 s.
- **Acessibilidade:** a região (`role="status"`) fica sempre no DOM, para que leitores de tela a conheçam antes do primeiro aviso; cada aviso tem botão de fechar com nome. No celular, os avisos ficam acima da barra inferior.
- **Uso:** salvar e remover da Minha lista (remover oferece "Desfazer", que devolve a lista exatamente como estava, na mesma ordem) e Compartilhar (link copiado ou falha). A região anterior do Compartilhar saiu, para não anunciar duas vezes.

## D-61. Temporadas e episódios

- **Rota** `/serie/:id/temporada/:numero` (0 = especiais), com carregamento antecipado da série e da temporada. Os cards de temporada da série viraram links.
- **Proxy:** só `tv/{id}/season/{n}`, com até 3 dígitos e sem subcaminhos (episódio isolado, estados da conta). Cache de detalhes (6 h).
- **Página:** trilha de navegação, pôster da temporada sobre o fundo da série, ano, número de episódios e duração total; seletor entre temporadas; para cada episódio, quadro, número, título, data, duração, nota e sinopse. Episódios futuros recebem "Inédito"; o último, "Final da temporada" quando o TMDB marca. Sem sinopse ou sem imagem, a página diz isso em vez de deixar um vazio.
- **Requisições:** chegando pela série, os detalhes dela já estão no cache do cliente; só a temporada é pedida. Episódios usam `content-visibility: auto`, para temporadas longas não pesarem fora da tela.
- **`Breadcrumbs`:** componente novo de trilha, com área de toque de 44 px.

## D-62. Regressão visual no CI

- **Sem imagens de referência no repositório:** capturas geradas noutro ambiente diferem por antialiasing e dariam falsos alarmes, e as 98 capturas locais somavam 31 MB.
- **Comparativa:** o job `visual` captura a base do PR com a suíte da branch e compara a branch com ela, no mesmo container (imagem oficial do Playwright). 15 páginas inteiras em 5 larguras, com as fixtures do E2E.
- **Informativa, não bloqueante:** um redesign muda o visual de propósito. As telas alteradas vão para o resumo da execução e as imagens (referência, atual e diferença) para o artefato `visual-diff`. Validado localmente contra `0715b02`: só mudaram série, temporada e as telas com o selo "Série", exatamente as mudanças desta entrega.
- **Local:** `npm run test:visual:baseline` numa versão de referência e `npm run test:visual` na versão a comparar (`VISUAL_SNAPSHOT_DIR` aponta a pasta).

## D-63. CSS de rota e de interação fora do arquivo global

- **Regressão medida após o merge do PR #24:** Lighthouse celular, deployments antigo e novo medidos em sequência pelo mesmo caminho. Início caiu de 88–89 para 86–87 e Filme de 88 para 85–86; a primeira pintura subiu de 2,09 s para 2,29 s. A comparação local anterior (servidor próprio, sem a latência simulada da CDN) não tinha mostrado a diferença.
- **Causa:** o CSS global foi de 10,2 para 12,4 KB e o JS de entrada de 10,1 para 11,8 KB (gzip), com a página de temporada e os avisos, que todas as páginas passaram a baixar antes de pintar.
- **Decisão:** `lib/stylesheet.ts` carrega folhas de estilo sob demanda. O CSS da temporada é baixado na rota, e o carregamento da rota espera por ele (a página nunca aparece sem estilo). Os avisos (JS e CSS) carregam depois da página, como as estatísticas. As camadas já declaradas pelo CSS global (D-58) garantem que a ordem da cascata não depende de quando a folha chega.
- **Resultado no build:** CSS global de 11,5 KB e JS de entrada de 10,4 KB (gzip). Ficam no global os tokens, o selo e a trilha de navegação, que a segunda parte do redesign usa em todas as páginas.
- **Testes:** o Início não baixa o CSS da temporada; a temporada abre já com a grade aplicada; o carregador não duplica folhas e não trava a página quando uma falha.
- **Segunda medição (após o PR #25):** o Início seguia abaixo da base (85 contra 89). As requisições a mais eram o pacote dos avisos, carregado entre 0,7 e 0,9 s, junto com a imagem do destaque, e somando de 50 a 70 ms de script na abertura. Os avisos passaram a carregar só depois do evento `load`, com o navegador ocioso (`lib/idle.ts`), ou no primeiro aviso, o que vier antes.

## D-64. Redesign, parte 2: ritmo, ranking, gêneros e ações do título

- **Ritmo entre seções:** `.section` usa `--section-gap` (48 px no celular, 72 px no desktop) em vez da margem fixa de 72 px, que deixava cerca de 150 px vazios entre seções no celular. O cabeçalho de seção troca a linha sólida por um filete que esmaece, e o número ganha um traço com o gradiente da marca.
- **Ranking do Início:** algarismos com o gradiente da marca (`background-clip: text`, com cor sólida onde não há suporte); do 4º ao 10º, mais discretos, acendendo ao passar o cursor. No alto contraste do sistema, voltam à cor do texto.
- **Gêneros:** cartões de vidro em vez de lista de texto.
- **Ações do título no celular:** a principal (trailer) ocupa a linha inteira e as secundárias ficam em duas colunas; uma que sobra sozinha ocupa a linha. Abaixo de 360 px, uma coluna. Medido de 360 a 420 px: nenhum rótulo cortado. O conteúdo da página sobe cerca de 60 px.
- **Frase de efeito:** citação editorial em Space Grotesk, com filete dourado.
- **Peso:** só CSS; o arquivo global cresce cerca de 0,3 KB (gzip).

## D-65. Redesign: Descobrir e Busca

- **Diagnóstico em produção** (dados reais; 320, 360, 375, 390, 420 e 1440 px): sem rolagem horizontal; filtros, chips ativos, contagem por categoria, sugestões e estado vazio funcionavam. Os pontos reais: a troca filmes/séries usava os mesmos chips dos gêneros (duas fileiras iguais com papéis diferentes); a faixa de gêneros no celular não indicava que rola; a barra de ordenação ainda tinha a linha sólida que a D-64 substituiu; as categorias da busca quebravam em duas linhas no celular; a ordenação mostrava opções cortadas abaixo de 390 px ("Mais popul" a 320 px); e as páginas pulavam do `h1` para o `h3` dos cards (acessibilidade 99 no Lighthouse).
- **Controle segmentado (`.segmented`)**: trilho de vidro com chips dentro, para troca de catálogo ou categoria, distinto dos chips de filtro. `.segmented--fill` ocupa a largura no celular; abaixo de 375 px quebra em duas linhas em vez de esconder um item. Só os itens não selecionados perdem o preenchimento: na primeira versão o selecionado ficava transparente, com texto escuro (invisível); um teste E2E agora cobre isso.
- **`--rule-fade`**: o filete que esmaece virou token, usado pelo cabeçalho de seção e pela barra de ordenação.
- **Gêneros no celular** esmaecem na borda direita (`mask-image`).
- **Ordenação sem corte:** abaixo de 390 px o botão Filtros mostra só o ícone e o contador (o rótulo continua para leitores de tela), e a 320 px a reserva da seta do `select` cai de 48 para 40 px. Um teste E2E mede o texto de cada opção contra a largura disponível nas sete larguras.
- **Títulos:** um `h2` visível só para leitores de tela antes da grade de resultados, em Descobrir e na Busca.
- **Peso:** CSS global de 11,77 para 12,11 KB (gzip).

## D-66. Redesign: páginas de pessoas

- **Diagnóstico em produção** (dados reais; Brad Pitt, Christopher Nolan, David Fincher, Heath Ledger, uma pessoa sem foto e sem biografia, e `/pessoas`; 320 a 1440 px): sem rolagem horizontal, sem cortes e sem saltos de título. Os pontos reais: o cabeçalho era um painel de vidro que ocupava a primeira tela inteira no celular (biografia em y ≈ 940 px); quem não tinha foto ganhava uma caixa vazia de 180 × 270 px; os filtros de área e de tipo eram chips iguais; "Em breve" quebrava em duas linhas na coluna de ano; e filmografias longas renderizavam tudo de uma vez (Brad Pitt: 156 linhas, 1.928 elementos na página).
- **Cabeçalho editorial sem painel:** grade por áreas (foto, apresentação, dados, ações). No celular, a foto fica ao lado do nome e os dados e ações vêm abaixo; a partir de 700 px, a foto ocupa a altura à esquerda. Os dados viram lista com filetes (`--rule-fade`) e uma luz dourada discreta (`--gradient-spotlight`) fica por trás, contida na largura da página (a primeira versão vazava 10% para os lados e criava rolagem horizontal; o E2E de responsividade também pegaria).
- **Monograma** com as iniciais (`getInitials`, que conta caracteres Unicode: nomes em chinês e tailandês dão as iniciais certas) no gradiente da marca, em círculo, para quem não tem foto. Decorativo (`aria-hidden`): o nome já é o título.
- **Biografia:** o primeiro parágrafo ganha uma capitular dourada; quando ele é curto e há outros depois, vira abertura em Space Grotesk. Um parágrafo único e longo inteiro em fonte de título pesava demais.
- **Filmografia:** Tudo/Filmes/Séries usa o controle segmentado (D-65); a área continua em chips. "Em breve" sai da coluna de ano (que mostra "—", oculto para leitores de tela) e vira selo na lateral.
- **Exibição progressiva (aprovada pelo proprietário):** 30 créditos e "Mostrar todos (N)". Trocar a área ou o tipo volta a 30. Ao revelar, o foco vai para o primeiro crédito novo, para quem usa teclado não perder a posição. Todos os créditos continuam acessíveis com um clique; a busca do navegador só encontra os ocultos depois dele.
- **Esqueleto** com a mesma grade do cabeçalho final.
- **Correção da D-64:** a regra de alto contraste do ranking nunca tinha sido aplicada (o script de edição procurava o bloco com outra indentação e não verificava a troca). Agora ela vale para o ranking e para o monograma, com teste E2E. No Chromium o texto continuava legível, porque o navegador força a cor do texto, mas a regra não dependia disso.
- **Não alterado:** o carregamento da foto do perfil (decisão do proprietário) e a página `/pessoas`, que já estava consistente.

## D-67. Redesign: Minha lista (e a ausência de Perfil)

- **Perfil de usuário não existe:** não há rota, login, conta, sessão nem banco de dados. Por decisão do proprietário, nenhuma página de Perfil foi criada; contas e autenticação continuam no roadmap (I-19). O único perfil do site é o de pessoas (D-66).
- **Diagnóstico de Minha lista** (produção, 60 títulos reais da API, 3 títulos e lista vazia; 320 a 1440 px): sem rolagem horizontal, cortes ou erros. Os pontos: com itens, os títulos pulavam do `h1` para o `h3` dos cards (acessibilidade 98 no Lighthouse); a barra de contagem tinha a linha sólida anterior à D-64; a lista vazia só oferecia "Descobrir filmes"; e não havia filtro, ordenação nem remoção na própria lista.
- **Medição da lista preenchida:** o Lighthouse padrão abre o navegador limpo (lista vazia). Para medir com títulos, o Chromium é aberto com depuração remota, a lista é gravada no armazenamento do domínio e o Lighthouse roda nesse navegador com `--disable-storage-reset`.
- **Aprovado e feito:** total em destaque no gradiente da marca, com "Limpar lista" na mesma linha; filete esmaecido; `h2` para leitores de tela; lista vazia sem caixa, com "Descobrir filmes" e "Descobrir séries"; filtro Tudo/Filmes/Séries no controle segmentado, com a contagem de cada tipo (sempre do total); ordenação por mais recentes, mais antigos, título A–Z, melhor avaliados e lançamento (sem nota ou sem data por último; empate pelo título); remoção de cada título com botão de 44 px e "Desfazer". Filtro e ordem ficam na URL (`?tipo=series&ordem=titulo`), como em Descobrir. A exibição progressiva (B4) ficou adiada.
- **Sem mexer nos componentes compartilhados:** o card é um link inteiro, e um botão não pode ficar dentro dele; a lista monta a própria grade, com o mesmo `PosterCard`, e o botão de remover fica ao lado do link, sobre o canto. A chave de cada item passa a ser tipo + id (filme e série podem ter o mesmo id).
- **"Desfazer" de um título só:** restaurar uma cópia da lista inteira desfaria também remoções feitas depois. `reinsertWatchlistItem` devolve só aquele título, no lugar pela data de inclusão (`addedAt`). A primeira versão usava a posição numérica de origem, que muda com remoções seguidas; o E2E pegou (a tela parecia certa porque ordena por data, mas o armazenamento ficava fora de ordem) e um teste unitário reproduz o caso. A posição numérica só vale para itens antigos sem data de inclusão.
- **Foco:** depois de remover, o foco vai para o título vizinho; se a lista esvaziar, para "Descobrir filmes".
- **Armazenamento inalterado:** mesmo formato e chave (`cinelux:minha-lista:v1`); a ordenação nunca grava nada.

## D-68. Redesign: coleções (`/colecao/:id`)

- **Diagnóstico** (produção, dados reais: James Bond com 27 filmes, Matrix com descrição longa, Encanto, Os Fantasmas se Divertem sem pôster/data/descrição, Jujutsu Kaisen sem imagem de fundo, Star Trek com nome longo, coleção inexistente e identificador inválido; 8 larguras, 64 combinações): sem rolagem horizontal, cortes ou saltos de título. Os problemas: texto do cabeçalho com contraste abaixo de 4,5:1 sobre a imagem (medido pixel a pixel: 1,07 a 3,13 nos piores trechos no celular; o Lighthouse não mede contraste sobre imagem); cabeçalho em painel de vidro, com até 764 px no celular; painel vazio quando não há imagem; nome longo em 4 linhas; sem período, numeração ou compartilhar; filme anunciado como "Sem data"; e o estado de erro sem `h1`, mostrando a mensagem técnica do serviço (por exemplo, sobre a chave do TMDB).
- **Aprovado e feito (A1–A5, B1):**
  - cabeçalho editorial sem painel: no celular a imagem é uma faixa no topo e o texto fica abaixo dela, sobre o fundo sólido; a partir de 900 px o texto fica sobre a imagem, com um véu escuro forte atrás da coluna de texto. Pior contraste medido depois: 9,19:1 (antes 1,07:1);
  - sem imagem: cabeçalho compacto com a luz dourada das pessoas (D-66);
  - nomes acima de 28 caracteres usam escala menor (no máximo três linhas a 320 px, sem cortar);
  - período e quantidade ("1962–2021 · 27 filmes"), lista ordenada com o número de cada filme na sequência (visual; a posição é anunciada pela própria lista) e "Em breve" para filmes sem data;
  - erro com `h1` em todos os estados: inexistente ("Coleção não encontrada", sem nova tentativa, com caminho para descobrir), falha temporária (mensagem do serviço e "Tentar novamente") e falha técnica (mensagem genérica, sem detalhes do servidor); identificador inválido continua na 404 do site;
  - botão Compartilhar, o mesmo de filme, série e pessoa;
  - descrição sempre abaixo do cabeçalho, como abertura.
- **Regras em `lib/collection.ts`** (antes dentro do componente): ordem de lançamento (sem data por último; empate pelo título e pela ordem do TMDB), período, numeração e nome longo, com testes unitários.
- **Componente compartilhado:** `PosterCard` ganhou o parâmetro opcional `meta` (texto abaixo do título no lugar do ano). Sem ele, nada muda; o teste visual confirmou que só as telas de coleção mudaram.
- **Desempenho:** o primeiro pôster só recebe prioridade alta quando não há imagem de fundo; com ela, a imagem é o maior elemento e o pôster não disputa a banda.
- **Efeito colateral aceito:** no celular, o primeiro filme desceu em coleções com descrição longa (Matrix: de y ≈ 922 para 966 px), porque a descrição saiu de cima da imagem, onde era ilegível, e o Compartilhar ocupa uma linha. A descrição usa corpo normal no celular para atenuar.
- **Não feito, por decisão do proprietário:** alternar a ordem (B2) e tirar o CSS da coleção do arquivo global (C1, para uma etapa de desempenho).
- **Testes:** 8 unitários e 19 E2E novos (nas 7 larguras), incluindo um teste de contraste que serve uma imagem de fundo branca (o pior caso) e mede os pixels sob o texto. Contraprovas: contraste, nome longo, numeração, filme sem data, erro sem `h1` e compartilhar, cada uma fazendo pelo menos um teste falhar.
