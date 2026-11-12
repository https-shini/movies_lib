import type { Locator, Page } from "@playwright/test";
import { expect, isDesktopLayout, test } from "../helpers/test.ts";

/** Pressiona Tab até o elemento receber o foco (falha se não chegar em `max` passos). */
async function tabTo(page: Page, target: Locator, max = 60): Promise<void> {
  for (let step = 0; step < max; step += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`O elemento não recebeu foco pelo teclado em ${String(max)} tabulações.`);
}

/** Elementos interativos visíveis sem nome acessível (texto, aria-label, rótulo ou título). */
function findUnnamedControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const selector =
      'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
    const textOf = (id: string) => document.getElementById(id)?.textContent ?? "";
    const labelsOf = (element: HTMLElement) => [
      ...Array.from(
        element.id ? document.querySelectorAll(`label[for="${CSS.escape(element.id)}"]`) : [],
        (label) => label.textContent,
      ),
      element.closest("label")?.textContent ?? "",
    ];

    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((element) => element.getClientRects().length > 0)
      .filter((element) => {
        const candidates = [
          element.getAttribute("aria-label") ?? "",
          (element.getAttribute("aria-labelledby") ?? "").split(" ").map(textOf).join(" "),
          ...labelsOf(element),
          element.textContent,
          element.getAttribute("title") ?? "",
          element.querySelector("img")?.getAttribute("alt") ?? "",
        ];
        return candidates.join("").trim() === "";
      })
      .map((element) => element.outerHTML.slice(0, 120));
  });
}

/**
 * Controles com área de toque menor que 44 × 44 px (seção 11 da identidade). A área
 * efetiva soma a camada invisível `::before` usada para ampliar o toque sem mudar o
 * visual (base.css). Links dentro de parágrafos são exceção (WCAG 2.5.8).
 */
function findSmallTargets(page: Page, min = 44): Promise<string[]> {
  return page.evaluate((minSize) => {
    const px = (value: string) => (value.endsWith("px") ? Number.parseFloat(value) : 0);
    return Array.from(
      document.querySelectorAll<HTMLElement>('a[href], button, input:not([type="hidden"]), select'),
    )
      .filter((element) => element.getClientRects().length > 0)
      .filter((element) => !element.closest("dialog:not([open])"))
      .filter(
        (element) => !(element.tagName === "A" && element.closest("p") && !element.matches(".btn")),
      )
      .flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const layer = getComputedStyle(element, "::before");
        const hasLayer = layer.content !== "none" && layer.position === "absolute";
        const extraX = hasLayer ? -Math.min(0, px(layer.left)) - Math.min(0, px(layer.right)) : 0;
        const extraY = hasLayer ? -Math.min(0, px(layer.top)) - Math.min(0, px(layer.bottom)) : 0;
        const width = Math.round(rect.width + extraX);
        const height = Math.round(rect.height + extraY);
        if (width >= minSize && height >= minSize) return [];
        const name = (element.getAttribute("aria-label") ?? element.textContent).trim();
        return [
          `${element.tagName.toLowerCase()}.${element.className} "${name.slice(0, 24)}" ${String(width)}x${String(height)}`,
        ];
      });
  }, min);
}

