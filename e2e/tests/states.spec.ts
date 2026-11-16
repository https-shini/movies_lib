import { FEATURED_MOVIE, movies, searchDuna } from "../fixtures/index.ts";
import { deferred, expect, expectNoHorizontalScroll, test } from "../helpers/test.ts";

const UNAVAILABLE = {
  status: 503,
  body: { status_code: 503, status_message: "Service Unavailable" },
};

test.describe("Estados da aplicação", () => {
  test("mostra esqueletos enquanto os dados carregam", async ({ page, tmdb }) => {
    const gate = deferred();
    tmdb.on("search/movie", { body: searchDuna[1], waitFor: gate.promise });

    await page.goto("/search?q=duna");

    const loading = page.getByLabel("Carregando filmes");
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(page.getByText("Buscando…")).toBeVisible();

    gate.resolve();

    await expect(loading).toHaveCount(0);
    await expect(page.getByText("3 resultados")).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Resultados da busca" }).getByRole("listitem"),
    ).toHaveCount(searchDuna[1].results.length);
  });

  test("mostra o destaque em carregamento na página inicial", async ({ page, tmdb }) => {
    const gate = deferred();
    tmdb.on("movie/popular", { body: movies, waitFor: gate.promise });
    await page.goto("/");

    const loading = page.getByRole("region", { name: "Carregando destaque" });
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("list", { name: "Carregando Em alta" })).toBeVisible();

    gate.resolve();

    await expect(loading).toHaveCount(0);
    await expect(page.getByRole("list", { name: "Carregando Em alta" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: FEATURED_MOVIE.title })).toBeVisible();
  });

  test("erro 503 na página inicial e recuperação com Tentar novamente", async ({
    page,
    tmdb,
    consoleErrors,
  }) => {
    consoleErrors.allow(/status of 503/);
    tmdb.on("movie/popular", UNAVAILABLE, { times: 1 });

    await page.goto("/");

    const alert = page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível carregar os destaques" });
    await expect(alert).toContainText("O TMDB está indisponível no momento. Tente mais tarde.");
    // As outras seções continuam funcionando.
    await expect(page.getByRole("heading", { name: "Os 10 mais bem avaliados" })).toBeVisible();

    await alert.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(alert).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: FEATURED_MOVIE.title })).toBeVisible();
    expect(tmdb.callsTo("movie/popular")).toHaveLength(2);
  });

  test("erro 503 na busca e recuperação com Tentar novamente", async ({
    page,
    tmdb,
    consoleErrors,
  }) => {
    consoleErrors.allow(/status of 503/);
    tmdb.on("search/movie", UNAVAILABLE, { times: 1 });

    await page.goto("/search?q=duna");

    const alert = page.getByRole("alert");
    await expect(alert).toContainText("Não foi possível carregar");
    await expect(alert).toContainText("O TMDB está indisponível no momento.");
    await expect(page.getByRole("navigation", { name: "Paginação dos resultados" })).toHaveCount(0);

    await alert.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByText("3 resultados")).toBeVisible();
  });

  test("erro de seção: a ação cabe na faixa e fica alinhada ao texto (D-71)", async ({
    page,
    tmdb,
    consoleErrors,
  }) => {
    consoleErrors.allow(/status of 503/);
    tmdb.on("genre/movie/list", UNAVAILABLE);

    await page.goto("/");

    const alert = page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível carregar os gêneros" });
    await alert.scrollIntoViewIfNeeded();
    const retry = alert.getByRole("button", { name: "Tentar novamente" });
    await expect(retry).toBeVisible();
    await expectNoHorizontalScroll(page);

    const box = async (locator: typeof alert) => {
      const rect = await locator.boundingBox();
      if (!rect) throw new Error("elemento sem caixa");
      return rect;
    };
    const panel = await box(alert);
    const button = await box(retry);
    const title = await box(alert.getByText("Não foi possível carregar os gêneros"));
    // O botão fica dentro do painel e nunca volta para baixo do ícone.
    expect(button.x).toBeGreaterThanOrEqual(title.x - 1);
    expect(button.x + button.width).toBeLessThanOrEqual(panel.x + panel.width + 1);
    expect(button.height).toBeGreaterThanOrEqual(44);
  });

  test("estado de seção continua delimitado no alto contraste (D-71)", async ({ page, tmdb }) => {
    await page.emulateMedia({ forcedColors: "active" });
    tmdb.on("search/movie", { body: { page: 1, results: [], total_pages: 0, total_results: 0 } });

    await page.goto("/search?q=zzzz");

    const mark = page.getByRole("status").locator(".state__mark");
    await expect(mark).toBeVisible();
    const borderWidth = await mark.evaluate((node) => getComputedStyle(node).borderTopWidth);
    expect(Number.parseFloat(borderWidth)).toBeGreaterThan(0);
  });

  const errorCases = [
    {
      name: "chave ausente no servidor",
      response: { status: 500, body: { code: "missing_server_key" } },
      message: "A chave do TMDB não está configurada no servidor.",
    },
    {
      name: "limite de requisições",
      response: { status: 429, body: { status_code: 25 } },
      message: "Muitas consultas em pouco tempo.",
    },
    {
      name: "TMDB sem resposta",
      response: { status: 504, body: { code: "upstream_unavailable" } },
      message: "O TMDB não respondeu a tempo.",
    },
  ] as const;

  for (const { name, response, message } of errorCases) {
    test(`traduz o erro do proxy: ${name}`, async ({ page, tmdb, consoleErrors }) => {
      consoleErrors.allow(new RegExp(`status of ${String(response.status)}`));
      tmdb.on("discover/movie", response);

      await page.goto("/discover");

      await expect(page.getByRole("alert")).toContainText(message);
    });
  }
});
