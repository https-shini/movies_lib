import { collection2344, people, tvShows } from "../fixtures/index.ts";
import { expect, test } from "../helpers/test.ts";

/**
 * Páginas da enciclopédia: séries, pessoas e coleções, e os caminhos entre elas.
 */
test.describe("Série", () => {
  test("mostra ficha, temporadas, elenco e vídeos numa única requisição", async ({
    page,
    tmdb,
  }) => {
    await page.goto("/serie/1396");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Breaking Bad");
    await expect(page.getByText("2008 · 5 temporadas")).toBeVisible();

    const facts = page.getByRole("complementary", { name: "Ficha técnica" });
    await expect(facts).toContainText("Vince Gilligan");
    await expect(facts).toContainText("Finalizada");
    await expect(facts).toContainText("AMC");
    // Classificação do Brasil (16), não a dos EUA (TV-MA), que também está na fixture.
    await expect(facts.locator(".facts__row", { hasText: "Classificação indicativa" })).toHaveText(
      "Classificação indicativa16 anos",
    );

    // Temporadas em ordem, com os especiais por último.
    const seasons = page.getByRole("list", { name: "Temporadas da série" }).getByRole("listitem");
    await expect(seasons).toHaveCount(3);
    await expect(seasons.nth(0)).toContainText("Temporada 1");
    await expect(seasons.nth(0)).toContainText("2008 · 7 episódios");
    await expect(seasons.nth(2)).toContainText("Especiais");

    const cast = page.getByRole("list", { name: "Elenco principal" });
    await expect(cast.getByRole("listitem")).toHaveCount(3);
    await expect(cast).toContainText("Walter White");
    await expect(cast).toContainText("62 ep.");

    await expect(page.getByRole("link", { name: /Instagram/ })).toHaveAttribute(
      "href",
      "https://www.instagram.com/breakingbad/",
    );

    const calls = tmdb.callsTo("tv/1396");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.searchParams.get("append_to_response")).toBe(
      "aggregate_credits,videos,recommendations,similar,watch/providers,content_ratings,images,external_ids",
    );
  });

  test("os gêneros levam à descoberta de séries e as parecidas, a outra série", async ({
    page,
  }) => {
    await page.goto("/serie/1396");

    await expect(
      page.getByRole("list", { name: "Gêneros" }).getByRole("link", { name: "Drama" }),
    ).toHaveAttribute("href", "/discover?tipo=series&genre=18");

    const related = page.getByRole("list", { name: "Séries parecidas" });
    await expect(related.getByRole("link", { name: /Game of Thrones/ })).toHaveAttribute(
      "href",
      "/serie/1399",
    );
  });

  test("mostra erro com nova tentativa quando a série não existe", async ({
    page,
    consoleErrors,
  }) => {
    consoleErrors.allow(/404/);
    await page.goto("/serie/999999");

    await expect(page.getByRole("alert")).toContainText("Não foi possível abrir esta série");
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
  });
});