test.describe("Acessibilidade e teclado", () => {
  test("o primeiro Tab mostra o link para pular ao conteúdo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    await expect(page).toHaveURL("/#main-content");
  });

  test("navega entre páginas só pelo teclado", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const discoverLink = isDesktopLayout(page)
      ? page
          .getByRole("navigation", { name: "Principal", exact: true })
          .getByRole("link", { name: "Descobrir" })
      : page
          .getByRole("navigation", { name: "Navegação principal" })
          .getByRole("link", { name: "Descobrir" });

    // No celular a barra de navegação vem depois de todo o conteúdo do Início.
    await tabTo(page, discoverLink, 150);
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/discover");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Descobrir");
    await expect(discoverLink).toHaveAttribute("aria-current", "page");
  });

  test("filtra e abre o painel de filtros pelo teclado, com foco visível", async ({ page }) => {
    await page.goto("/discover");
    const drama = page.getByRole("button", { name: "Drama", exact: true });
    await expect(drama).toBeVisible();

    await tabTo(page, drama);
    const outline = await drama.evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
    });
    expect(outline.style, "o foco do teclado precisa ser visível").not.toBe("none");
    expect(outline.width).toBeGreaterThan(0);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/discover?genre=18");
    await expect(drama).toHaveAttribute("aria-pressed", "true");

    const filters = page.getByRole("button", { name: "Filtros" });
    await tabTo(page, filters);
    await page.keyboard.press("Space");
    const panel = page.getByRole("dialog", { name: "Filtros" });
    await expect(panel).toBeVisible();
    // O foco abre dentro do diálogo e nunca alcança a página por trás dele (fundo inerte).
    // Com o <dialog> nativo, depois do último controle o Chromium pode levar o foco para
    // fora do documento (a barra do navegador, vista aqui como <body>) e então voltar ao
    // diálogo: isso é o comportamento padrão do HTML, não um vazamento para a página.
    const focusIsSafe = () =>
      panel.evaluate(
        (dialog) =>
          dialog.contains(document.activeElement) || document.activeElement === document.body,
      );
    expect(await panel.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
    let visitedInside = 0;
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press("Tab");
      expect(await focusIsSafe(), "o foco não pode ir para a página atrás do diálogo").toBe(true);
      if (await panel.evaluate((dialog) => dialog.contains(document.activeElement))) {
        visitedInside += 1;
      }
    }
    expect(visitedInside).toBeGreaterThanOrEqual(6);

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(filters).toBeFocused();
  });

  const pages = [
    "/",
    "/discover",
    "/search?q=duna",
    "/movie/550",
    "/serie/1396",
    "/pessoa/287",
    "/pessoas",
    "/colecao/2344",
    "/minha-lista",
    "/sobre",
    "/privacidade",
  ];
  for (const path of pages) {
    test(`todo controle interativo tem nome acessível em ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      // Espera os dados simulados aparecerem antes de inspecionar.
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);

      expect(await findUnnamedControls(page)).toEqual([]);
    });
  }
  const targetPages = [
    "/",
    "/discover?genre=18",
    "/search?q=duna",
    "/movie/550",
    "/serie/1396",
    "/pessoa/287",
    "/pessoas",
    "/colecao/2344",
    "/minha-lista",
    "/sobre",
    "/privacidade",
  ];
  for (const path of targetPages) {
    test(`alvos de toque com pelo menos 44 × 44 px em ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);

      expect(await findSmallTargets(page)).toEqual([]);
    });
  }

  test("estados selecionados continuam visíveis no alto contraste do sistema", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/discover?genre=18");

    const pressed = page.getByRole("button", { name: "Drama", exact: true });
    const other = page.getByRole("button", { name: "Todos", exact: true });
    await expect(pressed).toHaveAttribute("aria-pressed", "true");

    const pageBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    const pressedBackground = await pressed.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    // Sem o ajuste, o navegador pinta o chip selecionado com a cor de fundo da página
    // (Canvas) e ele fica igual aos demais.
    expect(pressedBackground).not.toBe(pageBackground);
    expect(pressedBackground).not.toBe("rgba(0, 0, 0, 0)");
    await expect(other).toHaveAttribute("aria-pressed", "false");

    if (isDesktopLayout(page)) {
      const active = page.getByRole("navigation", { name: "Principal" }).getByRole("link", {
        name: "Descobrir",
      });
      const underline = await active.evaluate(
        (element) => getComputedStyle(element, "::after").backgroundColor,
      );
      expect(underline).not.toBe("rgba(0, 0, 0, 0)");
      expect(underline).not.toBe(pageBackground);
    }
  });
});
