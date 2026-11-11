import { movie550 } from "../fixtures/index.ts";
import { expect, test } from "../helpers/test.ts";

test.describe("Filme", () => {
  test("mostra os dados do filme numa única requisição ao proxy", async ({ page, tmdb }) => {
    await page.goto("/movie/550");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clube da Luta");
    await expect(page).toHaveTitle("Clube da Luta · Cinelux");
    await expect(page.getByText("Fight Club", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Nota 8.4 de 10")).toBeVisible();
    await expect(page.getByText(movie550.tagline ?? "")).toBeVisible();

    const genres = page.getByRole("list", { name: "Gêneros" });
    await expect(genres.getByRole("link", { name: "Drama" })).toHaveAttribute(
      "href",
      "/discover?genre=18",
    );

    const facts = page.getByRole("complementary", { name: "Ficha técnica" });
    await expect(facts).toContainText("David Fincher");
    await expect(facts).toContainText("Jim Uhls");
    await expect(facts).toContainText("2h 19min");
    await expect(facts).toContainText(/US\$\s63\.000\.000/);

    const providers = page.getByRole("region", { name: "Onde assistir" });
    await expect(providers.getByText("Assinatura")).toBeVisible();
    await expect(providers.getByText("Netflix")).toBeVisible();
    await expect(providers.getByRole("link", { name: /JustWatch/ })).toHaveAttribute(
      "href",
      "https://www.justwatch.com/",
    );

    const cast = page.getByRole("list", { name: "Elenco principal" });
    await expect(cast.getByRole("listitem")).toHaveCount(3);
    await expect(cast).toContainText("Tyler Durden");

    await expect(page.getByRole("heading", { name: "Você também pode gostar" })).toBeVisible();

    // Detalhes, elenco, vídeos, recomendações e onde assistir chegam numa só requisição.
    const detailCalls = tmdb.callsTo("movie/550");
    expect(detailCalls).toHaveLength(1);
    expect(detailCalls[0]?.searchParams.get("append_to_response")).toBe(
      "credits,videos,recommendations,similar,watch/providers",
    );
    expect(detailCalls[0]?.searchParams.get("include_video_language")).toBe("pt,en,null");
    expect(tmdb.callsTo("movie/550/watch/providers")).toHaveLength(0);
    // A página do filme faz uma única consulta. A outra chamada permitida é o preload do
    // destaque do Início, que o index.html faz em todas as rotas (D-42).
    expect(
      tmdb.calls.map((url) => url.pathname).filter((path) => path !== "/api/tmdb/movie/popular"),
    ).toEqual(["/api/tmdb/movie/550"]);
  });

  test("abre o trailer e fecha com Esc, devolvendo o foco", async ({ page }) => {
    await page.goto("/movie/550");

    const play = page.getByRole("button", { name: "Assistir trailer" });
    await play.click();

    const dialog = page.getByRole("dialog", { name: "Trailer: Clube da Luta" });
    await expect(dialog).toBeVisible();
    const player = dialog.locator('iframe[title="Trailer de Clube da Luta"]');
    await expect(player).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/fixtureTrailerPt\?/,
    );
    await expect(dialog.getByRole("link", { name: /Abrir no YouTube/ })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=fixtureTrailerPt",
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // O player é removido ao fechar, então o vídeo para.
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(play).toBeFocused();

    // Também fecha pelo botão.
    await play.click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Fechar" }).click();
    await expect(dialog).toBeHidden();
  });

  test("navega para um filme recomendado", async ({ page }) => {
    await page.goto("/movie/550");

    await page
      .getByRole("list", { name: "Você também pode gostar" })
      .getByRole("link", { name: /Matrix/ })
      .click();

    await expect(page).toHaveURL("/movie/603");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Matrix");
  });

  test("mostra erro com nova tentativa quando o filme não existe no TMDB", async ({
    page,
    consoleErrors,
  }) => {
    consoleErrors.allow(/status of 404/);
    await page.goto("/movie/999999");

    const alert = page.getByRole("alert");
    await expect(alert).toContainText("Não foi possível abrir este filme");
    await expect(alert).toContainText("Não encontramos este conteúdo.");
    await expect(alert.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
    await alert.getByRole("link", { name: "Voltar ao início" }).click();
    await expect(page).toHaveURL("/");
  });
});
