import { person287 } from "../fixtures/index.ts";
import { expect, test } from "../helpers/test.ts";
import type { PersonCredit } from "../../src/types/tmdb.ts";

/** Perfil de pessoa: casos especiais e exibição progressiva da filmografia (D-66). */

/** Créditos fictícios de atuação, do mais recente ao mais antigo (2024, 2023...). */
function actingCredits(count: number, mediaType: "movie" | "tv" = "movie"): PersonCredit[] {
  return Array.from({ length: count }, (_, index) => ({
    id: 900000 + index + (mediaType === "tv" ? 5000 : 0),
    credit_id: `c-${mediaType}-${String(index)}`,
    media_type: mediaType,
    ...(mediaType === "tv"
      ? { name: `Série ${String(index + 1)}`, first_air_date: `${String(2024 - index)}-01-01` }
      : { title: `Filme ${String(index + 1)}`, release_date: `${String(2024 - index)}-01-01` }),
    character: `Papel ${String(index + 1)}`,
    poster_path: null,
    vote_average: 7,
    vote_count: 10,
  }));
}

test.describe("Pessoa: filmografia progressiva", () => {
  test("mostra 30 créditos, revela todos e volta a 30 ao trocar os filtros", async ({
    page,
    tmdb,
  }) => {
    tmdb.on("person/287", {
      body: {
        ...person287,
        combined_credits: {
          cast: [...actingCredits(70), ...actingCredits(5, "tv")],
          crew: person287.combined_credits?.crew ?? [],
        },
      },
    });
    await page.goto("/pessoa/287");

    const list = page.getByRole("list", { name: "Créditos em Atuação" });
    const rows = list.getByRole("listitem");
    await expect(rows).toHaveCount(30);
    const showAll = page.getByRole("button", { name: "Mostrar todos (75)" });
    await expect(showAll).toHaveAttribute("aria-controls", "filmography-list");

    // Pelo teclado: o foco vai para o primeiro crédito revelado, não se perde.
    await showAll.focus();
    await page.keyboard.press("Enter");
    await expect(rows).toHaveCount(75);
    await expect(showAll).toHaveCount(0);
    await expect(rows.nth(30).getByRole("link")).toBeFocused();

    // Trocar o tipo reinicia a exibição; um filtro com poucos créditos não mostra o botão.
    await page.getByRole("button", { name: "Filmes", exact: true }).click();
    await expect(rows).toHaveCount(30);
    await expect(page.getByRole("button", { name: "Mostrar todos (70)" })).toBeVisible();
    await page.getByRole("button", { name: "Séries", exact: true }).click();
    await expect(rows).toHaveCount(5);
    await expect(page.getByRole("button", { name: /^Mostrar todos/ })).toHaveCount(0);

    // Trocar a área também reinicia, e a volta para Atuação começa de novo em 30.
    await page.getByRole("button", { name: "Tudo", exact: true }).click();
    await page.getByRole("button", { name: "Mostrar todos (75)" }).click();
    await page.getByRole("button", { name: /^Produção/ }).click();
    await page.getByRole("button", { name: /^Atuação/ }).click();
    await expect(rows).toHaveCount(30);
  });

  test("filmografia curta não tem botão de mostrar todos", async ({ page }) => {
    await page.goto("/pessoa/287");
    await expect(
      page.getByRole("list", { name: "Créditos em Atuação" }).getByRole("listitem"),
    ).toHaveCount(6);
    await expect(page.getByRole("button", { name: /^Mostrar todos/ })).toHaveCount(0);
  });
});

test.describe("Pessoa: casos especiais", () => {
  test("sem foto e sem biografia: monograma com as iniciais e aviso", async ({ page, tmdb }) => {
    tmdb.on("person/287", { body: { ...person287, profile_path: null, biography: "" } });
    await page.goto("/pessoa/287");

    const header = page.locator(".person-head");
    await expect(header.locator("img")).toHaveCount(0);
    const monogram = header.locator(".person-head__monogram");
    await expect(monogram).toHaveText("BP");
    // Decorativo: o nome já está no título da página.
    await expect(monogram).toHaveAttribute("aria-hidden", "true");
    const box = await header.locator(".person-head__photo").boundingBox();
    expect(box && Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);

    await expect(
      page.getByText("O TMDB ainda não tem uma biografia para esta pessoa."),
    ).toBeVisible();
  });

  test("projeto sem data: 'Em breve' na lateral, sem quebrar a coluna de ano", async ({ page }) => {
    await page.goto("/pessoa/287");
    const first = page
      .getByRole("list", { name: "Créditos em Atuação" })
      .getByRole("listitem")
      .first();
    await expect(first.locator(".filmography__aside .badge")).toHaveText("Em breve");
    const year = first.locator(".filmography__year");
    await expect(year).toHaveAttribute("aria-hidden", "true");
    // A coluna de ano mostra só um traço, que cabe nela: nada transborda nem quebra linha.
    await expect(year).toHaveText("—");
    const [overflow, height, lineHeight] = await year.evaluate((element) => [
      element.scrollWidth - element.clientWidth,
      element.getBoundingClientRect().height,
      parseFloat(getComputedStyle(element).lineHeight),
    ]);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(height).toBeLessThanOrEqual(lineHeight + 1);
  });

  test("biografia longa: abertura com capitular e recolhida até ler a completa", async ({
    page,
    tmdb,
  }) => {
    const long = `${"Primeiro parágrafo longo da biografia. ".repeat(12)}\n\n${"Segundo parágrafo. ".repeat(30)}`;
    tmdb.on("person/287", { body: { ...person287, biography: long } });
    await page.goto("/pessoa/287");

    const first = page.locator("#biography-text p").first();
    await expect(first).toHaveClass(/person-bio__first/);
    const capital = await first.evaluate(
      (element) => getComputedStyle(element, "::first-letter").float,
    );
    expect(capital).toBe("left");

    const more = page.getByRole("button", { name: "Ler a biografia completa" });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await more.click();
    await expect(page.getByRole("button", { name: "Mostrar menos" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});

test.describe("Alto contraste do sistema", () => {
  for (const [path, selector] of [
    ["/", ".ranked__number"],
    ["/pessoa/287", ".person-head__monogram"],
  ] as const) {
    test(`texto em gradiente volta à cor sólida em ${path}`, async ({ page, tmdb }) => {
      tmdb.on("person/287", { body: { ...person287, profile_path: null } });
      await page.emulateMedia({ forcedColors: "active" });
      await page.goto(path);
      const element = page.locator(selector).first();
      await element.scrollIntoViewIfNeeded();
      await expect(element).toBeVisible();
      // Sem a regra, o texto continua recortado no fundo (que o navegador remove).
      expect(await element.evaluate((node) => getComputedStyle(node).backgroundClip)).not.toBe(
        "text",
      );
    });
  }
});
