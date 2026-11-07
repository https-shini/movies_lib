# Cinelux · Identidade Visual e Tipografia

> Documento definitivo de marca e interface do projeto Cinelux (antigo `movies_lib`).
> Versão 3.0.0 · Domínio: `cinelux.app` · Complementa `tokens.css` (sistema cromático).

---

## Sumário

1. [Essência da marca](#1-essência-da-marca)
2. [Logo](#2-logo)
3. [Cores](#3-cores)
4. [Tipografia](#4-tipografia)
5. [Layout, espaçamento e forma](#5-layout-espaçamento-e-forma)
6. [Iconografia](#6-iconografia)
7. [Imagens e pôsteres](#7-imagens-e-pôsteres)
8. [Movimento](#8-movimento)
9. [Componentes](#9-componentes)
10. [Voz e microcopy](#10-voz-e-microcopy)
11. [Acessibilidade](#11-acessibilidade)
12. [Implementação](#12-implementação)
13. [Faça e não faça](#13-faça-e-não-faça)

---

## 1. Essência da marca

### 1.1 Nome oficial

**Cinelux**. Uma palavra, só o `C` maiúsculo.

*Cine* (cinema) + *lux* (latim para "luz"): **a luz do cinema**. Cinema é, literalmente, luz projetada no escuro, e o nome resume o conceito visual da marca ("sala escura, luz dourada"). As duas raízes são reconhecidas em praticamente todas as línguas ocidentais, então o nome funciona no Brasil e fora dele sem tradução.

Substitui os nomes antigos ("Filmes Explorer", `movie_lib`, "MoviesLib").

| Contexto | Forma correta |
|---|---|
| Interface, README, título da página | Cinelux |
| Domínio do produto | `cinelux.app` |
| Repositório e pacote npm | `cinelux` |
| Redes sociais | `@cinelux.app` (ou `@cineluxapp` onde não aceitar ponto) |
| Código (componentes, classes CSS) | `Cinelux`, `.cinelux-*` quando precisar de prefixo |

### 1.2 Presença digital e registro

| Item | Situação (07/11/2026) | Ação |
|---|---|---|
| `cinelux.app` | Livre | Registrar; domínio principal do produto |
| `getcinelux.com` | Livre | Registrar; `.com` para marketing e e-mails |
| `cinelux.film` | Livre | Opcional, proteção do nome |
| `cinelux.com`, `cinelux.io`, `cinelux.com.br` | Ocupados | Não depender deles |
| Marca no INPI (Brasil) | A verificar | Buscar classes 9 (software) e 42 (SaaS) |
| Marca nos EUA (USPTO) e UE (EUIPO) | A verificar | Fazer antes de lançar fora do Brasil |

> **Atenção:** "Cinelux" já é usado por salas de cinema na Califórnia e na Itália e por uma linha de filtros de iluminação da Rosco. São ramos diferentes (exibição e equipamentos), o que costuma permitir a convivência com um software, mas **confirme a disponibilidade nas classes 9 e 42** antes de investir em marketing. Ao registrar, prefira a **marca mista** (logotipo + nome).

### 1.3 Propósito

Ser um acervo de cinema elegante e direto: encontrar um filme, entender do que se trata e decidir se vale assistir, em poucos segundos.

### 1.4 Personalidade

| Somos | Não somos |
|---|---|
| Sofisticados, como uma sala de cinema antiga | Ostentativos ou "luxo de cassino" |
| Curadores, organizados como um acervo | Uma vitrine de streaming barulhenta |
| Precisos, com dados claros e alinhados | Técnicos a ponto de parecer planilha |
| Silenciosos: o pôster é o protagonista | Decorados com efeitos que competem com a imagem |

> O "lux" do nome é **luz**, não **luxo**. A marca é refinada, nunca ostentativa.

### 1.5 Conceito visual

**"Sala escura, luz dourada."** A interface é a sala de projeção: grafite profundo, quase preto. O dourado é a luz do projetor (o *lux* do nome): aparece pouco e sempre com função (ação principal, nota, item ativo).

### 1.6 Tagline

| Idioma | Principal | Curta |
|---|---|---|
| Português | **Seu acervo de cinema.** | **Cinema, catalogado.** |
| Inglês | **Your film collection.** | **Cinema, catalogued.** |

---

## 2. Logo

### 2.1 Conceito

O logo separa visualmente as duas partes do nome:

- **"Cine"** em serifa de alto contraste (Fraunces), marfim: cinema, cartaz clássico, letreiro.
- **"lux"** em monoespaçada (JetBrains Mono), dourada: a luz, o dado preciso, o catálogo.

Entre as duas, um **ponto dourado** representa a fonte de luz do projetor. A leitura continua sendo uma palavra só: **Cine·lux**.

O **monograma** é um quadro na proporção de pôster (2:3) com "C" serifado e o ponto dourado no canto, como a luz acesa na sala: reconhecível em 16 px.

### 2.2 Wordmark (SVG)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136 48" role="img" aria-label="Cinelux">
  <text x="0" y="34"
        font-family="Fraunces, Georgia, serif"
        font-size="32" font-weight="600"
        letter-spacing="-0.5"
        fill="#f5f2ea">Cine</text>
  <circle cx="76" cy="28" r="3.5" fill="#d9b25e"/>
  <text x="86" y="34"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="24" font-weight="500"
        fill="#d9b25e">lux</text>
</svg>
```

> Para produção, converta os textos em contornos (paths) num editor vetorial e ajuste o espaçamento ótico ao redor do ponto. Assim o logo não depende das fontes carregadas.

### 2.3 Monograma (SVG)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" role="img" aria-label="Cinelux">
  <rect x="1" y="1" width="30" height="46" rx="4"
        fill="#0e1219" stroke="#d9b25e" stroke-width="2"/>
  <text x="16" y="32" text-anchor="middle"
        font-family="Fraunces, Georgia, serif"
        font-size="24" font-weight="700"
        fill="#f5f2ea">C</text>
  <circle cx="24" cy="9" r="2.5" fill="#d9b25e"/>
</svg>
```

### 2.4 Favicon (SVG, 1:1)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#07090d"/>
  <rect x="13" y="5" width="22" height="38" rx="3"
        fill="#0e1219" stroke="#d9b25e" stroke-width="2"/>
  <text x="24" y="31" text-anchor="middle"
        font-family="Fraunces, Georgia, serif"
        font-size="18" font-weight="700"
        fill="#f5f2ea">C</text>
  <circle cx="30" cy="11" r="2" fill="#d9b25e"/>
</svg>
```

Salvar como `public/favicon.svg`. Gere também `apple-touch-icon.png` (180 × 180) a partir dele.

### 2.5 Variações

| Variação | Uso | Cores |
|---|---|---|
| Wordmark principal | Navbar, README, rodapé | "Cine" `#f5f2ea`, ponto e "lux" `#d9b25e` |
| Wordmark monocromático claro | Sobre imagens com scrim | Tudo `#f5f2ea` |
| Wordmark monocromático escuro | Impressão, fundos claros | Tudo `#07090d` |
| Monograma | Avatar de redes, ícone de app, telas < 640 px | Fundo `#0e1219`, borda e ponto `#d9b25e`, "C" `#f5f2ea` |

### 2.6 Área de proteção e tamanhos mínimos

- **Área de proteção:** em volta do logo, espaço livre igual à altura do "C" de "Cine".
- **Wordmark:** mínimo de 72 px de largura (tela) ou 20 mm (impresso). Abaixo disso, use o monograma.
- **Monograma:** mínimo de 16 px de altura.

### 2.7 Usos incorretos

- Trocar as fontes do logo ou escrever tudo numa fonte só.
- Aplicar gradiente, sombra, brilho ou contorno no wordmark.
- Inverter as cores (deixar "Cine" dourado e "lux" claro).
- Remover o ponto dourado ou trocá-lo por hífen, barra ou espaço.
- Escrever "CineLux", "CINELUX", "Cine Lux" ou "Cinelüx" fora do logo.
- Associar a marca a "luxo" em textos (ex.: "cinema de luxo").
- Distorcer, rotacionar ou mudar o espaçamento entre as partes.
- Usar sobre pôster sem scrim (`--gradient-poster-scrim`).

---

## 3. Cores

O sistema completo, com escalas, estados e contrastes validados, está em **`tokens.css`**. Aqui fica só o essencial para a marca.

### 3.1 Paleta de marca

| Papel | Token | HEX |
|---|---|---|
| Sala (fundo) | `--color-bg` | `#07090d` |
| Tela (cards) | `--color-surface-base` | `#0e1219` |
| Palco (elevado) | `--color-surface-elevated` | `#141922` |
| Marfim (títulos) | `--color-text-heading` | `#f5f2ea` |
| Texto | `--color-text-primary` | `#e4e2dc` |
| Ouro (acento) | `--color-accent-default` | `#d9b25e` |
| Ouro claro (hover, links) | `--color-accent-hover` | `#e5c57e` |

### 3.2 Proporção de uso

| Cor | Proporção aproximada da tela |
|---|---|
| Grafites (fundo e superfícies) | 70% |
| Marfim e cinzas (texto) | 20% |
| Pôsteres (imagem) | conforme conteúdo |
| Ouro | **no máximo 5%** |
| Semânticas (erro, sucesso etc.) | só quando há estado a comunicar |

O dourado perde valor se aparecer em todo lugar. Regra prática: **no máximo um elemento dourado "cheio" (botão primário) por área visível.**

---

## 4. Tipografia

### 4.1 Famílias

| Papel | Família | Por quê |
|---|---|---|
| **Display** (títulos, nome de filme, logo) | **Fraunces** | Serifa de alto contraste com eixo óptico: em tamanho grande fica refinada como cartaz de cinema; em tamanho médio continua legível. |
| **Interface** (texto, botões, navegação) | **Manrope** | Sans geométrica humanista, limpa e moderna, com ótima leitura em fundo escuro e personalidade suficiente para não parecer genérica. |
| **Dados** (nota, duração, ano, valores, "lux" do logo) | **JetBrains Mono** | Números de largura fixa alinham listas e valores; reforça o lado "catálogo" da marca. |

Todas são gratuitas (Google Fonts, licença OFL).

### 4.2 Pilhas com fallback

```css
--font-display: "Fraunces", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
--font-sans:    "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, "SFMono-Regular", Consolas, monospace;
```

### 4.3 Pesos permitidos

| Família | Pesos | Uso |
|---|---|---|
| Fraunces | 500, 600, 700 | 600 padrão de títulos; 700 só no hero e no logo |
| Manrope | 400, 500, 600, 700 | 400 texto; 500 navegação e labels; 600 botões e subtítulos; 700 ênfase rara |
| JetBrains Mono | 400, 500 | 400 dados; 500 nota em destaque |

Nada de itálico sintético. Se precisar de itálico em Fraunces (tagline do filme), carregue o itálico real.

### 4.4 Escala tipográfica

Base 16 px, razão **1.25 (terça maior)**. Tamanhos a partir de `2xl` são fluidos.

| Token | Tamanho | Line-height | Tracking | Família / peso | Uso |
|---|---|---|---|---|---|
| `--text-5xl` | clamp(2.75rem, 5vw + 1rem, 3.815rem) | 1.05 | -0.02em | Display 700 | Título do filme no hero |
| `--text-4xl` | clamp(2.25rem, 3.5vw + 1rem, 3.052rem) | 1.1 | -0.02em | Display 600 | Título de página ("Melhores filmes") |
| `--text-3xl` | clamp(1.875rem, 2.5vw + 1rem, 2.441rem) | 1.15 | -0.015em | Display 600 | Seções na página de detalhes |
| `--text-2xl` | clamp(1.5rem, 1.5vw + 1rem, 1.953rem) | 1.2 | -0.01em | Display 600 | Títulos de bloco, modal |
| `--text-xl` | 1.563rem | 1.3 | -0.005em | Sans 600 | Subtítulos |
| `--text-lg` | 1.25rem | 1.4 | 0 | Display 500 itálico | Tagline do filme |
| `--text-md` | 1.125rem | 1.6 | 0 | Sans 400 | Sinopse (leitura longa) |
| `--text-base` | 1rem | 1.6 | 0 | Sans 400 | Texto padrão |
| `--text-sm` | 0.875rem | 1.5 | 0.005em | Sans 500 | Botões, navegação, título no card |
| `--text-xs` | 0.75rem | 1.4 | 0.08em, CAIXA ALTA | Sans 600 | Rótulos ("ORÇAMENTO", "DURAÇÃO") |
| `--text-data` | 0.875rem | 1.4 | 0 | Mono 400 | Nota, ano, duração, valores |

### 4.5 Regras de composição

- **Comprimento de linha:** sinopse e textos longos com `max-width: 65ch`.
- **Números:** sempre `font-variant-numeric: tabular-nums` em dados (mono já é tabular; em Manrope, aplique a classe).
- **Nota do filme:** uma casa decimal (`8.7`, não `8.712`), mono 500, acompanhada de ícone de estrela.
- **Caixa alta:** só em `--text-xs` (rótulos), sempre com tracking 0.08em. Nunca em títulos.
- **Títulos de filme:** Fraunces sempre. Truncar no card com duas linhas (`line-clamp: 2`), nunca reduzir o tamanho.
- **Hierarquia por cor:** título `--color-text-heading`, corpo `--color-text-primary`, apoio `--color-text-secondary`, metadados `--color-text-tertiary`.
- **Eixo óptico:** em Fraunces, deixe `font-optical-sizing: auto` ativo; ele ajusta o contraste conforme o tamanho.
- **Hifenização:** `hyphens: auto` só na sinopse (com `lang="pt-BR"` no HTML).

### 4.6 Tokens de tipografia (CSS)

```css
:root {
  /* Famílias */
  --font-display: "Fraunces", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --font-sans:    "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, "SFMono-Regular", Consolas, monospace;

  /* Pesos */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Escala (razão 1.25) */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-md:   1.125rem;
  --text-lg:   1.25rem;
  --text-xl:   1.563rem;
  --text-2xl:  clamp(1.5rem,   1.5vw + 1rem, 1.953rem);
  --text-3xl:  clamp(1.875rem, 2.5vw + 1rem, 2.441rem);
  --text-4xl:  clamp(2.25rem,  3.5vw + 1rem, 3.052rem);
  --text-5xl:  clamp(2.75rem,  5vw + 1rem,   3.815rem);

  /* Entrelinha */
  --leading-tight:   1.1;
  --leading-snug:    1.3;
  --leading-normal:  1.5;
  --leading-relaxed: 1.6;

  /* Tracking */
  --tracking-tighter: -0.02em;
  --tracking-tight:   -0.01em;
  --tracking-normal:  0;
  --tracking-wide:    0.08em;

  /* Medidas */
  --measure-prose: 65ch;
}

html {
  font-family: var(--font-sans);
  font-size: 100%;
  line-height: var(--leading-relaxed);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, .font-display {
  font-family: var(--font-display);
  font-weight: var(--weight-semibold);
  font-optical-sizing: auto;
  color: var(--color-text-heading);
  text-wrap: balance;
}

h1 { font-size: var(--text-4xl); line-height: var(--leading-tight); letter-spacing: var(--tracking-tighter); }
h2 { font-size: var(--text-3xl); line-height: 1.15;                letter-spacing: -0.015em; }
h3 { font-size: var(--text-2xl); line-height: 1.2;                 letter-spacing: var(--tracking-tight); }

h4 {
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
}

p { max-width: var(--measure-prose); text-wrap: pretty; }

.text-hero {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--weight-bold);
  line-height: 1.05;
  letter-spacing: var(--tracking-tighter);
}

.text-tagline {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  font-style: italic;
  color: var(--color-text-secondary);
}

.text-prose {
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  max-width: var(--measure-prose);
  hyphens: auto;
}

.text-label {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.text-data {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.text-rating {
  font-family: var(--font-mono);
  font-weight: var(--weight-medium);
  color: var(--color-accent-default);
}

.tabular { font-variant-numeric: tabular-nums; }
```

---

## 5. Layout, espaçamento e forma

### 5.1 Espaçamento (base 4 px)

```css
:root {
  --space-1: 0.25rem;  /*  4 */
  --space-2: 0.5rem;   /*  8 */
  --space-3: 0.75rem;  /* 12 */
  --space-4: 1rem;     /* 16 */
  --space-5: 1.5rem;   /* 24 */
  --space-6: 2rem;     /* 32 */
  --space-7: 3rem;     /* 48 */
  --space-8: 4rem;     /* 64 */
  --space-9: 6rem;     /* 96 */
}
```

| Relação | Espaço |
|---|---|
| Ícone e texto | `--space-2` |
| Dentro de card | `--space-4` |
| Entre cards | `--space-5` (mobile `--space-4`) |
| Entre seções | `--space-8` (mobile `--space-7`) |

### 5.2 Grid e containers

```css
:root {
  --container-max: 1280px;
  --container-prose: 720px;
  --gutter: clamp(1rem, 4vw, 2rem);
  --card-min: 160px;  /* mobile */
}

.container {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
  gap: var(--space-5);
}

@media (min-width: 640px)  { :root { --card-min: 180px; } }
@media (min-width: 1024px) { :root { --card-min: 200px; } }
```

| Breakpoint | Largura | Colunas aproximadas |
|---|---|---|
| Base (mobile) | < 640 px | 2 |
| `sm` | ≥ 640 px | 3 |
| `md` | ≥ 768 px | 4 |
| `lg` | ≥ 1024 px | 5 |
| `xl` | ≥ 1280 px | 6 |

Isso substitui os cards com largura fixa de 30%.

### 5.3 Raios

```css
:root {
  --radius-sm:   4px;   /* badges, foco */
  --radius-md:   8px;   /* botões, inputs */
  --radius-lg:   12px;  /* cards, pôster */
  --radius-xl:   16px;  /* modais, hero */
  --radius-full: 999px; /* chips, busca */
}
```

Forma da marca: **cantos suaves, nunca totalmente redondos em superfícies grandes.** O pôster usa `--radius-lg`, como um cartaz levemente gasto.

### 5.4 Elevação

Usar os tokens de `tokens.css`: `--elevation-1` (cards), `--elevation-2` (hover, dropdown), `--elevation-3` (modal). Sombras sempre neutras; o único brilho dourado permitido é `--shadow-glow-accent` em item selecionado.

---

## 6. Iconografia

- **Biblioteca:** `react-icons`, já instalada. Usar **um único conjunto**: Lucide (`react-icons/lu`). Traço uniforme combina com Manrope.
- **Tamanhos:** 16 px (inline com texto), 20 px (botões e navbar), 24 px (destaques).
- **Traço:** padrão do conjunto (2 px). Não misturar ícones preenchidos e de contorno, com uma exceção: a **estrela da nota é preenchida e dourada**.
- **Cor:** herda `currentColor`. Ícones decorativos com `aria-hidden="true"`; ícones sozinhos em botão exigem `aria-label`.

| Função | Ícone sugerido |
|---|---|
| Busca | `LuSearch` |
| Nota | `LuStar` (preenchido) |
| Duração | `LuClock` |
| Orçamento | `LuWallet` |
| Receita | `LuTrendingUp` |
| Data de lançamento | `LuCalendar` |
| Voltar | `LuArrowLeft` |
| Erro | `LuCircleAlert` |
| Sem resultados | `LuFilm` |

---

## 7. Imagens e pôsteres

- **Proporção fixa 2:3** com `aspect-ratio: 2 / 3` e `object-fit: cover`. O card nunca "pula" de altura enquanto a imagem carrega.
- **Tamanhos do TMDB:** `w342` no grid, `w500` na página de detalhes, `w780` ou `original` só para backdrop.
- **Backdrop no hero de detalhes:** imagem `w1280` com dois scrims sobrepostos: `--gradient-poster-scrim` de baixo para cima e um gradiente lateral de `--color-bg` para transparente, garantindo texto legível.
- **Pôster ausente:** placeholder com fundo `--color-surface-elevated`, ícone `LuFilm` em `--color-text-disabled` e o título do filme em Fraunces abaixo. Nunca a imagem quebrada.
- **Carregamento:** `loading="lazy"` e `decoding="async"` em todos os pôsteres do grid; skeleton (`.skeleton`) até carregar.
- **Texto alternativo:** `alt="Pôster de {título}"`.
- **Nunca** aplicar filtro, saturação ou overlay dourado sobre o pôster. A imagem é do filme, não da marca.

---

## 8. Movimento

Movimento discreto, como a luz de uma sala diminuindo.

```css
:root {
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 120ms;  /* hover de cor */
  --duration-base: 200ms;  /* cards, botões */
  --duration-slow: 360ms;  /* entrada de página, modal */
}
```

| Interação | Efeito |
|---|---|
| Hover em card | Sobe 4 px (`translateY(-4px)`), troca para `--elevation-2`, pôster com `scale(1.03)` dentro do recorte |
| Hover em botão/link | Só troca de cor, `--duration-fast` |
| Entrada do grid | Fade + subida de 8 px, com atraso escalonado de 30 ms por card (máximo 10 cards) |
| Modal | Fade do backdrop + escala de 0.98 para 1 |

Com `prefers-reduced-motion: reduce`: sem deslocamentos nem escalas, só mudanças de cor e opacidade.

---

## 9. Componentes

### 9.1 Navbar

- Fixa no topo, altura 64 px, fundo `--nav-bg` com `backdrop-filter: blur(12px)` e borda inferior `--nav-border`.
- Esquerda: wordmark Cine·lux (link para `/`, `aria-label="Cinelux, início"`). No mobile (< 640 px): monograma.
- Direita: campo de busca em formato pílula (`--radius-full`), `--input-bg`, ícone `LuSearch` dentro do campo, botão com `aria-label="Buscar"`.
- `<label>` visualmente oculto: "Buscar filmes".
- No mobile, a busca ocupa a largura toda numa segunda linha.

### 9.2 MovieCard

```
┌───────────────────┐
│                   │
│    Pôster 2:3     │  radius-lg, aspect-ratio 2/3
│                   │
│ ★ 8.7             │  badge sobre o pôster (canto inferior esquerdo, com scrim)
└───────────────────┘
  Título do Filme     Fraunces 600, text-sm→md, 2 linhas no máximo
  2024 · 2h 15min     text-data, text-tertiary
```

- O card inteiro é o link (`<a>` envolvendo), não um botão "Detalhes" separado.
- Badge de nota: `.badge` + `.text-rating`, uma casa decimal.
- Foco: `--focus-ring` no card inteiro.

### 9.3 Página de detalhes

1. **Hero:** backdrop com scrims, pôster `w500` à esquerda (desktop) e, à direita:
   - título em `.text-hero`;
   - tagline em `.text-tagline`;
   - linha de metadados em `.text-data` (ano · duração · nota);
   - gêneros como `.badge`.
2. **Sinopse:** `h2` "Sinopse" + `.text-prose`.
3. **Ficha:** grade de pares rótulo/valor (`.text-label` em cima, `.text-data` embaixo): Orçamento, Receita, Duração, Lançamento.
4. Mobile: pôster acima do título, tudo em uma coluna.

### 9.4 Estados obrigatórios

| Estado | Visual | Texto |
|---|---|---|
| Carregando | Grid de skeletons com a mesma forma dos cards | (sem texto; `aria-busy="true"` no container) |
| Sem resultados | Ícone `LuFilm`, título em Fraunces, texto em `--color-text-secondary` | "Nenhum filme encontrado para "{termo}"." |
| Erro de API | `.alert-danger` com ícone e botão secundário | "Não conseguimos carregar os filmes agora." + botão "Tentar de novo" |
| 404 | Página centralizada com monograma grande | "Esta sessão não existe." + link "Voltar ao início" |

---

## 10. Voz e microcopy

**Tom:** cordial, curto, com leve sotaque de cinema, sem forçar trocadilhos.

| Situação | Use | Evite |
|---|---|---|
| Título da home | Melhores avaliados | Top Rated Movies |
| Placeholder da busca | Buscar um filme… | Digite aqui |
| Link do card | (o card todo é clicável) | Detalhes |
| Valor ausente | Não informado | $0.00 / undefined |
| Duração | 2h 15min | 135 minutes |
| Moeda | US$ 160.000.000 | $160,000,000.00 |
| Erro genérico | Algo saiu do roteiro. Tente de novo. | Error: TypeError |

Regras:

- Interface **toda em pt-BR**, inclusive `lang="pt-BR"` e `language=pt-BR` nas chamadas ao TMDB.
- **Preparado para outros idiomas:** nenhum texto de interface escrito direto nos componentes. Todos ficam em `src/i18n/pt-BR.ts`, para a versão em inglês (`en.ts`) entrar depois sem refatoração. O nome Cinelux e o logo nunca são traduzidos.
- Valores com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })`.
- Sem ponto final em botões e títulos; com ponto final em frases completas.

---

## 11. Acessibilidade

- Contrastes validados em `tokens.css` (texto ≥ 4.5:1, controles ≥ 3:1).
- Foco sempre visível com `--focus-ring`; nunca `outline: none` sem substituto.
- Tamanho mínimo de alvo de toque: 44 × 44 px (botão de busca, cards).
- Texto base nunca abaixo de 16 px; rótulos de 12 px só em caixa alta e com tracking.
- Informação nunca só pela cor: erro tem ícone e texto; nota tem estrela e número.
- `prefers-reduced-motion` e `forced-colors` respeitados.
- Títulos em ordem (`h1` único por página, sem pular níveis).

---

## 12. Implementação

### 12.1 `index.html`

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#07090d" />
    <meta name="description" content="Cinelux: seu acervo de cinema. Busque filmes, veja notas, sinopses e detalhes." />
    <title>Cinelux · Seu acervo de cinema</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="canonical" href="https://cinelux.app/" />
    <meta property="og:title" content="Cinelux" />
    <meta property="og:description" content="Seu acervo de cinema." />
    <meta property="og:url" content="https://cinelux.app/" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400..700&display=swap"
    />

    <link rel="preconnect" href="https://image.tmdb.org" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 12.2 Estrutura de estilos

```
src/styles/
├── tokens.css        # cores, efeitos (já entregue)
├── typography.css    # seção 4.6
├── layout.css        # seções 5.1 a 5.3 e 8
└── base.css          # reset leve, html/body, foco
```

Importar uma vez em `main.jsx`, nesta ordem:

```js
import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/layout.css";
import "./styles/base.css";
```

Os CSS existentes (`Navbar.css`, `MovieCard.css`, `MoviesGrid.css`, `Movie.css`, `index.css`) passam a usar **apenas tokens**: nenhum HEX, `px` de fonte ou família escrita direto.

### 12.3 Mapeamento do CSS atual

| Hoje | Passa a ser |
|---|---|
| `background: #000` em `body` e `.app-container` | Só em `body`, via `--gradient-page` |
| `font-family: Helvetica` | `--font-sans` (herdado de `html`) |
| `.movies-container div` | `.movies-grid > .movie-card` |
| Cards com `width: 30%` | Grid `auto-fill` (seção 5.2) |
| Nota `vote_average` cru | `.text-rating` com `toFixed(1)` |
| Título "Vite App", `lang="en"` | Seção 12.1 |

### 12.4 Migração do nome

1. `package.json`: `"name": "cinelux"`.
2. Renomear o repositório no GitHub para `cinelux` (o GitHub redireciona o endereço antigo).
3. Na Vercel: renomear o projeto e adicionar o domínio `cinelux.app`.
4. Trocar o texto "MoviesLib" da `Navbar.jsx` pelo wordmark (seção 2.2) com `aria-label`.
5. Reescrever o README com o novo nome, o logo e a tagline; remover "Filmes Explorer".
6. Substituir `public/vite.svg` e `src/logo.svg` pelo `favicon.svg` (seção 2.4).

---

## 13. Faça e não faça

| Faça | Não faça |
|---|---|
| Deixe o pôster ser o elemento mais colorido da tela | Colocar dourado em fundos grandes ou em vários botões juntos |
| Use Fraunces para todo nome de filme | Usar Fraunces em texto corrido, botões ou rótulos |
| Use mono para todo número (nota, ano, duração, valor) | Misturar números proporcionais e tabulares na mesma lista |
| Crie hierarquia com tamanho, peso e cor de texto | Criar hierarquia com mais cores de acento |
| Use tokens em todo CSS | Escrever HEX ou tamanhos soltos nos componentes |
| Mostre estados de carregamento, vazio e erro | Deixar a tela em branco ou quebrar com `undefined` |
| Mantenha gradientes sutis (≤ 10% de opacidade no ouro) | Usar gradiente dourado em textos ou superfícies |

---

*Cinelux · Identidade Visual v3.0.0*
