import type { Page } from "@playwright/test";
import { collection2344 } from "../fixtures/index.ts";
import { deferred, expect, test } from "../helpers/test.ts";
import type { CollectionDetails, MovieSummary } from "../../src/types/tmdb.ts";

/** Página de coleção: cabeçalho, sequência, casos especiais, erros e compartilhar (D-68). */

const PATH = "/colecao/2344";
const ENDPOINT = "collection/2344";

/** PNG branco: a imagem de fundo mais clara possível, o pior caso para o contraste. */
const WHITE_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAIAAAC0SDtlAAAAF0lEQVR4nGP8//8/AymAiSTVoxpopQEAMWADD3qy2BsAAAAASUVORK5CYII=",
  "base64",
);

const part = (
  id: number,
  title: string,
  release_date?: string,
  poster: string | null = "/p.jpg",
): MovieSummary => ({
  id,
  title,
  poster_path: poster,
  ...(release_date === undefined ? {} : { release_date }),
});

const withCollection = (overrides: Partial<CollectionDetails>): { body: CollectionDetails } => ({
  body: { ...collection2344, ...overrides },
});

const parts = (page: Page) =>
  page.getByRole("list", { name: "Filmes da coleção" }).getByRole("listitem");

test.describe("Coleção: conteúdo", () => {
  test("cabeçalho com período e quantidade, filmes numerados na ordem de lançamento", async ({
    page,
  }) => {
    await page.goto(PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(collection2344.name);
    await expect(page.locator(".collection-hero__facts")).toHaveText("1999–2003 · 3 filmes");

    // A numeração acompanha a ordem de lançamento, não a ordem que veio do TMDB.
    await expect(parts(page).locator(".collection-part__number")).toHaveText(["01", "02", "03"]);
    await expect(parts(page).getByRole("heading", { level: 3 })).toHaveText([
      "Matrix",
      "Matrix Reloaded",
      "Matrix Revolutions",
    ]);
    // O número é só visual: a lista ordenada já anuncia a posição.
    await expect(parts(page).first().locator(".collection-part__number")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    // Um único h1, e o card leva ao detalhe.
    await expect(page.locator("h1")).toHaveCount(1);
    await parts(page).first().getByRole("link").click();
    await expect(page).toHaveURL("/movie/603");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Matrix");
  });

  test("sem imagem, sem descrição, sem pôster e sem data: cabeçalho compacto e 'Em breve'", async ({
    page,
    tmdb,
  }) => {
    tmdb.on(
      ENDPOINT,
      withCollection({
        backdrop_path: null,
        overview: "",
        parts: [
          part(2, "Sequência", "2003-05-15"),
          part(3, "Anunciado", undefined, null),
          part(1, "Original", "1999-03-31"),
        ],
      }),
    );
    await page.goto(PATH);

    await expect(page.locator(".collection-hero")).toHaveClass(/collection-hero--plain/);
    await expect(page.locator(".collection-hero img")).toHaveCount(0);
    await expect(
      page.getByText("Esta coleção ainda não tem descrição em português."),
    ).toBeVisible();

    const last = parts(page).last();
    await expect(last.locator(".collection-part__number")).toHaveText("03");
    await expect(last.locator(".poster-card__meta")).toHaveText("Em breve");
    await expect(last.locator(".collection-part__badge")).toHaveText("Em breve");
    await expect(last).not.toContainText("Sem data");
    // O período considera só os filmes com data.
    await expect(page.locator(".collection-hero__facts")).toHaveText("1999–2003 · 3 filmes");
  });

  test("um filme só: ano único e singular", async ({ page, tmdb }) => {
    tmdb.on(ENDPOINT, withCollection({ parts: [part(1, "Único", "2021-09-30")] }));
    await page.goto(PATH);
    await expect(page.locator(".collection-hero__facts")).toHaveText("2021 · 1 filme");
    await expect(parts(page)).toHaveCount(1);
  });

  test("coleção vazia: aviso com caminho para descobrir, sem período", async ({ page, tmdb }) => {
    tmdb.on(ENDPOINT, withCollection({ parts: [] }));
    await page.goto(PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(collection2344.name);
    await expect(page.getByText("Esta coleção ainda não tem filmes")).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Descobrir filmes" }),
    ).toHaveAttribute("href", "/discover");
    await expect(page.locator(".collection-hero__facts")).toHaveCount(0);
  });

  test("nome longo cabe em até três linhas, sem cortar", async ({ page, tmdb }) => {
    const name = "Star Trek: Realidade Alternativa - Coleção";
    tmdb.on(ENDPOINT, withCollection({ name }));
    await page.goto(PATH);
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toHaveText(name);
    const [lines, overflow] = await title.evaluate((element) => [
      Math.round(
        element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight),
      ),
      element.scrollWidth - element.clientWidth,
    ]);
    expect(lines).toBeLessThanOrEqual(3);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("mostra o esqueleto enquanto carrega, sem salto para o conteúdo", async ({ page, tmdb }) => {
    const gate = deferred();
    tmdb.on(ENDPOINT, { body: collection2344, waitFor: gate.promise });
    await page.goto(PATH);
    await expect(page.locator("main[aria-busy='true']")).toBeVisible();
    gate.resolve();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(collection2344.name);
    await expect(page.locator("main[aria-busy='true']")).toHaveCount(0);
  });
});

test.describe("Coleção: erros", () => {
  test("inexistente: título próprio e caminhos, sem 'Tentar novamente'", async ({
    page,
    tmdb,
    consoleErrors,
  }) => {
    consoleErrors.allow(/404/);
    tmdb.on(ENDPOINT, { status: 404, body: { status_code: 34 } });
    await page.goto(PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Coleção não encontrada");
    await expect(page).toHaveTitle("Coleção não encontrada · Cinelux");
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toHaveCount(0);
    await expect(
      page.getByRole("main").getByRole("link", { name: "Descobrir filmes" }),
    ).toBeVisible();
  });

  test("falha temporária: mensagem clara e nova tentativa que funciona", async ({
    page,
    tmdb,
    consoleErrors,
  }) => {
    consoleErrors.allow(/503/);
    // O erro do carregamento antecipado fica guardado para a página: uma consulta só.
    tmdb.on(ENDPOINT, { status: 503, body: { status_code: 9 } }, { times: 1 });
    await page.goto(PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Não foi possível abrir esta coleção",
    );
    await expect(page.getByRole("alert")).toContainText("indisponível");
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(collection2344.name);
  });

  test("falha técnica não mostra detalhes do servidor", async ({ page, tmdb, consoleErrors }) => {
    consoleErrors.allow(/401/);
    tmdb.on(ENDPOINT, { status: 401, body: { status_code: 7 } });
    await page.goto(PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Não foi possível abrir esta coleção",
    );
    await expect(page.getByRole("alert")).not.toContainText(/chave|TMDB é inválida/i);
    await expect(page.getByRole("alert")).toContainText("não respondeu como esperado");
  });

  test("identificador inválido vai para a 404 do site sem consultar a API", async ({
    page,
    tmdb,
  }) => {
    await page.goto("/colecao/abc");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esta cena foi cortada");
    expect(tmdb.calls.filter((url) => url.pathname.includes("collection"))).toEqual([]);
  });
});

test.describe("Coleção: compartilhar", () => {
  test("usa a folha do sistema com o nome da coleção", async ({ page }) => {
    await page.addInitScript(() => {
      const shared: unknown[] = [];
      Object.assign(window, { __shared: shared });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: (data: unknown) => {
          shared.push(data);
          return Promise.resolve();
        },
      });
    });
    await page.goto(PATH);
    await page.getByRole("button", { name: "Compartilhar" }).click();
    const shared = await page.evaluate(
      () => (window as unknown as { __shared: unknown[] }).__shared,
    );
    expect(shared).toEqual([{ title: collection2344.name, url: page.url() }]);
  });

  test("sem a folha do sistema, copia o link pelo teclado e avisa", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(PATH);
    await page.getByRole("button", { name: "Compartilhar" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Link copiado" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Avisos" })).toContainText("Link copiado");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
  });
});

