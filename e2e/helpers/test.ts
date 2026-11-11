import { test as base, expect, type Page } from "@playwright/test";
import { BREAKPOINTS } from "../../src/styles/breakpoints.ts";
import { installTmdbMock, type TmdbMock } from "./tmdb.ts";

/**
 * `test` dos testes de interface do Cinelux. Cada teste recebe automaticamente:
 * - `tmdb`: o proxy /api/tmdb simulado com fixtures (ver tmdb.ts);
 * - rede externa bloqueada: imagens do TMDB viram um PNG local e o player do YouTube
 *   vira uma página vazia; qualquer outro domínio externo (inclusive o Google Fonts,
 *   que deixou de ser usado) faz o teste falhar;
 * - `consoleErrors`: o teste falha se o navegador registrar erros não esperados.
 */

export interface ConsoleGuard {
  /** Aceita erros de console que combinem com o padrão (ex.: o 503 de um teste de erro). */
  allow(pattern: RegExp): void;
}

/** PNG transparente de 1×1 px, usado no lugar das imagens do TMDB. */
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

async function isolateNetwork(page: Page, blocked: string[]): Promise<void> {
  // Scripts do Vercel Web Analytics e Speed Insights: não existem no `vite preview`.
  await page.route("**/_vercel/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
  );

  await page.route(
    (url) => url.hostname !== "localhost" && url.hostname !== "127.0.0.1",
    async (route) => {
      const { hostname } = new URL(route.request().url());
      if (hostname === "image.tmdb.org") {
        await route.fulfill({ status: 200, contentType: "image/png", body: PIXEL });
      } else if (hostname === "www.youtube-nocookie.com") {
        await route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<!doctype html><title>Player simulado</title>",
        });
      } else {
        blocked.push(hostname);
        await route.abort("blockedbyclient");
      }
    },
  );
}

declare global {
  interface Window {
    __cspViolations?: string[];
  }
}

export const test = base.extend<{
  tmdb: TmdbMock;
  consoleErrors: ConsoleGuard;
  cspViolations: undefined;
}>({
  // A CSP da produção também vale no `vite preview` (em modo de bloqueio, D-43): qualquer
  // violação registrada pelo navegador faz o teste falhar (D-39).
  cspViolations: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        window.__cspViolations = [];
        document.addEventListener("securitypolicyviolation", (event) => {
          window.__cspViolations?.push(
            `${event.effectiveDirective}: ${event.blockedURI || "(inline)"}`,
          );
        });
      });

      await use(undefined);

      const violations = await page
        .evaluate(() => window.__cspViolations ?? [])
        .catch(() => [] as string[]);
      expect(violations, "violações da Content-Security-Policy").toEqual([]);
    },
    { auto: true },
  ],

  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      const allowed: RegExp[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

      await use({ allow: (pattern) => allowed.push(pattern) });

      const unexpected = errors.filter((text) => !allowed.some((pattern) => pattern.test(text)));
      expect(unexpected, "erros inesperados no console do navegador").toEqual([]);
    },
    { auto: true },
  ],

  tmdb: [
    async ({ page }, use) => {
      const blocked: string[] = [];
      await isolateNetwork(page, blocked);
      const mock = await installTmdbMock(page);

      await use(mock);

      expect(mock.unknown, "endpoints do TMDB pedidos sem fixture").toEqual([]);
      expect(blocked, "requisições a domínios externos inesperados").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** A partir de 900 px o cabeçalho mostra navegação e busca; abaixo, a barra inferior. */
export const DESKTOP_MIN_WIDTH = BREAKPOINTS.xl;

export function isDesktopLayout(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH;
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const { scrollWidth, clientWidth } = document.documentElement;
    return scrollWidth - clientWidth;
  });
  expect(overflow, "a página não pode rolar na horizontal").toBeLessThanOrEqual(0);
}

/** Uma promessa controlada pelo teste, para segurar uma resposta simulada. */
export function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
