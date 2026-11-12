<h1 align="center">Roadmap de evolução</h1>

<p align="center">
  <a href="#1-diagnóstico-atual">Diagnóstico</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#2-pontos-de-melhoria">Pontos de melhoria</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#3-recursos-do-tmdb">Recursos do TMDB</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#4-iniciativas">Iniciativas</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#6-priorização-e-status">Status</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#7-plano-de-implementação">Plano</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="../README.md">Voltar</a>
</p>

Este documento é o plano de evolução do Cinelux (antes MoviesLib). Ele combina uma análise do código atual com o estudo da documentação oficial da API do TMDB e dos termos de uso.

- **Base da análise:** branch `feature/foundation-modernization`, novembro de 2026.
- **Fontes:** endpoints, parâmetros e limites citados aqui foram conferidos na documentação oficial (lista em [Fontes](#fontes)). Quando a documentação não informa algo, isso está dito explicitamente.
- **Legenda:** **[Implementado]** indica o que já existe no código; **[Sugestão]** indica proposta.

### Como manter este documento

- Atualize a coluna **Status** da tabela de [priorização](#6-priorização-e-status) a cada entrega: `Pendente`, `Em andamento`, `Concluído` ou `Descartado`.
- Ao concluir uma iniciativa, registre o PR correspondente e mova o que mudou para a [documentação técnica](./MODEL.md).
- Novas ideias entram na seção 4 com os mesmos campos (descrição, justificativa, funcionamento, recursos da API, impacto técnico, esforço e prioridade).

### Decisões que destravam o restante

| Decisão | Por que importa | Responsável |
|---|---|---|
| Licença comercial do TMDB | Sem contrato por escrito, cobrar, exibir anúncios ou operar um site "destination" viola os termos (§2.A) | Produto / negócio |
| Política de não usar IA nem aprendizado de máquina com dados do TMDB | Os termos proíbem (§1.C e §2.A); define como as recomendações serão construídas | Produto / jurídico |
| Nome definitivo do produto | Necessário antes da fase social; a troca é centralizada em `src/config/brand.js` | Produto |
| Provedor de autenticação, banco e hospedagem da API | Pré-requisito da fase 3; deve ser registrado antes da implementação | Engenharia |

---

## 1. Diagnóstico atual

### Arquitetura [Implementado]

```text
Navegador (React 18 + React Router 7, Vite 8, CSS próprio "Sala Escura")
   │  fetch /api/tmdb?path=...      (a chave nunca vai ao navegador)
   ▼
Função serverless na Vercel (server/tmdbProxy.js)
   │  lista de endpoints e parâmetros permitidos, chave no servidor, timeout de 8 s
   │  cache na CDN (s-maxage)        ← confirmado: x-vercel-cache: HIT
   ▼
API do TMDB v3
```

- **Frontend:** 6 rotas (Início, Descobrir, Buscar, Filme, 404 e tela de erro), 18 componentes reutilizáveis, estados de carregamento, erro e vazio com nova tentativa, celular como prioridade com barra inferior. Bundle de cerca de 91 KB de JS e 7 KB de CSS (gzip).
- **Backend:** apenas o proxy do TMDB. Não há API própria, autenticação nem banco de dados.
- **Qualidade:** testes unitários com Vitest, ESLint e CI no GitHub Actions (instalação, auditoria, lint, testes e build). Testes de interface ainda não estão no repositório.

### Uso atual da API [Implementado]

| Tela | Requisições | Endpoints |
|---|---|---|
| Início | 4 | `movie/popular` (região BR), `movie/top_rated`, `movie/now_playing` (BR), `genre/movie/list` |
| Descobrir | 2 | `genre/movie/list`, `discover/movie` (gênero, ordenação, ano, nota, mínimo de votos) |
| Buscar | 1 | `search/movie` (ou `movie/popular` como sugestão) |
| Filme | 2 | `movie/{id}` com `credits,videos,recommendations,similar` + `movie/{id}/watch/providers` |

São 10 endpoints em uso. O produto ainda não tem séries, pessoas, coleções, classificação indicativa nem "em breve".

---

## 2. Pontos de melhoria

### 2.1 Conformidade com os termos de uso

| # | Problema | Evidência |
|---|---|---|
| C1 | **Sem atribuição ao JustWatch nos dados de "Onde assistir".** | Página do endpoint de provedores: *"In order to use this data you must attribute the source of the data as JustWatch. If we find any usage not complying with these terms we will revoke access to the API."* O componente `WatchProviders` só cita o TMDB. |
| C2 | **Logo do TMDB ausente e sem seção "Sobre/Créditos".** | Termos, §3: *"You must use the TMDB logo"*, de um conjunto aprovado e menos destacado que a marca do app. O FAQ pede a atribuição numa seção "About" ou "Credits". Hoje há só o texto no rodapé, e a frase difere da versão dos termos (*"…not endorsed, certified, or otherwise approved by TMDB"*). |
| C3 | **Uso comercial exige contrato.** | Termos, §2.A: sem acordo por escrito não há uso comercial. Cobrar assinatura, exibir anúncios ou um site "destination" se enquadram. |
| C4 | **Cache de no máximo 6 meses.** | Termos, §1.C: nada obtido do TMDB pode ficar armazenado por mais de 6 meses. Afeta o futuro banco de dados. |
| C5 | **Restrição a aprendizado de máquina e IA.** | Termos, §1.C e §2.A proíbem usar o conteúdo do TMDB *"in connection with, including for training, a machine learning (ML) or artificial intelligence (AI) based Application"*. Recomendações precisam ser baseadas em regras e nos endpoints de recomendação do próprio TMDB. |

### 2.2 Desempenho e eficiência (valores medidos)

| # | Problema | Dado real |
|---|---|---|
| D1 | **Imagens grandes demais.** Todos os pôsteres usam `w500`, inclusive as miniaturas de 56–64px do ranking; as fotos do elenco também usam o tamanho de pôster. | Pôster do *Clube da Luta*: w92 = 6,5 KB, w185 = 18,5 KB, w342 = 41 KB, **w500 = 71 KB**. O Início carrega cerca de 49 pôsteres. Com `srcset` adequado, a economia estimada fica entre 40% e 90% por imagem, conforme o lugar. |
| D2 | **A página do filme faz 2 requisições quando poderia fazer 1.** | `watch/providers` pode ir no `append_to_response` da mesma chamada (limite de 20 itens), e o proxy já permite esse anexo. |
| D3 | **`similar` é sempre pedido, mas só serve de reserva.** | Aumenta a resposta em 19% (29,1 KB contra 23,6 KB) e quase nunca é exibido. |
| D4 | **Sem cache no navegador.** Gêneros são buscados no Início e em Descobrir; os populares, no Início e em Buscar. | O cache da CDN funciona, mas cada navegação refaz a requisição após 60 s. |
| D5 | **A cota de requisições é compartilhada por todos os usuários.** | O limite é "na faixa de 40 requisições por segundo" (código 25 / HTTP 429). Como tudo passa pelo proxy, todos os usuários dividem o mesmo limite. Variar `page` ou `query` escapa do cache, e o proxy não limita requisições por cliente nem tenta de novo após um 429. |

### 2.3 Dados e experiência

| # | Problema |
|---|---|
| E1 | **"Em alta" usa `movie/popular`.** A documentação descreve popularidade como uma pontuação de longo prazo ("lifetime"). Para "o que está em alta agora", o recurso indicado é `trending` (janela `day` ou `week`). Ressalva: `trending` aceita só `language`, sem `region`, então a lista é global. |
| E2 | **"Lançamentos" ordena pela data de lançamento mundial.** Para o Brasil, o guia de regiões indica combinar `region=BR` com `with_release_type` (2 = limitado, 3 = cinema). |
| E3 | **Elenco e direção não são clicáveis.** Não existem páginas de pessoas. |
| E4 | **A busca encontra só filmes.** Não é possível buscar atores ou diretores. |
| E5 | **Sem classificação indicativa.** Os dados existem em `movie/{id}/release_dates`, com certificação por país. |
| E6 | **Sinopse vazia em português** cai no texto "Sinopse ainda não disponível". Existe `movie/{id}/translations` para buscar o texto em outro idioma. |
| E7 | **`belongs_to_collection` (sagas) e o ID do IMDb vêm na resposta e não são usados.** |
| E8 | **Sem renderização no servidor.** Links compartilhados de filmes não geram prévia (título, imagem), o que é crítico para um produto social. |
| E9 | **Os testes de interface não estão no repositório nem no CI.** |

---

## 3. Recursos do TMDB

Todos os endpoints abaixo foram conferidos na referência oficial; ✅ indica o que já é usado.

| Área | Endpoints | Observações da documentação |
|---|---|---|
| Filmes (listas) | `movie/popular` ✅, `movie/top_rated` ✅, `movie/now_playing` ✅, **`movie/upcoming`** | Todos aceitam `language`, `page` e `region` |
| Filmes (detalhes) | `movie/{id}` ✅ com `append_to_response` (máx. 20): `credits` ✅, `videos` ✅, `recommendations` ✅, `similar` ✅, **`watch/providers`, `release_dates`, `images`, `keywords`, `external_ids`, `translations`, `reviews`** | Tipos de lançamento: 1 estreia, 2 cinema limitado, 3 cinema, 4 digital, 5 físico, 6 TV |
| Tendências | `trending/{all\|movie\|tv\|person}/{day\|week}` | Só aceita `language` |
| Descoberta | `discover/movie` ✅ (38 parâmetros) | Ainda não usados: `with_watch_providers` + `watch_region`, `with_watch_monetization_types`, `with_runtime.gte/.lte`, `with_original_language`, `with_origin_country`, `certification` + `certification_country`, `with_cast`, `with_crew`, `with_people`, `with_keywords`, `without_genres`, `with_release_type` + `region`. Vírgula significa "E" e barra vertical (`\|`) significa "OU" em 9 desses filtros |
| Pessoas | `person/{id}` (com append), `person/{id}/combined_credits`, `movie_credits`, `images`, `external_ids`, `translations`, `person/popular` | Nomes e personagens não são traduzidos |
| Busca | `search/movie` ✅, **`search/multi`**, `search/person`, `search/tv`, `search/collection`, `search/keyword`, `search/company` | `multi` traz filmes, séries e pessoas numa só chamada |
| Busca por ID externo | `find/{external_id}` (`external_source` obrigatório) | Útil para importar dados do IMDb |
| Coleções | `collection/{id}`, `collection/{id}/images` | Sagas e franquias |
| Palavras-chave | `keyword/{id}`, `keyword/{id}/movies` | Navegação por tema |
| Onde assistir | `movie/{id}/watch/providers` ✅, `watch/providers/movie?watch_region=`, `watch/providers/regions` | **Exige crédito ao JustWatch**; não traz link direto para cada serviço, só o link do TMDB |
| Classificação | `certification/movie/list`, `movie/{id}/release_dates`, `tv/{id}/content_ratings` | |
| Séries | `tv/{id}` (com append), temporadas, episódios, `aggregate_credits`, `popular`, `top_rated`, `airing_today`, `on_the_air`, `discover/tv`, `recommendations`, `similar`, `watch/providers` | Frente nova completa |
| Configuração | `configuration`, `configuration/languages`, `configuration/countries`, `configuration/primary_translations` | A documentação orienta tirar a URL base e os tamanhos de imagem de `/configuration` |
| Imagens | `include_image_language` (ex.: `pt,null`) | O pôster tenta o idioma pedido e cai para o idioma original. Os tamanhos disponíveis devem ser lidos de `/configuration` |
| Contas e sessões de convidado | `account/*` (lista de interesse, favoritos, notas, listas — exige `session_id`), `authentication/guest_session/new`, `POST movie/{id}/rating` | Ligaria os dados do usuário à conta dele no TMDB (ver I-20) |
| Exportações e mudanças | Arquivos diários em `files.tmdb.org` (mantidos por 3 meses), `movie/changes` | A tabela de erros indica limite de 14 dias por intervalo de datas |

### Limites e regras da API

| Tema | Regra |
|---|---|
| Autenticação | Chave v3 (`api_key`) ou token de leitura no cabeçalho `Authorization: Bearer`; mesmo nível de acesso. O proxy aceita os dois. |
| Limite de requisições | "Na faixa de 40 requisições por segundo"; acima disso, HTTP 429 (código 25). O limite pode mudar a qualquer momento. |
| Paginação | Páginas de 1 a 500 (código 22). |
| `append_to_response` | Até 20 itens por chamada (código 27). |
| Erros relevantes | 401 / código 7 (chave inválida), 404 / código 34 (recurso não encontrado), 429 / código 25 (limite), 503 / códigos 9 e 46 (indisponível ou em manutenção). |
| Cache | No máximo 6 meses (termos, §1.C). |
| Atribuição | Logo aprovado do TMDB numa seção "Sobre/Créditos", menos destacado que a marca do app, e aviso de que o produto não é endossado pelo TMDB (§3). Crédito ao JustWatch nos dados de onde assistir. |
| Uso comercial | Exige contrato por escrito (§2.A). |
| IA e aprendizado de máquina | Proibido usar o conteúdo do TMDB com aplicações de ML ou IA, inclusive para treinamento (§1.C). |

---

## 4. Iniciativas

Escalas usadas:
- **Esforço:** P (até 1 dia), M (2–5 dias), G (1–3 semanas), GG (mais de 3 semanas).
- **Prioridade:** P0 (obrigatória), P1 (alto impacto com bom custo-benefício), P2 (relevante), P3 (oportunista).

### Fase 0 — Conformidade (obrigatória)

#### I-01. Crédito ao JustWatch em "Onde assistir"
- **Esforço / prioridade:** P · **P0**
- **Descrição:** incluir "Dados de disponibilidade: JustWatch" no bloco "Onde assistir", mantendo o link para a página do TMDB.
- **Justificativa:** exigido pela documentação, sob pena de perder o acesso à API (C1).
- **Recursos da API:** `movie/{id}/watch/providers` (já em uso).
- **Impacto técnico:** apenas o componente `WatchProviders`.

#### I-02. Página "Sobre" com o logo oficial do TMDB
- **Esforço / prioridade:** P · **P0**
- **Descrição:** criar a rota `/sobre` com o logo aprovado (menos destacado que a marca do app), o aviso nos termos exatos do §3 e os créditos do JustWatch. O rodapé passa a apontar para ela.
- **Justificativa:** cumpre o §3 dos termos e o FAQ (C2).
- **Impacto técnico:** uma rota nova, o rodapé e o logo nos arquivos estáticos.

#### I-03. Licença comercial e política sem IA
- **Esforço / prioridade:** não é código · **P0**
- **Descrição:** solicitar a licença comercial ao TMDB (sales@themoviedb.org) antes de cobrar ou exibir anúncios, e registrar a política de não usar IA ou aprendizado de máquina com dados do TMDB (C3 e C5).

### Fase 1 — Eficiência e precisão dos dados

#### I-04. Imagens no tamanho certo
- **Esforço / prioridade:** M · **P1**
- **Descrição:** componente `TmdbImage` com `srcset` e `sizes`: miniaturas do ranking em torno de w92/w185, cards em torno de w342, fundo da página do filme em w780 no celular e fotos do elenco com os tamanhos próprios de perfil.
- **Justificativa:** é o maior ganho de desempenho disponível (D1), sobretudo em rede móvel.
- **Funcionamento:** os tamanhos válidos vêm de `GET /configuration`, guardado em cache por 24 h no proxy, ou de uma constante revisada com base nele.
- **Recursos da API:** `/configuration`.
- **Impacto técnico:** `services/tmdb.js` e os componentes `Poster`, `FeaturedHero`, `Movie` e `WatchProviders`.

#### I-05. Página do filme com uma só requisição, incluindo a classificação indicativa
- **Esforço / prioridade:** P/M · **P1**
- **Descrição:** incluir `watch/providers` e `release_dates` no mesmo pedido, via `append_to_response`, e pedir `similar` só quando `recommendations` vier vazio.
- **Justificativa:** corta uma requisição por página (D2), reduz cerca de 19% da resposta (D3) e mostra a classificação indicativa brasileira (E5).
- **Funcionamento:** a classificação sai de `release_dates.results[iso_3166_1=BR]`, preferindo o lançamento de tipo 3 (cinema).
- **Recursos da API:** `movie/{id}` com `release_dates` e `watch/providers`.
- **Impacto técnico:** lista de permissões do proxy (`release_dates`); `WatchProviders` passa a receber os dados em vez de buscá-los; testes novos.

#### I-06. "Em alta" com dados de tendência
- **Esforço / prioridade:** P · **P1** (decisão de produto)
- **Descrição:** a seção "Em alta" passa a usar `trending/movie/week` (ou `day`).
- **Justificativa:** corresponde ao significado de "em alta agora" (E1).
- **Ressalva:** a lista é global, já que `trending` não aceita região. Alternativa: manter `movie/popular` com `region=BR` e renomear a seção para "Populares no Brasil".
- **Impacto técnico:** Início, mais uma rota na lista do proxy.

#### I-07. Lançamentos e "Em breve" fiéis ao Brasil
- **Esforço / prioridade:** P · **P1**
- **Descrição:** a ordenação "Lançamentos" usa `region=BR`, `with_release_type=2|3` e data até hoje; nova faixa "Em breve nos cinemas" com `movie/upcoming?region=BR`.
- **Justificativa:** datas corretas para o público brasileiro (E2), seguindo o guia de regiões.
- **Impacto técnico:** `services/discover.js` (com testes), o Início e a lista do proxy.

#### I-08. Cache no navegador com deduplicação
- **Esforço / prioridade:** M · **P1**
- **Descrição:** cache em memória com tempo de validade por endpoint, mais deduplicação de requisições simultâneas, dentro de `fetchTmdb`.
- **Justificativa:** elimina o refetch de gêneros e populares (D4) e torna a navegação de volta instantânea.
- **Funcionamento:** começar com uma implementação própria e pequena, sem dependência nova. Na fase social, quando houver dados do usuário para invalidar, migrar para TanStack Query.
- **Impacto técnico:** `services/tmdb.js` e o hook `useAsyncData`.

#### I-09. Proxy resistente a abuso e a picos
- **Esforço / prioridade:** M · **P1**
- **Descrição:** limite de requisições por IP (regras do firewall da Vercel ou contador em Redis), uma nova tentativa com espera aleatória após 429, `stale-if-error` para servir cache antigo se o TMDB falhar e parâmetros em ordem fixa para aproveitar mais o cache.
- **Justificativa:** protege a cota compartilhada (D5) e o custo das funções.
- **Impacto técnico:** `server/tmdbProxy.js` e a configuração da Vercel.

#### I-10. Sinopse de reserva
- **Esforço / prioridade:** P · **P2**
- **Descrição:** quando a sinopse em português vier vazia, buscar `movie/{id}/translations` e exibir o texto em inglês com o rótulo "(em inglês)".
- **Justificativa:** evita página sem sinopse (E6), com uma requisição extra só nesse caso.

#### I-11. Testes de interface no CI
- **Esforço / prioridade:** M · **P1**
- **Descrição:** adicionar ao repositório testes com Playwright usando respostas simuladas de `/api/tmdb`, em 5 tamanhos de tela (320, 390, 768, 1024 e 1440 px), cobrindo rolagem horizontal, áreas de toque e os fluxos principais.
- **Justificativa:** protege a interface e as próximas fases (E9).

### Fase 2 — Navegação por pessoas e catálogo

#### I-12. Páginas de pessoas (`/pessoa/:id`)
- **Esforço / prioridade:** G · **P1**
- **Descrição:** biografia, filmografia separada por função (atuação, direção, roteiro), fotos e link para o IMDb. Elenco e equipe da página do filme passam a ser clicáveis.
- **Justificativa:** navegar por atores e diretores é central para cinéfilos e para o modelo Letterboxd (E3).
- **Recursos da API:** `person/{id}` com `movie_credits,images,external_ids` em uma só chamada.
- **Impacto técnico:** rota nova, lista do proxy, elenco e ficha técnica, e serviços para agrupar créditos (testáveis).

#### I-13. Busca de filmes e pessoas
- **Esforço / prioridade:** M · **P1**
- **Descrição:** usar `search/multi`, ou `search/movie` + `search/person` em paralelo, e mostrar os resultados em abas "Filmes" e "Pessoas".
- **Justificativa:** permite achar atores e diretores pela busca (E4). Com `search/multi` também viriam séries, que precisariam ser filtradas até existir suporte a elas.
- **Impacto técnico:** página Buscar e lista do proxy.

#### I-14. Filtro "Disponível no meu streaming"
- **Esforço / prioridade:** M · **P1**
- **Descrição:** seletor de serviços em Descobrir, com a lista vinda de `watch/providers/movie?watch_region=BR`. O filtro usa `with_watch_providers` (ex.: `8|119`, barra vertical = "OU"), `watch_region=BR` e `with_watch_monetization_types=flatrate`.
- **Justificativa:** responde à pergunta prática do usuário: o que posso ver agora nos serviços que eu assino.
- **Impacto técnico:** `services/discover.js` (validação e URL), painel de filtros, lista do proxy e crédito ao JustWatch também aqui.

#### I-15. Mais filtros em Descobrir
- **Esforço / prioridade:** M · **P2**
- **Descrição:** duração (`with_runtime.gte/.lte`); "Cinema brasileiro" (`with_origin_country=BR`) e idioma original (`with_original_language`); classificação indicativa (`certification_country=BR` + `certification.lte`, com valores de `certification/movie/list`).
- **Impacto técnico:** a validação já existente comporta a extensão.

#### I-16. Páginas de coleções e sagas (`/colecao/:id`)
- **Esforço / prioridade:** M · **P2**
- **Descrição:** a página do filme mostra "Parte da coleção X" quando houver `belongs_to_collection`, levando à página da coleção.
- **Recursos da API:** `collection/{id}`.

#### I-17. Palavras-chave como navegação temática
- **Esforço / prioridade:** P/M · **P3**
- **Descrição:** palavras-chave na página do filme, cada uma levando a `discover/movie?with_keywords=` (ou `keyword/{id}/movies`).
- **Ressalva:** os nomes das palavras-chave vêm em inglês, o que reduz o valor para o público brasileiro.

#### I-18. Galeria de imagens do filme
- **Esforço / prioridade:** M · **P3**
- **Recursos da API:** `images` com `include_image_language=pt,null`.
- **Justificativa:** valor estético, mas secundário.

### Fase 3 — Plataforma social (núcleo do SaaS)

#### I-19. Autenticação, banco de dados e API própria
- **Esforço / prioridade:** GG · **P1** quando o produto for social
- **Descrição:** login, perfil e uma API própria na Vercel. A escolha de provedor (por exemplo Auth.js com Postgres, Supabase ou Clerk) deve ser registrada antes de implementar.
- **Modelo de dados proposto:**
  - `users`, `profiles`;
  - `diary_entries` (usuário, filme no TMDB, data em que assistiu, nota de 0,5 a 5, curtida, reassistido, resenha);
  - `watchlist`;
  - `lists` e `list_items`;
  - `follows`;
  - `movie_snapshots` (id no TMDB, título, pôster, ano, data da última atualização).
- **Conformidade:** guardar só IDs e um retrato mínimo de cada filme, atualizado em menos de 6 meses (C4) com base em `movie/changes`. A documentação não diz se as exportações diárias servem para isso.

#### I-20. Diário, notas, lista de interesse e listas próprias
- **Esforço / prioridade:** G · **P1** depois de I-19
- **Descrição:** o centro do produto estilo Letterboxd. Os dados ficam no banco do produto, **não em contas do TMDB**.
- **Justificativa:** os endpoints `account/*` exigem que o usuário tenha conta no TMDB e faça login lá. Isso prende os usuários a outro serviço e tira do produto o controle dos dados.

#### I-21. Recomendações pessoais baseadas em regras, sem IA
- **Esforço / prioridade:** M · **P2**
- **Funcionamento:**
  1. pegar os filmes mais bem avaliados pelo usuário;
  2. juntar as recomendações do TMDB para cada um (`movie/{id}/recommendations`);
  3. tirar os que ele já viu;
  4. ordenar por frequência e popularidade.
  Também cabem atalhos como "mais do seu diretor favorito", com `discover/movie` e `with_crew` ou `with_people`.
- **Justificativa:** gera valor respeitando o §1.C. Ainda assim, validar com o TMDB durante a negociação da licença.

#### I-22. Importação de histórico do IMDb
- **Esforço / prioridade:** M · **P2**
- **Descrição:** ler o arquivo de notas exportado do IMDb (IDs `tt…`), localizar cada filme com `find/{id}?external_source=imdb_id` e criar as entradas no diário.
- **Ressalva:** a importação precisa rodar no servidor, em fila e em ritmo controlado, por causa do limite de cerca de 40 requisições por segundo.

#### I-23. Prévia ao compartilhar links
- **Esforço / prioridade:** G · **P1** na fase social
- **Descrição:** gerar título, descrição e imagem de cada filme, perfil e lista para quem recebe o link.
- **Opções:** migrar para o modo "framework" do React Router 7 (já em uso), com renderização no servidor, ou usar um middleware da Vercel que injeta apenas as meta tags nessas rotas.
- **Justificativa:** E8. Num produto social, cada compartilhamento é uma vitrine.

### Fase 4 — Expansão (decisão de produto)

#### I-24. Séries de TV
- **Esforço / prioridade:** GG · **P3**
- **Descrição:** séries, temporadas, episódios e classificação indicativa. A API cobre tudo (`tv/*`, `discover/tv`, `trending/tv`, `tv/{id}/watch/providers`).
- **Recomendação:** tratar como frente separada, só depois das fases 0 a 3. O Letterboxd se concentra em filmes; séries duplicariam rotas, filtros, componentes e modelo de dados antes de o núcleo estar validado.

#### I-25. Escolha de região para "Onde assistir"
- **Esforço / prioridade:** P · **P3**
- **Descrição:** hoje a região é fixa em BR. A lista de regiões viria de `watch/providers/regions`.

### Não recomendado

- **Notas via sessões de convidado do TMDB:** duplicaria o sistema próprio de notas.
- **Resenhas do TMDB:** majoritariamente em inglês.
- **Login com conta do TMDB como base de usuários:** pelos motivos de I-20.

---

## 5. Melhorias estruturais

| Camada | Hoje | Proposta |
|---|---|---|
| **Frontend: dados** | Cada componente busca o que precisa | Cache e deduplicação (I-08). Na fase social, TanStack Query para gravações e invalidação. Avaliar carregar dados nas rotas, aproveitando o roteador já instalado |
| **Frontend: imagens** | Um tamanho fixo por tipo | `TmdbImage` com `srcset` a partir de `/configuration` (I-04) |
| **Frontend: rotas** | 6 rotas | `/pessoa/:id`, `/colecao/:id` e `/sobre`; na fase 3, `/u/:usuario`, `/listas` e `/diario` |
| **Frontend: SEO** | Só no navegador | Renderização no servidor ou meta tags injetadas (I-23) |
| **Proxy** | Lista de permissões e cache na CDN | Novas rotas e anexos na lista, com testes; limite por IP; nova tentativa após 429; `stale-if-error`; parâmetros em ordem fixa (I-09) |
| **Backend** | Inexistente | API própria na Vercel com autenticação e validação de entrada (I-19) |
| **Banco de dados** | Inexistente | Postgres com o modelo de I-19; dados do TMDB guardados por no máximo 6 meses, renovados por `movie/changes` |
| **Qualidade** | Testes unitários e CI | Testes de interface no CI (I-11); testes da API própria; monitoramento de erros |
| **Conformidade** | Só o texto no rodapé | Página "Sobre", logo, crédito ao JustWatch, licença comercial e política sem IA (I-01 a I-03) |

---

## 6. Priorização e status

| ID | Iniciativa | Fase | Impacto | Esforço | Prioridade | Status |
|---|---|---|---|---|---|---|
| I-01 | Crédito ao JustWatch | 0 | Crítico (risco de perder a API) | P | **P0** | Concluído (D-10) |
| I-02 | Página "Sobre" com logo do TMDB | 0 | Crítico (termos) | P | **P0** | Concluído (D-21) |
| I-03 | Licença comercial e política sem IA | 0 | Crítico (negócio) | — | **P0** | Pendente (proprietário) |
| I-11 | Testes de interface no CI | 1 | Alto (manutenção) | M | P1 | Concluído (D-35 a D-38) |
| I-05 | Filme em 1 requisição + classificação indicativa | 1 | Alto | P/M | P1 | Concluído (D-41, D-53) |
| I-04 | Imagens no tamanho certo | 1 | Alto (celular) | M | P1 | Concluído (D-40) |
| I-07 | Lançamentos BR e "Em breve" | 1 | Alto | P | P1 | Pendente |
| I-06 | "Em alta" com tendência | 1 | Médio | P | P1 | Pendente (decisão de produto) |
| I-08 | Cache no navegador | 1 | Médio/alto | M | P1 | Concluído (D-41) |
| I-09 | Proxy resistente | 1 | Alto (escala) | M | P1 | Concluído: cache na borda (D-19) e limite no firewall em modo Log (D-31, D-47) |
| I-10 | Sinopse de reserva | 1 | Médio | P | P2 | Pendente |
| I-12 | Páginas de pessoas | 2 | Muito alto | G | P1 | Concluído (D-55) |
| I-13 | Busca de filmes e pessoas | 2 | Alto | M | P1 | Concluído (D-55) |
| I-14 | Filtro por streaming | 2 | Muito alto | M | P1 | Pendente |
| I-15 | Mais filtros em Descobrir | 2 | Médio | M | P2 | Pendente |
| I-16 | Coleções e sagas | 2 | Médio | M | P2 | Concluído (D-55) |
| I-17 | Palavras-chave | 2 | Baixo | P/M | P3 | Pendente |
| I-18 | Galeria de imagens | 2 | Baixo | M | P3 | Concluído (D-55) |
| I-19 | Autenticação, banco e API própria | 3 | Essencial ao SaaS | GG | P1 | Pendente |
| I-20 | Diário, notas, lista de interesse e listas | 3 | Essencial ao SaaS | G | P1 | Pendente |
| I-23 | Prévia ao compartilhar | 3 | Alto | G | P1 | Pendente |
| I-21 | Recomendações por regras | 3 | Alto | M | P2 | Pendente |
| I-22 | Importação do IMDb | 3 | Médio | M | P2 | Pendente |
| I-24 | Séries de TV | 4 | Baixo agora | GG | P3 | Concluído (D-55) |
| I-25 | Escolha de região | 4 | Baixo | P | P3 | Pendente |

---

## 7. Plano de implementação

1. **Fase 0 (1–2 dias):** I-01, I-02 e o início de I-03. Deve entrar antes do próximo deploy de produção, porque o "Onde assistir" já está na interface.
2. **Fase 1 (1–2 semanas):** I-11 primeiro, como rede de proteção; depois I-05, I-04, I-07, I-06, I-08, I-09 e I-10. Tudo cabe na arquitetura atual, sem banco de dados.
3. **Fase 2 (2–3 semanas):** I-12, I-13, I-14, depois I-15 e I-16. O produto vira um catálogo completo para cinéfilos.
4. **Fase 3 (6–10 semanas):** decisão documentada de autenticação, banco e hospedagem; depois I-19, I-20, I-23, I-21 e I-22. Pré-requisitos: licença comercial resolvida e nome do produto definido.
5. **Fase 4 (sob demanda):** I-24, I-25, I-17 e I-18, conforme os dados de uso.

Cada fase segue o mesmo processo: branch dedicada, testes, Preview na Vercel, validação do responsável e merge apenas com autorização.

---

## 8. Resultado esperado

- **Conformidade:** risco zero de perder o acesso por falta de atribuição e um caminho legal para monetizar.
- **Desempenho:** página do filme com 1 requisição em vez de 2; resposta menor sem `similar`; de 40% a 90% menos dados por imagem, conforme o lugar; navegação de volta instantânea com o cache; cota do TMDB protegida contra picos e abuso.
- **Dados:** "Em alta", lançamentos e "Em breve" fiéis ao Brasil; classificação indicativa; sinopse sempre presente.
- **Experiência:** navegar por atores, diretores e sagas; buscar pessoas; filtrar pelo que está nos serviços de streaming do usuário.
- **Produto:** base pronta para o SaaS social (diário, notas, listas, perfis, recomendações e links com prévia) sobre uma arquitetura que respeita os limites e os termos da API.

---

## Fontes

- [Getting Started](https://developer.themoviedb.org/docs/getting-started)
- [Rate Limiting](https://developer.themoviedb.org/docs/rate-limiting)
- [Application Authentication](https://developer.themoviedb.org/docs/authentication-application)
- [Errors](https://developer.themoviedb.org/docs/errors)
- [Append To Response](https://developer.themoviedb.org/docs/append-to-response)
- [Image Basics](https://developer.themoviedb.org/docs/image-basics)
- [Image Languages](https://developer.themoviedb.org/docs/image-languages)
- [Regions](https://developer.themoviedb.org/docs/region-support)
- [Popularity & Trending](https://developer.themoviedb.org/docs/popularity-and-trending)
- [Finding Data](https://developer.themoviedb.org/docs/finding-data)
- [Daily ID Exports](https://developer.themoviedb.org/docs/daily-id-exports)
- [FAQ](https://developer.themoviedb.org/docs/faq)
- [Discover Movie](https://developer.themoviedb.org/reference/discover-movie)
- [Movie Watch Providers](https://developer.themoviedb.org/reference/movie-watch-providers)
- [Movie Release Dates](https://developer.themoviedb.org/reference/movie-release-dates)
- [Terms of Use](https://www.themoviedb.org/api-terms-of-use)
- [Índice da documentação (llms.txt)](https://developer.themoviedb.org/llms.txt)
