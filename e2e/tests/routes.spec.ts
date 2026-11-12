import { FEATURED_MOVIE } from "../fixtures/index.ts";
import { expect, test } from "../helpers/test.ts";

const TMDB_NOTICE =
  "This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.";

test.describe("Rotas", () => {
  const directRoutes = [
    { path: "/", heading: FEATURED_MOVIE.title, title: "Cinelux · Seu acervo de cinema" },
    { path: "/discover?genre=18", heading: "Filmes de drama", title: "Descobrir filmes · Cinelux" },
    { path: "/search?q=duna", heading: "Resultados para “duna”", title: "Busca: duna · Cinelux" },
    { path: "/movie/550", heading: "Clube da Luta", title: "Clube da Luta · Cinelux" },
    { path: "/serie/1396", heading: "Breaking Bad", title: "Breaking Bad · Cinelux" },
    { path: "/pessoa/287", heading: "Brad Pitt", title: "Brad Pitt · Cinelux" },
    { path: "/pessoas", heading: "Pessoas", title: "Pessoas · Cinelux" },
    { path: "/colecao/2344", heading: "Matrix: Coleção", title: "Matrix: Coleção · Cinelux" },
    {
      path: "/discover?tipo=series&genre=18",
      heading: "Séries de drama",
      title: "Descobrir séries · Cinelux",
    },
    { path: "/sobre", heading: "Sobre o Cinelux", title: "Sobre · Cinelux" },
    { path: "/privacidade", heading: "Privacidade", title: "Privacidade · Cinelux" },
  ];

  for (const { path, heading, title } of directRoutes) {
    test(`abre ${path} diretamente pela URL`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page).toHaveTitle(title);
    });
  }

  test("restaura os filtros de Descobrir a partir da URL", async ({ page, tmdb }) => {
    await page.goto("/discover?genre=18&sort=vote_average.desc&year=1999");

    await expect(page.getByRole("button", { name: "Drama", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByLabel("Ordenar por")).toHaveValue("vote_average.desc");
    await expect(page.getByRole("button", { name: "Remover filtro Ano 1999" })).toBeVisible();

    const call = tmdb.callsTo("discover/movie").at(-1);
    expect(call?.searchParams.get("with_genres")).toBe("18");
    expect(call?.searchParams.get("sort_by")).toBe("vote_average.desc");
    expect(call?.searchParams.get("primary_release_year")).toBe("1999");
  });

  test("mostra a página 404 para endereços inexistentes", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esta cena foi cortada");
    await expect(page).toHaveTitle("Página não encontrada · Cinelux");

    await page.getByRole("link", { name: "Descobrir filmes" }).click();
    await expect(page).toHaveURL("/discover");
  });

  test("mostra a página 404 para filmes com ID inválido, sem consultar a API", async ({
    page,
    tmdb,
  }) => {
    await page.goto("/movie/abc");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esta cena foi cortada");
    expect(tmdb.calls.filter((url) => url.pathname.startsWith("/api/tmdb/movie/abc"))).toEqual([]);
  });
});

test.describe("Rodapé e créditos", () => {
  test("rodapé com navegação e créditos do TMDB e do JustWatch", async ({ page }) => {
    await page.goto("/");

    const footer = page.getByRole("contentinfo");
    const nav = footer.getByRole("navigation", { name: "Rodapé" });
    for (const [name, href] of [
      ["Início", "/"],
      ["Descobrir", "/discover"],
      ["Pessoas", "/pessoas"],
      ["Buscar", "/search"],
      ["Sobre", "/sobre"],
      ["Privacidade", "/privacidade"],
    ] as const) {
      await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
    }

    for (const [name, href] of [
      ["TMDB", "https://www.themoviedb.org/"],
      ["JustWatch", "https://www.justwatch.com/"],
    ] as const) {
      const link = footer.getByRole("link", { name, exact: true });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }

    await nav.getByRole("link", { name: "Sobre", exact: true }).click();
    await expect(page).toHaveURL("/sobre");
  });

  test("página Sobre com o logo e o aviso exigidos pelo TMDB", async ({ page }) => {
    await page.goto("/sobre");

    const logo = page.getByRole("img", { name: "The Movie Database (TMDB)" });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", "/tmdb-logo.svg");
    expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    const notice = page.locator('blockquote[lang="en"]');
    await expect(notice).toHaveText(TMDB_NOTICE);
    await expect(page.getByRole("link", { name: /Visitar o JustWatch/ })).toHaveAttribute(
      "href",
      "https://www.justwatch.com/",
    );
  });
});

test.describe("Fontes", () => {
  test("as duas famílias carregam do próprio site", async ({ page }) => {
    const fontRequests: string[] = [];
    page.on("requestfinished", (request) => {
      if (request.resourceType() === "font") fontRequests.push(new URL(request.url()).host);
    });

    await page.goto("/movie/550");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    // Força o carregamento de cada estilo latino declarado em src/styles/fonts.css
    // (o navegador só baixa sob demanda os estilos usados na página).
    const loaded = await page.evaluate(async () => {
      const faces = [
        '400 16px "DM Sans"',
        '800 16px "DM Sans"',
        '500 16px "Space Grotesk"',
        '700 16px "Space Grotesk"',
      ];
      const results = await Promise.all(faces.map((face) => document.fonts.load(face, "Cinelux")));
      return results.map(
        (list) => list.length > 0 && list.every((face) => face.status === "loaded"),
      );
    });
    expect(loaded).toEqual([true, true, true, true]);
    expect(fontRequests.length).toBeGreaterThan(0);
    expect(new Set(fontRequests)).toEqual(new Set([new URL(page.url()).host]));
  });
});

test.describe("Privacidade", () => {
  test("descreve hospedagem, registros e direitos, sem inventar o responsável", async ({
    page,
  }) => {
    await page.goto("/privacidade");

    for (const heading of [
      "Estatísticas de visitas (Vercel Web Analytics)",
      "Desempenho (Vercel Speed Insights)",
      "Para que usamos os dados",
      "Conteúdo de outros serviços",
      "Cookies e armazenamento no navegador",
      "Onde os dados são tratados",
      "Registros técnicos",
      "Por quanto tempo guardamos",
      "Seus direitos",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    }
    await expect(page.getByText("Lei nº 13.709/2018, art. 18")).toBeVisible();
    await expect(page.getByText(/tratados no exterior/)).toBeVisible();
    await expect(page.getByText(/O Cinelux não grava cookies/)).toBeVisible();
    // O Google Fonts deixou de ser usado e não aparece mais entre os serviços externos.
    await expect(page.getByText("Google Fonts")).toHaveCount(0);
    // Enquanto o proprietário não preencher src/config/legal.ts, a seção não aparece.
    await expect(page.getByRole("heading", { name: "Responsável e contato" })).toHaveCount(0);
    // As bases legais são escolha do controlador: sem preenchimento, a seção não aparece.
    await expect(page.getByRole("heading", { name: "Bases legais" })).toHaveCount(0);
  });
});
