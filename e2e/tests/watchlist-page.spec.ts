import type { Page } from "@playwright/test";
import { expect, expectNoHorizontalScroll, test } from "../helpers/test.ts";
import type { WatchlistItem } from "../../src/lib/watchlist.ts";

/** Página Minha lista: filtro, ordenação, remoção com "Desfazer" e estados vazios (D-67). */

const STORAGE_KEY = "cinelux:minha-lista:v1";

/** Salvos do mais recente (topo) ao mais antigo; dois sem nota e dois sem data. */
const SAVED: WatchlistItem[] = [
  {
    id: 550,
    mediaType: "movie",
    title: "Clube da Luta",
    posterPath: "/a.jpg",
    date: "1999-10-15",
    voteAverage: 8.4,
    addedAt: 600,
  },
  {
    id: 1396,
    mediaType: "tv",
    title: "Breaking Bad",
    posterPath: "/b.jpg",
    date: "2008-01-20",
    voteAverage: 8.9,
    addedAt: 500,
  },
  {
    id: 603,
    mediaType: "movie",
    title: "Matrix",
    posterPath: "/c.jpg",
    date: "1999-03-31",
    voteAverage: null,
    addedAt: 400,
  },
  {
    id: 157336,
    mediaType: "movie",
    title: "Interestelar",
    posterPath: "/d.jpg",
    date: "",
    voteAverage: 8.4,
    addedAt: 300,
  },
  {
    id: 1399,
    mediaType: "tv",
    title: "Game of Thrones",
    posterPath: "/e.jpg",
    date: "",
    voteAverage: null,
    addedAt: 200,
  },
  {
    id: 27205,
    mediaType: "movie",
    title: "A Origem",
    posterPath: "/f.jpg",
    date: "2010-07-15",
    voteAverage: 8.4,
    addedAt: 100,
  },
];

async function seed(page: Page, items: readonly WatchlistItem[]): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      // Só na primeira carga: recarregar a página precisa mostrar o que a página gravou.
      if (window.sessionStorage.getItem("seeded")) return;
      window.sessionStorage.setItem("seeded", "1");
      window.localStorage.setItem(key, value);
    },
    [STORAGE_KEY, JSON.stringify(items)] as const,
  );
}

const FIGHT_CLUB = SAVED.slice(0, 1);

const grid = (page: Page) => page.getByRole("list", { name: "Títulos salvos" });
const titles = (page: Page) => grid(page).getByRole("heading", { level: 3 }).allTextContents();
const stored = (page: Page) =>
  page.evaluate(
    (key) =>
      (JSON.parse(window.localStorage.getItem(key) ?? "[]") as { title: string }[]).map(
        (i) => i.title,
      ),
    STORAGE_KEY,
  );