test.describe("Coleção: contraste do cabeçalho", () => {
  test("texto com pelo menos 4,5:1 mesmo sobre uma imagem de fundo branca", async ({ page }) => {
    await page.route("https://image.tmdb.org/**", (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: WHITE_PNG }),
    );
    await page.goto(PATH);
    await expect(page.locator(".collection-hero__media img")).toBeVisible();
    await page.waitForFunction(
      () => document.querySelector<HTMLImageElement>(".collection-hero__media img")?.complete,
    );

    const texts = page.locator(".collection-hero__content > :is(p, h1)");
    const targets = await texts.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return {
          color: getComputedStyle(element).color,
          box: [box.x, box.y, box.width, box.height],
        };
      }),
    );
    // Esconde só o texto (pelo próprio elemento: a CSP proíbe estilos injetados) e mede o
    // fundo que fica sob ele.
    await texts.evaluateAll((elements) => {
      for (const element of elements) (element as HTMLElement).style.visibility = "hidden";
    });
    const shot = (await page.screenshot()).toString("base64");

    // A leitura dos pixels acontece numa página em branco, fora do site: a CSP do site
    // (corretamente) não aceita imagens data:.
    const tool = await page.context().newPage();
    const worst = await tool.evaluate(
      async ({ shot, targets, viewport }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${shot}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        if (!context) return 0;
        context.drawImage(image, 0, 0);
        const scale = image.width / viewport;
        const luminance = ([r, g, b]: number[]) => {
          const f = (c: number) =>
            (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          return 0.2126 * f(r ?? 0) + 0.7152 * f(g ?? 0) + 0.0722 * f(b ?? 0);
        };
        let min = 21;
        for (const { color, box } of targets) {
          const text = (color.match(/\d+/g) ?? []).slice(0, 3).map(Number);
          const [x = 0, y = 0, w = 0, h = 0] = box.map((v) => Math.round(v * scale));
          const data = context.getImageData(x, y, Math.max(1, w), Math.max(1, h)).data;
          for (let i = 0; i < data.length; i += 4 * 7) {
            const a = luminance(text);
            const b = luminance([data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0]);
            min = Math.min(min, (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05));
          }
        }
        return min;
      },
      { shot, targets, viewport: page.viewportSize()?.width ?? 1 },
    );
    await tool.close();
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });
});
