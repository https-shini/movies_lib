import { expect, expectNoHorizontalScroll, isDesktopLayout, test } from "../helpers/test.ts";

/**
 * Roda em cada projeto de tamanho de tela (320, 375, 768, 1024 e 1440 px).
 * Abaixo de 900 px a navegação fica na barra inferior; a partir de 900 px, no cabeçalho.
 */
test.describe("Responsividade", () => {
  const routes = [
    "/",
    "/discover",
    "/search",
    "/search?q=duna",
    "/movie/550",
    "/serie/1396",
    "/pessoa/287",
    "/pessoas",
    "/colecao/2344",
    "/search?q=duna&tipo=series",
    "/discover?tipo=series",
    "/sobre",
    "/privacidade",
    "/rota-que-nao-existe",
  ];

  for (const path of routes) {
    test(`sem rolagem horizontal em ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);

      await expectNoHorizontalScroll(page);
    });
  }

  test("navegação principal adequada à largura", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const headerNav = page.getByRole("navigation", { name: "Principal", exact: true });
    const tabBar = page.getByRole("navigation", { name: "Navegação principal" });
    const headerSearch = page.getByRole("searchbox", { name: "Buscar filmes", exact: true });
    const searchIcon = page.getByRole("banner").getByRole("link", { name: "Buscar filmes" });

    if (isDesktopLayout(page)) {
      await expect(headerNav).toBeVisible();
      await expect(headerSearch).toBeVisible();
      await expect(tabBar).toBeHidden();
      await expect(searchIcon).toBeHidden();
      await expect(headerNav.getByRole("link", { name: "Descobrir" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    } else {
      await expect(tabBar).toBeVisible();
      await expect(headerNav).toBeHidden();
      await expect(headerSearch).toBeHidden();
      await expect(searchIcon).toBeVisible();

      const tabs = tabBar.getByRole("link");
      await expect(tabs).toHaveText(["Início", "Descobrir", "Pessoas", "Buscar"]);
      await expect(tabBar.getByRole("link", { name: "Descobrir" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      // Todos os itens na mesma linha e dentro da tela (a barra não quebra em duas linhas).
      const boxes = await tabs.evaluateAll((links) =>
        links.map((link) => {
          const { top, right, bottom } = link.getBoundingClientRect();
          return { top: Math.round(top), right, bottom };
        }),
      );
      const screen = page.viewportSize() ?? { width: 0, height: 0 };
      expect(new Set(boxes.map((box) => box.top)).size).toBe(1);
      for (const box of boxes) {
        expect(box.right).toBeLessThanOrEqual(screen.width);
        expect(box.bottom).toBeLessThanOrEqual(screen.height);
      }
      // Alvos de toque de pelo menos 44 px de altura.
      for (const box of await tabs.evaluateAll((links) =>
        links.map((link) => link.getBoundingClientRect().height),
      )) {
        expect(box).toBeGreaterThanOrEqual(44);
      }
      // A barra fica fixa na parte de baixo da tela.
      const bar = await tabBar.boundingBox();
      const viewport = page.viewportSize();
      expect(bar && viewport && Math.round(bar.y + bar.height)).toBe(viewport?.height);
    }
  });

  test("diálogos cabem na tela", async ({ page }) => {
    const viewport = page.viewportSize();

    await page.goto("/discover");
    await page.getByRole("button", { name: "Filtros" }).click();
    const filters = page.getByRole("dialog", { name: "Filtros" });
    await expect(filters).toBeVisible();
    const filtersBox = await filters.boundingBox();
    expect(filtersBox?.width).toBeLessThanOrEqual(viewport?.width ?? 0);
    await expectNoHorizontalScroll(page);
    await page.keyboard.press("Escape");

    await page.goto("/movie/550");
    await page.getByRole("button", { name: "Assistir trailer" }).click();
    const trailer = page.getByRole("dialog", { name: "Trailer: Clube da Luta" });
    await expect(trailer).toBeVisible();
    const trailerBox = await trailer.boundingBox();
    expect(trailerBox?.width).toBeLessThanOrEqual(viewport?.width ?? 0);
    await expectNoHorizontalScroll(page);
  });
});