test.describe("Minha lista: filtro e ordenação", () => {
  test("conta cada tipo, filtra e mantém o filtro na URL", async ({ page }) => {
    await seed(page, SAVED);
    await page.goto("/minha-lista");

    const filters = page.getByRole("list", { name: "Filtrar por tipo" });
    await expect(filters.getByRole("button", { name: "Tudo: 6" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(filters.getByRole("button", { name: "Filmes: 4" })).toBeVisible();
    await filters.getByRole("button", { name: "Séries: 2" }).click();

    await expect(page).toHaveURL("/minha-lista?tipo=series");
    await expect.poll(() => titles(page)).toEqual(["Breaking Bad", "Game of Thrones"]);
    await expect(page.locator(".watchlist__total")).toHaveText("2 títulos salvos");
    // As contagens dos botões são do total, não do filtro.
    await expect(filters.getByRole("button", { name: "Filmes: 4" })).toBeVisible();
  });

  test("ordena, trata quem não tem nota ou data e combina com o filtro", async ({ page }) => {
    await seed(page, SAVED);
    await page.goto("/minha-lista");
    const sort = page.getByLabel("Ordenar por");

    await expect.poll(() => titles(page)).toEqual(SAVED.map((item) => item.title));

    await sort.selectOption({ label: "Mais antigos" });
    await expect.poll(() => titles(page)).toEqual(SAVED.map((item) => item.title).reverse());

    await sort.selectOption({ label: "Título (A–Z)" });
    await expect
      .poll(() => titles(page))
      .toEqual([
        "A Origem",
        "Breaking Bad",
        "Clube da Luta",
        "Game of Thrones",
        "Interestelar",
        "Matrix",
      ]);

    // Sem nota por último; empate na nota resolvido pelo título.
    await sort.selectOption({ label: "Melhor avaliados" });
    await expect
      .poll(() => titles(page))
      .toEqual([
        "Breaking Bad",
        "A Origem",
        "Clube da Luta",
        "Interestelar",
        "Game of Thrones",
        "Matrix",
      ]);

    // Sem data por último.
    await sort.selectOption({ label: "Lançamento" });
    await expect(page).toHaveURL("/minha-lista?ordem=lancamento");
    await expect
      .poll(() => titles(page))
      .toEqual([
        "A Origem",
        "Breaking Bad",
        "Clube da Luta",
        "Matrix",
        "Game of Thrones",
        "Interestelar",
      ]);

    // Filtro e ordem juntos, e os dois sobrevivem ao recarregar.
    await page.getByRole("button", { name: "Filmes: 4" }).click();
    await expect(page).toHaveURL("/minha-lista?tipo=filmes&ordem=lancamento");
    await page.reload();
    await expect
      .poll(() => titles(page))
      .toEqual(["A Origem", "Clube da Luta", "Matrix", "Interestelar"]);
    await expect(sort).toHaveValue("release");
    // A ordenação nunca muda o que fica guardado.
    await expect.poll(() => stored(page)).toEqual(SAVED.map((item) => item.title));
  });

  test("filtro sem títulos mostra aviso e volta para Tudo", async ({ page }) => {
    await seed(
      page,
      SAVED.filter((item) => item.mediaType === "movie"),
    );
    await page.goto("/minha-lista?tipo=series");
    await expect(page.getByText("Nenhuma série na sua lista")).toBeVisible();
    await page.getByRole("button", { name: "Ver todos os títulos" }).click();
    await expect(page).toHaveURL("/minha-lista");
    await expect(grid(page).getByRole("listitem")).toHaveCount(4);
  });
});

test.describe("Minha lista: remoção", () => {
  test("remove um título, guarda a mudança e o Desfazer devolve só ele, no lugar", async ({
    page,
  }) => {
    await seed(page, SAVED);
    await page.goto("/minha-lista");
    const toasts = page.getByRole("region", { name: "Avisos" });

    const removeMatrix = page.getByRole("button", { name: "Remover Matrix da lista" });
    const box = await removeMatrix.boundingBox();
    expect(box && box.width >= 44 && box.height >= 44).toBe(true);

    await removeMatrix.click();
    await expect.poll(() => titles(page)).not.toContain("Matrix");
    await expect.poll(() => stored(page)).not.toContain("Matrix");
    // O foco vai para o título vizinho, não para o topo da página.
    await expect(grid(page).getByRole("link", { name: /Interestelar/ })).toBeFocused();

    // Uma segunda remoção, e depois o Desfazer da primeira.
    await page.getByRole("button", { name: "Remover Breaking Bad da lista" }).click();
    await toasts
      .getByRole("listitem")
      .filter({ hasText: "Matrix saiu da sua lista" })
      .getByRole("button", { name: "Desfazer" })
      .click();

    const expected = SAVED.map((item) => item.title).filter((title) => title !== "Breaking Bad");
    await expect.poll(() => titles(page)).toEqual(expected);
    await expect.poll(() => stored(page)).toEqual(expected);
    await page.reload();
    await expect.poll(() => titles(page)).toEqual(expected);
  });

  test("remover o último título leva à lista vazia, com os dois caminhos", async ({ page }) => {
    await seed(page, FIGHT_CLUB);
    await page.goto("/minha-lista");
    await page.getByRole("button", { name: "Remover Clube da Luta da lista" }).click();

    await expect(page.getByRole("heading", { name: "Sua lista está vazia" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Descobrir filmes" })).toBeFocused();
    await expect(page.getByRole("link", { name: "Descobrir séries" })).toBeVisible();
    await expect.poll(() => stored(page)).toEqual([]);
  });
});

test.describe("Minha lista: muitos títulos e navegação", () => {
  test("60 títulos sem rolagem lateral, e o card leva ao detalhe", async ({ page }) => {
    const many: WatchlistItem[] = Array.from({ length: 60 }, (_, index) => ({
      id: 990000 + index,
      mediaType: index % 3 ? "movie" : "tv",
      title: `Título salvo com um nome bem comprido ${String(index + 1)}`,
      posterPath: null,
      date: "",
      voteAverage: null,
      addedAt: 1000 - index,
    }));
    await seed(page, [...FIGHT_CLUB, ...many]);
    await page.goto("/minha-lista");

    await expect(grid(page).getByRole("listitem")).toHaveCount(61);
    await expect(page.getByRole("button", { name: "Séries: 20" })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await grid(page)
      .getByRole("link", { name: /Clube da Luta/ })
      .click();
    await expect(page).toHaveURL("/movie/550");
  });
});
