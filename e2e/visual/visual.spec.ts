import { expect, loadWholePage, test } from "../helpers/test.ts";

/** Páginas capturadas inteiras, com os dados simulados das fixtures (D-62). */
const pages = [
  ["inicio", "/"],
  ["descobrir", "/discover?genre=18"],
  ["descobrir-series", "/discover?tipo=series"],
  ["busca", "/search?q=duna"],
  ["busca-vazia", "/search"],
  ["filme", "/movie/550"],
  ["serie", "/serie/1396"],
  ["temporada", "/serie/1396/temporada/1"],
  ["pessoa", "/pessoa/287"],
  ["pessoas", "/pessoas"],
  ["colecao", "/colecao/2344"],
  ["lista", "/minha-lista"],
  ["sobre", "/sobre"],
  ["privacidade", "/privacidade"],
  ["404", "/rota-que-nao-existe"],
] as const;

for (const [name, path] of pages) {
  test(name, async ({ page, consoleErrors }) => {
    // Na base do PR, uma rota nova ainda não existe e pode registrar 404.
    consoleErrors.allow(/404/);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await loadWholePage(page);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
