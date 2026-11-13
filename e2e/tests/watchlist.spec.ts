import { expect, isDesktopLayout, test } from "../helpers/test.ts";

const STORAGE_KEY = "cinelux:minha-lista:v1";

test.describe("Minha lista", () => {
  test("avisa ao salvar e ao remover, e o Desfazer devolve o título", async ({ page }) => {
    await page.goto("/movie/550");
    const toasts = page.getByRole("region", { name: "Avisos" });

    await page.getByRole("button", { name: "Salvar na lista" }).click();
    await expect(toasts.getByRole("listitem")).toHaveText(/Clube da Luta entrou na sua lista/);

    await page.getByRole("button", { name: "Na sua lista" }).click();
    await expect(toasts.getByText("Clube da Luta saiu da sua lista")).toBeVisible();
    await expect(page.getByRole("button", { name: "Salvar na lista" })).toBeVisible();

    await toasts.getByRole("button", { name: "Desfazer" }).click();
    await expect(page.getByRole("button", { name: "Na sua lista" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(toasts.getByText("Clube da Luta saiu da sua lista")).toBeHidden();

    // O aviso fica acima da barra inferior no celular, sem cobrir a navegação.
    if (!isDesktopLayout(page)) {
      await page.getByRole("button", { name: "Na sua lista" }).click();
      const toastBox = await toasts.getByRole("listitem").first().boundingBox();
      const tabBox = await page
        .getByRole("navigation", { name: "Navegação principal" })
        .boundingBox();
      expect(toastBox && tabBox && toastBox.y + toastBox.height <= tabBox.y).toBe(true);
    }
  });

  test("salva filme e série, mantém ao recarregar e limpa com confirmação", async ({ page }) => {
    await page.goto("/movie/550");

    const save = page.getByRole("button", { name: "Salvar na lista" });
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(page.getByRole("button", { name: "Na sua lista" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("banner").getByRole("link", { name: "Minha lista" }).click();
    await expect(page).toHaveURL("/minha-lista");
    await expect(page).toHaveTitle("Minha lista · Cinelux");
    await expect(page.getByText("1 título", { exact: true })).toBeVisible();
    const list = page.getByRole("list", { name: "Títulos salvos" });
    await expect(list.getByRole("link", { name: /Clube da Luta/ })).toHaveAttribute(
      "href",
      "/movie/550",
    );

    // Só o necessário para o card fica guardado, e só no navegador.
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
    const [entry] = JSON.parse(stored ?? "[]") as Record<string, unknown>[];
    expect(Object.keys(entry ?? {}).sort()).toEqual([
      "addedAt",
      "date",
      "id",
      "mediaType",
      "posterPath",
      "title",
      "voteAverage",
    ]);

    // A série salva depois aparece primeiro, com o selo, e a lista sobrevive ao recarregar.
    await page.goto("/serie/1396");
    await page.getByRole("button", { name: "Salvar na lista" }).click();
    await page.goto("/minha-lista");
    await expect(page.getByText("2 títulos", { exact: true })).toBeVisible();
    await expect(list.getByRole("listitem").first()).toContainText("Breaking Bad");
    await expect(list.getByRole("listitem").first()).toContainText("Série");

    // Remover pelo mesmo botão da página do título.
    await page.goto("/serie/1396");
    await page.getByRole("button", { name: "Na sua lista" }).click();
    await page.goto("/minha-lista");
    await expect(page.getByText("1 título", { exact: true })).toBeVisible();

    // Limpar pede confirmação; cancelar mantém a lista.
    await page.getByRole("button", { name: "Limpar lista" }).click();
    const dialog = page.getByRole("dialog", { name: "Limpar a lista?" });
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(list.getByRole("listitem")).toHaveCount(1);

    await page.getByRole("button", { name: "Limpar lista" }).click();
    await dialog.getByRole("button", { name: "Limpar tudo" }).click();
    await expect(page.getByText("Sua lista está vazia")).toBeVisible();
    await expect(page.getByRole("link", { name: "Descobrir filmes" })).toHaveAttribute(
      "href",
      "/discover",
    );
    expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  });

  test("ignora conteúdo inválido no armazenamento sem quebrar a página", async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify([
          { id: "x", mediaType: "movie", title: "inválido" },
          { id: 603, mediaType: "movie", title: "Matrix", posterPath: "javascript:alert(1)" },
        ]),
      );
    }, STORAGE_KEY);
    await page.goto("/minha-lista");

    const list = page.getByRole("list", { name: "Títulos salvos" });
    await expect(list.getByRole("listitem")).toHaveCount(1);
    await expect(list.getByRole("link", { name: /Matrix/ })).toHaveAttribute("href", "/movie/603");
    await expect(list.locator("img")).toHaveCount(0);
  });
});

test.describe("Compartilhar", () => {
  test("copia o link da página quando não há folha de compartilhamento", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/pessoa/287");

    await page.getByRole("button", { name: "Compartilhar" }).click();
    await expect(page.getByRole("button", { name: "Link copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
    // O aviso some sozinho e o botão volta ao normal.
    await expect(page.getByRole("button", { name: "Compartilhar" })).toBeVisible();
  });

  test("usa a folha de compartilhamento do sistema quando existe", async ({ page }) => {
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
    await page.goto("/movie/550");

    await page.getByRole("button", { name: "Compartilhar" }).click();
    const shared = await page.evaluate(
      () => (window as unknown as { __shared: unknown[] }).__shared,
    );
    expect(shared).toEqual([{ title: "Clube da Luta", url: page.url() }]);
  });
});

test.describe("Vidro", () => {
  test("as camadas flutuantes desfocam o fundo, e ficam opacas com transparência reduzida", async ({
    page,
  }) => {
    await page.goto("/movie/550");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const floating = isDesktopLayout(page) ? ".app-header" : ".tabbar__list";
    const style = (selector: string) =>
      page.locator(selector).evaluate((element) => {
        const computed = getComputedStyle(element);
        return { filter: computed.backdropFilter, background: computed.backgroundColor };
      });

    for (const selector of [floating, ".app-header", ".section-nav"]) {
      const { filter, background } = await style(selector);
      expect(filter, selector).toContain("blur");
      // Fundo translúcido: o canal alfa é menor que 1.
      expect(background, selector).toMatch(/^rgba\(.+, 0\.\d+\)$/);
    }

    const client = await page.context().newCDPSession(page);
    await client.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    });
    const reduced = await style(".app-header");
    expect(reduced.filter).toBe("none");
    expect(reduced.background).toMatch(/^rgb\(/);
  });
});
