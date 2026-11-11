import { FEATURED_MOVIE, genres, movies } from "../fixtures/index.ts";
import { expect, test } from "../helpers/test.ts";

test.describe("Início", () => {
  test("mostra o destaque e as seções com os dados do TMDB", async ({ page, tmdb }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Cinelux · Seu acervo de cinema");
    await expect(page.getByRole("heading", { level: 1, name: FEATURED_MOVIE.title })).toBeVisible();

    for (const section of [
      "Em alta",
      "Os 10 mais bem avaliados",
      "Nos cinemas",
      "Explore por gênero",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
    }

    // Faixa "Em alta": todos os populares menos o destaque.
    const trending = page.getByRole("list", { name: "Em alta" });
    await expect(trending.getByRole("listitem")).toHaveCount(movies.results.length - 1);

    // Ranking com exatamente 10 posições, mesmo com 12 filmes na resposta.
    await expect(page.getByLabel("10º lugar", { exact: true })).toBeVisible();
    await expect(page.getByLabel("11º lugar", { exact: true })).toHaveCount(0);

    // Índice de gêneros com todos os gêneros da fixture.
    for (const genre of genres.genres) {
      await expect(page.getByRole("link", { name: genre.name, exact: true })).toBeVisible();
    }

    // Uma requisição por seção, sempre em português e, nas listas, com a região do Brasil.
    for (const path of ["movie/popular", "movie/top_rated", "movie/now_playing"]) {
      const [call] = tmdb.callsTo(path);
      expect(call?.searchParams.get("language"), path).toBe("pt-BR");
      expect(call?.searchParams.get("region"), path).toBe("BR");
    }
    expect(tmdb.callsTo("genre/movie/list")[0]?.searchParams.get("language")).toBe("pt-BR");
  });

  test("leva aos detalhes pelo destaque e ao catálogo pelo gênero", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Ver detalhes" }).click();
    await expect(page).toHaveURL(`/movie/${String(FEATURED_MOVIE.id)}`);
    await expect(page.getByRole("heading", { level: 1, name: FEATURED_MOVIE.title })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Ficção científica", exact: true }).click();
    await expect(page).toHaveURL("/discover?genre=878");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Filmes de ficção científica");
  });
});
