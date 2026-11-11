import type { Page } from "@playwright/test";
import { searchDuna } from "../fixtures/index.ts";
import { expect, isDesktopLayout, test } from "../helpers/test.ts";

const results = (page: Page) =>
  page.getByRole("list", { name: "Resultados da busca" }).getByRole("listitem");

test.describe("Busca", () => {
  test("pelo campo da página, com resultados e requisição correta", async ({ page, tmdb }) => {
    await page.goto("/search");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("O que vamos assistir?");
    await expect(page.getByRole("heading", { name: "Populares agora" })).toBeVisible();

    const field = page.getByRole("searchbox", { name: "Buscar filmes pelo título" });
    const submit = page.getByRole("button", { name: "Buscar", exact: true });
    await expect(field).toBeFocused();

    // Abaixo de 480 px o botão é escondido pelo CSS e a busca é enviada pelo teclado.
    const hasSubmitButton = (page.viewportSize()?.width ?? 0) >= 480;
    if (hasSubmitButton) {
      await expect(submit).toBeDisabled();
      await field.fill("Duna");
      await expect(submit).toBeEnabled();
      await submit.click();
    } else {
      await expect(submit).toBeHidden();
      await field.fill("Duna");
      await field.press("Enter");
    }

    await expect(page).toHaveURL("/search?q=Duna");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Resultados para “Duna”");
    await expect(page.getByText("3 resultados")).toBeVisible();
    await expect(results(page)).toHaveCount(searchDuna[1].results.length);
    await expect(page).toHaveTitle("Busca: Duna · Cinelux");

    const [call] = tmdb.callsTo("search/movie");
    expect(call?.searchParams.get("query")).toBe("Duna");
    expect(call?.searchParams.get("include_adult")).toBe("false");
    expect(call?.searchParams.get("language")).toBe("pt-BR");
  });

  test("pelo campo do cabeçalho", async ({ page }) => {
    test.skip(
      !isDesktopLayout(page),
      "o campo de busca do cabeçalho só aparece a partir de 900 px",
    );

    await page.goto("/");
    const field = page.getByRole("searchbox", { name: "Buscar filmes" });
    await field.fill("duna");
    await field.press("Enter");

    await expect(page).toHaveURL("/search?q=duna");
    await expect(results(page)).toHaveCount(searchDuna[1].results.length);
    // Na página de busca o campo do cabeçalho some, para não haver dois campos iguais.
    await expect(page.getByRole("searchbox", { name: "Buscar filmes", exact: true })).toHaveCount(
      0,
    );
  });

  test("pela barra inferior", async ({ page }) => {
    test.skip(isDesktopLayout(page), "a barra inferior só aparece abaixo de 900 px");

    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Buscar" })
      .click();

    await expect(page).toHaveURL("/search");
    const field = page.getByRole("searchbox", { name: "Buscar filmes pelo título" });
    await expect(field).toBeFocused();
    await field.fill("duna");
    await field.press("Enter");

    await expect(page).toHaveURL("/search?q=duna");
    await expect(results(page)).toHaveCount(searchDuna[1].results.length);
  });

  test("mostra o estado vazio quando nada é encontrado", async ({ page }) => {
    await page.goto("/search?q=filme%20que%20n%C3%A3o%20existe");

    await expect(page.getByRole("status")).toContainText("Nenhum filme encontrado");
    await expect(
      page.getByText("Confira a grafia ou tente o título original do filme."),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Paginação dos resultados" })).toHaveCount(0);
  });

  test("pagina os resultados pela URL", async ({ page, tmdb }) => {
    await page.goto("/search?q=duna");

    const pagination = page.getByRole("navigation", { name: "Paginação dos resultados" });
    await expect(pagination).toContainText(/Página\s*01\D*de\s*02/);
    await expect(pagination.getByRole("button", { name: "Anterior" })).toBeDisabled();

    await pagination.getByRole("button", { name: "Próxima" }).click();

    await expect(page).toHaveURL("/search?q=duna&page=2");
    await expect(pagination).toContainText(/Página\s*02\D*de\s*02/);
    await expect(results(page)).toHaveCount(searchDuna[2].results.length);
    await expect(pagination.getByRole("button", { name: "Próxima" })).toBeDisabled();
    expect(tmdb.callsTo("search/movie").at(-1)?.searchParams.get("page")).toBe("2");

    await pagination.getByRole("button", { name: "Anterior" }).click();
    await expect(page).toHaveURL("/search?q=duna");
  });

  test("abre os detalhes de um resultado", async ({ page }) => {
    await page.goto("/search?q=duna");

    await results(page)
      .getByRole("link", { name: /Duna: Parte Dois/ })
      .click();

    await expect(page).toHaveURL("/movie/693134");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Duna: Parte Dois");
    // Sem vídeos na resposta, não há botão de trailer.
    await expect(page.getByRole("button", { name: "Assistir trailer" })).toHaveCount(0);
  });
});