test.describe("Pessoa", () => {
  test("mostra o perfil, os principais trabalhos e a filmografia por área", async ({
    page,
    tmdb,
  }) => {
    await page.goto("/pessoa/287");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Brad Pitt");
    await expect(page.getByText("Perfil · Atuação")).toBeVisible();
    await expect(page.getByText("Shawnee, Oklahoma, EUA")).toBeVisible();
    await expect(page.getByText(/18 de dezembro de 1963 \(\d+ anos\)/)).toBeVisible();
    await expect(page.getByText("ator e produtor americano")).toBeVisible();
    await expect(page.getByRole("link", { name: /IMDb/ })).toHaveAttribute(
      "href",
      "https://www.imdb.com/name/nm0000093/",
    );

    // Principais trabalhos: os mais votados, sem a participação como ele mesmo num talk show.
    const knownFor = page.getByRole("list", { name: "Principais trabalhos" });
    await expect(knownFor.getByRole("listitem")).toHaveCount(4);
    await expect(knownFor).not.toContainText("The Daily Show");

    // Filmografia de ator: do mais recente ao mais antigo, com o projeto sem data no topo.
    const acting = page.getByRole("list", { name: "Créditos em Atuação" }).getByRole("listitem");
    await expect(acting).toHaveCount(6);
    await expect(acting.nth(0)).toContainText("Em breve");
    await expect(acting.nth(1)).toContainText("2009");
    await expect(acting.nth(1)).toContainText("Aldo Raine");

    // Filtro de séries e troca de área: como produtor, os dois cargos no mesmo filme.
    await page.getByRole("button", { name: "Séries", exact: true }).click();
    await expect(acting).toHaveCount(2);
    await expect(acting.nth(1)).toContainText("1 episódio");

    await page.getByRole("button", { name: "Produção (1)" }).click();
    await page.getByRole("button", { name: "Tudo", exact: true }).click();
    const production = page.getByRole("list", { name: "Créditos em Produção" });
    await expect(production.getByRole("listitem")).toHaveCount(1);
    await expect(production).toContainText("Producer, Executive Producer");

    // Uma consulta só: há biografia em português.
    expect(tmdb.callsTo("person/287")).toHaveLength(1);
    expect(tmdb.callsTo("person/287")[0]?.searchParams.get("append_to_response")).toBe(
      "combined_credits,images,external_ids",
    );
  });

  test("usa a biografia em inglês, com aviso, quando falta a tradução", async ({ page, tmdb }) => {
    await page.goto("/pessoa/7467");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("David Fincher");
    await expect(page.getByText("Biografia disponível apenas em inglês.")).toBeVisible();
    const biography = page.getByText("American film director");
    await expect(biography).toBeVisible();
    await expect(page.locator("#biography-text")).toHaveAttribute("lang", "en");

    const languages = tmdb.callsTo("person/7467").map((url) => url.searchParams.get("language"));
    expect(languages).toEqual(["pt-BR", "en-US"]);
  });

  test("amplia as fotos num diálogo e navega entre elas", async ({ page }) => {
    await page.goto("/pessoa/287");

    await page.getByRole("button", { name: "Ampliar imagem 1 de 3" }).click();
    const dialog = page.getByRole("dialog", { name: "Imagem 1 de 3" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "Foto de Brad Pitt" })).toBeVisible();

    await dialog.getByRole("button", { name: "Próxima imagem" }).click();
    await expect(page.getByRole("dialog", { name: "Imagem 2 de 3" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("Navegação entre conteúdos", () => {
  test("do filme ao ator, da filmografia a outro filme e à direção", async ({ page }) => {
    await page.goto("/movie/550");

    // Filme → pessoa do elenco.
    await page
      .getByRole("list", { name: "Elenco principal" })
      .getByRole("link", { name: /Brad Pitt/ })
      .click();
    await expect(page).toHaveURL("/pessoa/287");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Brad Pitt");

    // Pessoa → filme da filmografia.
    await page
      .getByRole("list", { name: "Créditos em Atuação" })
      .getByRole("link", { name: /Clube da Luta/ })
      .click();
    await expect(page).toHaveURL("/movie/550");

    // Filme → direção, pela ficha técnica.
    await page
      .getByRole("complementary", { name: "Ficha técnica" })
      .getByRole("link", { name: "David Fincher" })
      .click();
    await expect(page).toHaveURL("/pessoa/7467");
    await expect(page.getByText("Perfil · Direção")).toBeVisible();
  });

  test("elenco e equipe completos ficam recolhidos e levam aos perfis", async ({ page }) => {
    await page.goto("/movie/550");

    const summary = page.getByText("Elenco e equipe completos (6)");
    const producer = page.getByRole("link", { name: /Art Linson/ });
    await expect(producer).toBeHidden();

    await summary.click();
    await expect(producer).toBeVisible();
    await expect(page.getByRole("list", { name: "Produção" })).toContainText("Producer");
    await expect(producer).toHaveAttribute("href", "/pessoa/7469");
  });

  test("os vídeos abrem no player da página e os atalhos levam às seções", async ({ page }) => {
    await page.goto("/movie/550");

    const videos = page.getByRole("list", { name: "Vídeos" });
    await expect(videos.getByRole("listitem")).toHaveCount(3);
    await videos.getByRole("button", { name: "Assistir: Nos bastidores" }).click();

    const player = page.getByRole("dialog", { name: /Nos bastidores/ });
    await expect(player.locator("iframe")).toHaveAttribute(
      "src",
      /youtube-nocookie\.com\/embed\/fixtureBehind/,
    );
    await page.keyboard.press("Escape");
    await expect(player).toBeHidden();

    const shortcuts = page.getByRole("navigation", { name: "Seções da página" });
    await expect(shortcuts.getByRole("link")).toHaveText([
      "Visão geral",
      "Onde assistir",
      "Elenco",
      "Vídeos",
      "Imagens",
      "Relacionados",
    ]);
    await shortcuts.getByRole("link", { name: "Imagens" }).click();
    await expect(page).toHaveURL("/movie/550#images");
    await expect(page.getByRole("heading", { level: 2, name: "Imagens" })).toBeInViewport();
  });

  test("do filme à coleção, com os filmes em ordem de lançamento", async ({ page, tmdb }) => {
    await page.goto("/movie/603");

    await page.getByRole("link", { name: /Parte da coleção.*Matrix: Coleção/ }).click();
    await expect(page).toHaveURL("/colecao/2344");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(collection2344.name);
    await expect(page.getByText("Coleção · 3 filmes")).toBeVisible();

    const parts = page.getByRole("list", { name: "Filmes da coleção" }).getByRole("listitem");
    await expect(parts).toHaveText([/Matrix\s*1999/, /Matrix Reloaded/, /Matrix Revolutions/]);
    expect(tmdb.callsTo("collection/2344")).toHaveLength(1);
  });
});

test.describe("Busca por categoria", () => {
  test("mostra a contagem de cada categoria e troca entre elas", async ({ page, tmdb }) => {
    await page.goto("/search?q=duna");

    const categories = page.getByRole("navigation", { name: "Categorias da busca" });
    await expect(categories.getByRole("link", { name: "3 resultados em Filmes" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const seriesTab = categories.getByRole("link", { name: "1 resultados em Séries" });
    await expect(seriesTab).toBeVisible();
    await expect(categories.getByRole("link", { name: "0 resultados em Pessoas" })).toBeVisible();

    await seriesTab.click();
    await expect(page).toHaveURL("/search?q=duna&tipo=series");
    const series = page.getByRole("list", { name: "Séries encontradas" });
    await expect(series.getByRole("listitem")).toHaveCount(1);
    await expect(series.getByRole("link", { name: /Duna: A Profecia/ })).toHaveAttribute(
      "href",
      "/serie/110492",
    );
    await expect(series.getByText("Série", { exact: true })).toBeVisible();

    // Uma consulta por categoria, todas com o mesmo termo.
    for (const path of ["search/movie", "search/tv", "search/person"]) {
      expect(tmdb.callsTo(path)[0]?.searchParams.get("query"), path).toBe("duna");
    }
  });

  test("encontra pessoas pelo nome e avisa quando só outra categoria tem resultados", async ({
    page,
  }) => {
    await page.goto("/search?q=brad");

    // Sem filmes para "brad", mas com uma pessoa: o estado vazio aponta as outras categorias.
    await expect(page.getByText("Nenhum filme encontrado")).toBeVisible();
    await expect(page.getByText("Veja se há resultados nas outras categorias.")).toBeVisible();

    await page.getByRole("link", { name: "1 resultados em Pessoas" }).click();
    await expect(page).toHaveURL("/search?q=brad&tipo=pessoas");
    const found = page.getByRole("list", { name: "Pessoas encontradas" });
    await expect(found.getByRole("listitem")).toHaveCount(1);
    await expect(found).toContainText("Atuação · Conhecido(a) por Clube da Luta, Seven");

    await found.getByRole("link", { name: /Brad Pitt/ }).click();
    await expect(page).toHaveURL("/pessoa/287");
  });
});

test.describe("Catálogos", () => {
  test("Descobrir alterna entre filmes e séries e filtra séries por gênero", async ({
    page,
    tmdb,
  }) => {
    await page.goto("/discover");

    const media = page.getByRole("navigation", { name: "Tipo de obra" });
    await expect(media.getByRole("link", { name: "Filmes" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await media.getByRole("link", { name: "Séries" }).click();

    await expect(page).toHaveURL("/discover?tipo=series");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Séries");
    await expect(page.getByText("6 séries")).toBeVisible();
    const results = page.getByRole("list", { name: "Séries encontradas" });
    await expect(results.getByRole("listitem")).toHaveCount(tvShows.results.length);
    // Séries não têm bilheteria.
    await expect(page.getByLabel("Ordenar por").getByRole("option")).toHaveText([
      "Mais populares",
      "Mais bem avaliados",
      "Lançamentos recentes",
    ]);

    await page.getByRole("button", { name: "Drama", exact: true }).click();
    await expect(page).toHaveURL("/discover?genre=18&tipo=series");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Séries de drama");

    const call = tmdb.callsTo("discover/tv").at(-1);
    expect(call?.searchParams.get("with_genres")).toBe("18");
    expect(call?.searchParams.has("region")).toBe(false);
    expect(tmdb.callsTo("genre/tv/list")).toHaveLength(1);
  });

  test("lista as pessoas populares com paginação pela URL", async ({ page, tmdb }) => {
    await page.goto("/pessoas");

    const list = page.getByRole("list", { name: "Pessoas populares" });
    await expect(list.getByRole("listitem")).toHaveCount(people.results.length);
    await expect(list).toContainText("Direção · Conhecido(a) por Clube da Luta");

    await page.getByRole("button", { name: "Próxima" }).click();
    await expect(page).toHaveURL("/pessoas?page=2");
    expect(tmdb.callsTo("person/popular").at(-1)?.searchParams.get("page")).toBe("2");
  });
});
