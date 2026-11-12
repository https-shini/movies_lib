# Pendências do proprietário

O que o Cinelux não pode decidir nem preencher sozinho. Nada aqui deve ser inventado:
cada item exige um dado real ou uma decisão do responsável pelo projeto.

## Privacidade (LGPD)

Arquivo: `src/config/legal.ts`. Cada seção da página `/privacidade` aparece sozinha quando
o campo correspondente é preenchido; não é preciso mexer no texto da página.

| Campo | O que preencher | Exemplo de formato |
| --- | --- | --- |
| `legalContact.controller` | Nome da pessoa ou empresa responsável pelo tratamento (LGPD, art. 5º, VI) | `Nome Sobrenome` ou `Empresa Ltda. (CNPJ 00.000.000/0000-00)` |
| `legalContact.email` | E-mail que recebe pedidos sobre dados pessoais (art. 41) | `privacidade@seudominio.com.br` |
| `legalBases.analytics` | Base legal das estatísticas de visitas (art. 7º) | `Legítimo interesse (art. 7º, IX)` |
| `legalBases.performance` | Base legal das métricas de desempenho | idem |
| `legalBases.catalog` | Base legal das consultas ao TMDB (termo de busca) | idem |
| `legalBases.logs` | Base legal dos registros técnicos da hospedagem | idem |

A escolha da base legal é uma decisão jurídica. Se a base escolhida for o legítimo interesse,
a LGPD (art. 10) pede que o controlador avalie e registre esse interesse.

Depois de preencher, atualize a data em `privacy.updated` (`src/i18n/pt-BR.ts`) e rode
`npm test` (o teste `src/config/legal.test.ts` que confere os campos vazios precisa ser
ajustado no mesmo commit).

## Vercel

- **Web Analytics:** painel da Vercel → projeto `movies-lib` → aba **Analytics** → **Enable**.
  O código já envia os eventos (`@vercel/analytics`); sem a ativação, eles são descartados.
  Depois de ativar, a contagem aparece no painel em alguns minutos.
- **Firewall:** a regra "Rate Limit API" está em modo Log (D-47). Só mudar para Block depois de
  observar os eventos da regra no painel (Firewall) e confirmar que não há falsos positivos.

## Integrações que dependem de conta ou decisão

- **OMDb (premiações e notas do IMDb e do Rotten Tomatoes):** criar a conta em omdbapi.com, escolher o plano (gratuito até 1.000 consultas por dia) e guardar a chave como variável de ambiente do servidor na Vercel, nunca no código. Com a chave configurada, a integração pode ser feita pelo proxy, como a do TMDB (D-56).
- **Biografias da Wikipédia em português:** não exige conta; é uma decisão de produto, porque obriga a exibir o crédito e a licença CC BY-SA nas páginas de pessoa (D-56).

