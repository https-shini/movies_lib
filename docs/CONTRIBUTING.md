<h1 align="center">Contribuindo com o Cinelux</h1>

<p align="center">
  <a href="#pt-br">Português</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#en-us">English</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/https-shini/movies_lib">Voltar</a>
</p>

## PT-BR

### Passo a passo

1. Faça um fork do repositório e crie uma branch a partir da `main`:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
2. Instale as dependências com `npm ci` e configure o `.env` a partir do `.env.example` (veja o README).
3. Faça as alterações seguindo as regras abaixo.
4. Antes de enviar, rode as verificações. Elas são as mesmas do CI:
   ```bash
   npm run format:check
   npm run check
   npm run test:e2e
   ```
5. Faça commits pequenos no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), em português (ex.: `fix(busca): mantém o termo ao trocar de página`).
6. Abra um pull request para a `main` explicando o que mudou, por quê e como foi testado.

### Regras do projeto

- **TypeScript `strict`** em todo o código; não há arquivos `.js` ou `.jsx` no app.
- **Textos da interface** só em `src/i18n/pt-BR.ts`, nunca escritos direto nos componentes.
- **Estilos** só com os tokens de `src/styles/tokens.css`: nada de cor, tamanho de fonte, peso, raio ou sombra escritos direto. Os breakpoints ficam em `src/styles/breakpoints.ts`.
- **Dados do TMDB** só por `src/services/tmdb.ts`, que chama o proxy `/api/tmdb`. A chave nunca vai para o navegador, o código ou os commits.
- **Segurança:** não enfraqueça a CSP nem os cabeçalhos do `vercel.json` para um teste passar; os testes E2E falham em qualquer violação.
- **Testes:** funcionalidade nova vem com teste unitário e, se mudar a interface, com teste E2E nos sete tamanhos de tela. Não desative testes para o CI passar.
- Decisões que fogem dos documentos ficam registradas em `docs/DECISIONS.md`.

## en-US

1. Fork the repository and create a branch from `main`.
2. Run `npm ci` and create `.env` from `.env.example` (see the README).
3. Before opening a pull request, run `npm run format:check`, `npm run check` and `npm run test:e2e`.
4. Use small [Conventional Commits](https://www.conventionalcommits.org/) (the project writes them in Portuguese).
5. Open a pull request to `main` describing what changed, why, and how it was tested.

Project rules: strict TypeScript, UI text only in `src/i18n/pt-BR.ts`, styles only through the tokens in `src/styles/tokens.css`, TMDB data only through `src/services/tmdb.ts` and the `/api/tmdb` proxy (the API key never reaches the browser), and no weakening of the CSP or security headers.
