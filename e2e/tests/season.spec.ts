import { tv1396Season1 } from "../fixtures/index.ts";
import { expect, test } from "../helpers/test.ts";

/** Temporadas e episódios (D-61). */
test.describe("Temporada", () => {
  test("a série leva à temporada, com episódios, trilha e seletor", async ({ page, tmdb }) => {
    await page.goto("/serie/1396");
    const seasons = page.getByRole("list", { name: "Temporadas da série" });
    await seasons.getByRole("link", { name: /Temporada 1/ }).click();

    await expect(page).toHaveURL("/serie/1396/temporada/1");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Temporada 1");
    await expect(page).toHaveTitle("Temporada 1 · Breaking Bad · Cinelux");
    // 7 episódios; a soma das durações aparece no cabeçalho (58 + 6 × 48 = 346 min).
    await expect(page.getByText("2008 · 7 episódios · 5h 46min no total")).toBeVisible();

    const crumbs = page.getByRole("navigation", { name: "Você está em" });
    await expect(crumbs.getByRole("link", { name: "Breaking Bad" })).toHaveAttribute(
      "href",
      "/serie/1396",
    );
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText("Temporada 1");

    const episodes = page
      .getByRole("list", { name: "Episódios da temporada" })
      .getByRole("listitem");
    await expect(episodes).toHaveCount(tv1396Season1.episodes.length);
    await expect(episodes.nth(0)).toContainText("Piloto");
    await expect(episodes.nth(0)).toContainText("20 de janeiro de 2008");
    await expect(episodes.nth(0)).toContainText("58min");
    await expect(episodes.nth(0).locator("img")).toHaveAttribute(
      "src",
      /\/w300\/fixture-still-1396-1-1\.jpg$/,
    );
    // Sem imagem: marcador no lugar. Sem sinopse: aviso, não um parágrafo vazio.
    await expect(episodes.nth(2).locator("img")).toHaveCount(0);
    await expect(episodes.nth(4)).toContainText("ainda não tem sinopse");
    await expect(episodes.nth(6)).toContainText("Final da temporada");

    // Seletor: a temporada atual marcada; especiais aparecem por último.
    const switcher = page.getByRole("navigation", { name: "Outras temporadas" });
    await expect(switcher.getByRole("link", { name: "Temporada 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(switcher.getByRole("link").last()).toHaveText("Especiais");

    // A série veio do cache do cliente: só a temporada foi pedida a mais.
    expect(tmdb.callsTo("tv/1396")).toHaveLength(1);
    expect(tmdb.callsTo("tv/1396/season/1")).toHaveLength(1);
    expect(tmdb.unknown).toEqual([]);
  });

  test("marca episódios inéditos", async ({ page, tmdb }) => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    tmdb.on("tv/1396/season/1", {
      body: {
        ...tv1396Season1,
        episodes: tv1396Season1.episodes.map((episode, index) =>
          index === 6 ? { ...episode, air_date: future } : episode,
        ),
      },
    });
    await page.goto("/serie/1396/temporada/1");
    const episodes = page
      .getByRole("list", { name: "Episódios da temporada" })
      .getByRole("listitem");
    await expect(episodes.nth(6)).toContainText("Inédito");
    await expect(episodes.nth(0)).not.toContainText("Inédito");
  });

  test("temporada inexistente mostra erro com volta para a série", async ({
    page,
    consoleErrors,
  }) => {
    consoleErrors.allow(/404/);
    await page.goto("/serie/1396/temporada/9");
    await expect(page.getByRole("alert")).toContainText("Não foi possível abrir esta temporada");
    await expect(page.getByRole("link", { name: "Voltar para a série" })).toHaveAttribute(
      "href",
      "/serie/1396",
    );
  });

  test("número de temporada inválido mostra a página 404 sem chamar o TMDB", async ({
    page,
    tmdb,
  }) => {
    await page.goto("/serie/1396/temporada/abc");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esta cena foi cortada");
    expect(tmdb.calls.filter((url) => url.pathname.includes("/season/"))).toEqual([]);
  });
});
