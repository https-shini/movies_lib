import type { Page } from "@playwright/test";
import { discover, emptyPage } from "../fixtures/index.ts";
import { expect, test } from "../helpers/test.ts";

const grid = (page: Page) => page.getByRole("list", { name: "Filmes encontrados" });
const genreBar = (page: Page) => page.getByRole("navigation", { name: "Filtrar por gênero" });

test.describe("Descobrir", () => {
  test("filtra por gênero e desfaz o filtro", async ({ page, tmdb }) => {
    await page.goto("/discover");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Descobrir");
    await expect(genreBar(page).getByRole("button", { name: "Todos" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const action = genreBar(page).getByRole("button", { name: "Ação", exact: true });
    await action.click();

    await expect(page).toHaveURL("/discover?genre=28");
    await expect(action).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Filmes de ação");
    expect(tmdb.callsTo("discover/movie").at(-1)?.searchParams.get("with_genres")).toBe("28");

    await action.click();
    await expect(page).toHaveURL("/discover");
    await expect(action).toHaveAttribute("aria-pressed", "false");
  });

  test("ordena pelo seletor e aplica o mínimo de votos da nota", async ({ page, tmdb }) => {
    await page.goto("/discover");

    await page.getByLabel("Ordenar por").selectOption({ label: "Melhor avaliados" });

    await expect(page).toHaveURL("/discover?sort=vote_average.desc");
    const call = tmdb.callsTo("discover/movie").at(-1);
    expect(call?.searchParams.get("sort_by")).toBe("vote_average.desc");
    expect(call?.searchParams.get("vote_count.gte")).toBe("200");
    await expect(page.getByRole("button", { name: "Limpar tudo" })).toBeVisible();
  });

  test("aplica ano e nota pelo painel de filtros", async ({ page, tmdb }) => {
    await page.goto("/discover");

    await page.getByRole("button", { name: "Filtros" }).click();
    const panel = page.getByRole("dialog", { name: "Filtros" });
    await expect(panel).toBeVisible();

    await panel.getByLabel("Ano de lançamento").fill("1999");
    await panel.getByLabel("Nota mínima").fill("7.5");
    // Nada é aplicado enquanto se digita.
    await expect(page).toHaveURL("/discover");

    await panel.getByRole("button", { name: "Aplicar filtros" }).click();

    await expect(panel).toBeHidden();
    await expect(page).toHaveURL("/discover?year=1999&minRating=7.5");
    const active = page.getByRole("list", { name: "Filtros ativos" });
    await expect(active.getByRole("button", { name: "Remover filtro Ano 1999" })).toBeVisible();
    await expect(active.getByRole("button", { name: "Remover filtro Nota ≥ 7,5" })).toBeVisible();
    await expect(page.getByLabel("2 ativos")).toBeVisible();

    const call = tmdb.callsTo("discover/movie").at(-1);
    expect(call?.searchParams.get("primary_release_year")).toBe("1999");
    expect(call?.searchParams.get("vote_average.gte")).toBe("7.5");
    expect(call?.searchParams.get("vote_count.gte")).toBe("50");
  });

  test("fecha o painel com Esc sem aplicar o rascunho", async ({ page }) => {
    await page.goto("/discover");

    const open = page.getByRole("button", { name: "Filtros" });
    await open.click();
    const panel = page.getByRole("dialog", { name: "Filtros" });
    await panel.getByLabel("Ano de lançamento").fill("2001");
    await page.keyboard.press("Escape");

    await expect(panel).toBeHidden();
    await expect(page).toHaveURL("/discover");
    await expect(open).toBeFocused();
  });

  test("remove filtros um a um e limpa todos", async ({ page }) => {
    await page.goto("/discover?genre=18&year=1999&minRating=7.5");

    await page.getByRole("button", { name: "Remover filtro Ano 1999" }).click();
    await expect(page).toHaveURL("/discover?genre=18&minRating=7.5");
    await expect(page.getByRole("button", { name: "Remover filtro Ano 1999" })).toHaveCount(0);

    await page.getByRole("button", { name: "Limpar tudo" }).click();
    await expect(page).toHaveURL("/discover");
    await expect(page.getByRole("list", { name: "Filtros ativos" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Descobrir");
  });

  test("pagina os resultados", async ({ page, tmdb }) => {
    await page.goto("/discover");

    await expect(page.getByText("18 filmes")).toBeVisible();
    const pagination = page.getByRole("navigation", { name: "Paginação dos resultados" });
    await expect(pagination).toContainText(/Página\s*01\D*de\s*03/);

    await pagination.getByRole("button", { name: "Próxima" }).click();

    await expect(page).toHaveURL("/discover?page=2");
    await expect(pagination).toContainText(/Página\s*02\D*de\s*03/);
    const firstOnPage2 = discover[2].results[0]?.title ?? "";
    await expect(grid(page).getByRole("listitem").first()).toContainText(firstOnPage2);
    expect(tmdb.callsTo("discover/movie").at(-1)?.searchParams.get("page")).toBe("2");

    await pagination.getByRole("button", { name: "Anterior" }).click();
    await expect(page).toHaveURL("/discover");

    await page.goto("/discover?page=3");
    await expect(pagination.getByRole("button", { name: "Próxima" })).toBeDisabled();
  });

  test("mostra o estado vazio com atalho para limpar os filtros", async ({ page, tmdb }) => {
    tmdb.on("discover/movie", { body: emptyPage });
    await page.goto("/discover?year=1901");

    const empty = page.getByRole("status").filter({ hasText: "Nenhum filme com esses filtros" });
    await expect(empty).toBeVisible();
    await expect(page.getByText("0 filmes")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Paginação dos resultados" })).toHaveCount(0);

    await empty.getByRole("button", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL("/discover");
  });
});
