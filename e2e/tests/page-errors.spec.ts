import { expect, expectNoHorizontalScroll, test } from "../helpers/test.ts";

/** Erros de página, 404 e noindex (D-69). */

const robots = '[name="robots"]';

const NOT_FOUND = [
  { kind: "filme", path: "/movie/999999", title: "Filme não encontrado" },
  { kind: "série", path: "/serie/999999", title: "Série não encontrada" },
  { kind: "pessoa", path: "/pessoa/999999", title: "Pessoa não encontrada" },
  { kind: "temporada", path: "/serie/1396/temporada/9", title: "Temporada não encontrada" },
  { kind: "coleção", path: "/colecao/999999", title: "Coleção não encontrada" },
] as const;

test.describe("Conteúdo inexistente", () => {
  for (const { kind, path, title } of NOT_FOUND) {
    test(`${kind}: h1, título da aba, caminhos de volta, sem nova tentativa e noindex`, async ({
      page,
      consoleErrors,
    }) => {
      consoleErrors.allow(/404/);
      await page.goto(path);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(`${title} · Cinelux`);
      const alert = page.getByRole("alert");
      await expect(alert).not.toContainText(/não encontramos este conteúdo|chave/i);
      await expect(alert.getByRole("button", { name: "Tentar novamente" })).toHaveCount(0);
      await expect(alert.getByRole("link", { name: "Descobrir filmes" })).toHaveAttribute(
        "href",
        "/discover",
      );
      await expect(alert.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute(
        "href",
        "/",
      );
      await expect(page.locator(`meta${robots}`)).toHaveAttribute("content", "noindex");
      await expectNoHorizontalScroll(page);
    });
  }

  test("os cinco erros usam a mesma estrutura", async ({ page, consoleErrors }) => {
    consoleErrors.allow(/404/);
    for (const { path } of NOT_FOUND) {
      await page.goto(path);
      await expect(page.locator("main.page-error .page-head h1")).toHaveCount(1);
      await expect(page.locator("main.page-error [role='alert']")).toHaveCount(1);
    }
  });

  test("pelo teclado, o foco chega aos caminhos de volta", async ({ page, consoleErrors }) => {
    consoleErrors.allow(/404/);
    await page.goto("/movie/999999");
    const discover = page.getByRole("alert").getByRole("link", { name: "Descobrir filmes" });
    await expect(discover).toBeVisible();
    for (let step = 0; step < 40; step++) {
      await page.keyboard.press("Tab");
      if (await discover.evaluate((element) => element === document.activeElement)) break;
    }
    await expect(discover).toBeFocused();
    const outline = await discover.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).not.toBe("none");
  });
});

test.describe("Falhas que não são de conteúdo inexistente", () => {
  test("falha temporária: mensagem clara, nova tentativa que funciona e sem noindex", async ({
    page,
    tmdb,
    consoleErrors,
  }) => {
    consoleErrors.allow(/503/);
    tmdb.on("movie/550", { status: 503, body: { status_code: 9 } }, { times: 1 });
    await page.goto("/movie/550");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Não foi possível abrir este filme",
    );
    await expect(page).toHaveTitle("Não foi possível abrir este filme · Cinelux");
    await expect(page.getByRole("alert")).toContainText("indisponível");
    await expect(page.locator(`meta${robots}`)).toHaveCount(0);
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clube da Luta");
  });

  test("falha técnica: mensagem genérica, sem detalhes do servidor", async ({
    page,
    tmdb,
    consoleErrors,
  }) => {
    consoleErrors.allow(/401/);
    tmdb.on("person/287", { status: 401, body: { status_code: 7 } });
    await page.goto("/pessoa/287");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Não foi possível abrir este perfil",
    );
    const alert = page.getByRole("alert");
    await expect(alert).not.toContainText(/chave|TMDB é inválida/i);
    await expect(alert).toContainText("não respondeu como esperado");
    await expect(alert.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
  });
});

test.describe("noindex na navegação da SPA", () => {
  test("rota inexistente aberta direto e recarregada: noindex, sem duplicar", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esta cena foi cortada");
    await expect(page.locator(`meta${robots}`)).toHaveAttribute("content", "noindex");
    await page.reload();
    await expect(page.locator(`meta${robots}`)).toHaveCount(1);
  });

  test("ao sair da 404 para uma página válida, o noindex não fica para trás", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");
    await expect(page.locator(`meta${robots}`)).toHaveCount(1);
    await page.getByRole("main").getByRole("link", { name: "Voltar ao início" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.locator(`meta${robots}`)).toHaveCount(0);
    // E de volta pelo histórico: a 404 recoloca a tag.
    await page.goBack();
    await expect(page.locator(`meta${robots}`)).toHaveCount(1);
  });

  for (const path of [
    "/",
    "/discover",
    "/search?q=duna",
    "/movie/550",
    "/serie/1396",
    "/serie/1396/temporada/1",
    "/pessoa/287",
    "/pessoas",
    "/colecao/2344",
    "/minha-lista",
    "/sobre",
    "/privacidade",
  ]) {
    test(`página válida sem noindex: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator(`meta${robots}`)).toHaveCount(0);
    });
  }
});

test.describe("Telas de estado", () => {
  test("código da 404 no gradiente da marca e sólido no alto contraste", async ({ page }) => {
    await page.goto("/rota-que-nao-existe");
    const code = page.locator(".status-screen__code");
    await expect(code).toHaveText("404");
    expect(await code.evaluate((element) => getComputedStyle(element).backgroundClip)).toBe("text");

    await page.emulateMedia({ forcedColors: "active" });
    await expect(code).toBeVisible();
    expect(await code.evaluate((element) => getComputedStyle(element).backgroundClip)).not.toBe(
      "text",
    );
  });

  test("Sobre e Privacidade: um h1, seções com filete e o aviso do TMDB como citação", async ({
    page,
  }) => {
    for (const path of ["/sobre", "/privacidade"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      const section = page.locator(".legal__section").first();
      expect(await section.evaluate((element) => getComputedStyle(element).borderTopStyle)).toBe(
        "none",
      );
      expect(
        await section.evaluate((element) => getComputedStyle(element).backgroundImage),
      ).toContain("linear-gradient");
      await expectNoHorizontalScroll(page);
    }
    await page.goto("/sobre");
    const notice = page.locator(".legal__notice");
    // Texto obrigatório do TMDB preservado, agora sem caixa: só o filete dourado.
    await expect(notice).toContainText("This product uses TMDB and the TMDB APIs");
    expect(await notice.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(await notice.evaluate((element) => getComputedStyle(element).borderLeftStyle)).toBe(
      "solid",
    );
  });
});
