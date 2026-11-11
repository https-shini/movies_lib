import { defineConfig, devices, type Project } from "@playwright/test";

/**
 * Testes de interface (E2E) do Cinelux.
 *
 * - Rodam contra o build de produção servido por `vite preview`, nunca contra a Vercel.
 * - As respostas de /api/tmdb vêm de fixtures locais (e2e/fixtures), interceptadas no
 *   navegador; nenhum teste usa a rede externa nem uma chave do TMDB.
 * - Cada teste de interface roda nos sete tamanhos de tela: os cinco do Bloco B (D-33)
 *   e 390/420 px, celulares grandes comuns no Brasil (D-48).
 */

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

/** Larguras em pixels CSS (viewport), não a resolução física do aparelho. */
export const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 720, touch: true },
  { name: "mobile-375", width: 375, height: 812, touch: true },
  { name: "mobile-390", width: 390, height: 844, touch: true },
  { name: "mobile-420", width: 420, height: 900, touch: true },
  { name: "tablet-768", width: 768, height: 1024, touch: true },
  { name: "desktop-1024", width: 1024, height: 768, touch: false },
  { name: "desktop-1440", width: 1440, height: 900, touch: false },
] as const;

const viewportProjects: Project[] = VIEWPORTS.map(({ name, width, height, touch }) => ({
  name,
  testIgnore: /(proxy|headers)\.spec\.ts/,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: touch,
  },
}));

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: isCI,
  // Sem novas tentativas: um teste instável deve falhar e ser corrigido, não escondido.
  retries: 0,
  ...(isCI ? { workers: 2 } : {}),
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    ...viewportProjects,
    // O proxy e os cabeçalhos são testados por HTTP, uma única vez, sem navegador.
    { name: "proxy", testMatch: /(proxy|headers)\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    // Sempre um servidor novo: reaproveitar um `npm run preview` aberto poderia usar a chave do .env.
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
    // O servidor dos testes nunca usa uma chave real, mesmo com um .env presente:
    // a variável vazia no ambiente tem prioridade sobre o arquivo (loadEnv do Vite).
    env: { TMDB_API_KEY: "" },
  },
});
