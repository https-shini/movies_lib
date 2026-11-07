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

## D-05. Versões de TypeScript e ESLint

- **Contexto:** as versões estáveis atuais são TypeScript 7.0.2 e ESLint 10.14.0, mas:
  - `typescript-eslint` 8.72.1 aceita TypeScript `>=4.8.4 <6.1.0`;
  - `eslint-plugin-jsx-a11y` 6.10.2 (a mais recente) aceita ESLint até a 9.
- **Decisão:** usar **TypeScript 6.0.3** e **ESLint 9.39.5** (com `@eslint/js` 9.39.5).
- **Consequência:** lint de TypeScript e regras de acessibilidade funcionam. Revisar quando os plugins suportarem TypeScript 7 e ESLint 10.

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
- **Consequência:** o resultado da validação será registrado aqui.

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
