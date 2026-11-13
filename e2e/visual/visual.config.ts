import { defineConfig, devices } from "@playwright/test";

/**
 * Regressão visual comparativa (D-62).
 *
 * Não há imagens de referência no repositório: no CI, a mesma suíte captura primeiro a
 * base do PR (`--update-snapshots`) e depois compara a branch com ela, no mesmo container.
 * Assim a referência e a comparação usam o mesmo navegador, as mesmas fontes e as mesmas
 * fixtures, e uma diferença é sempre uma mudança de interface, não de ambiente.
 *
 * VISUAL_SNAPSHOT_DIR: onde ficam as capturas de referência.
 */
const PORT = 4174;
const snapshotDir = process.env.VISUAL_SNAPSHOT_DIR ?? "visual-baseline";
const WIDTHS = [320, 375, 768, 1024, 1440] as const;

export default defineConfig({
  testDir: ".",
  testMatch: /visual\.spec\.ts/,
  snapshotPathTemplate: `${snapshotDir}/{arg}-{projectName}{ext}`,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../../visual-report" }]],
  outputDir: "../../visual-results",
  expect: {
    // Antialiasing de texto varia alguns pixels entre execuções; mudanças de layout não.
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" },
  },
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    reducedMotion: "reduce",
  },
  projects: WIDTHS.map((width) => ({
    name: `w${String(width)}`,
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      hasTouch: width < 1024,
    },
  })),
  webServer: {
    command: `npm run build && npm run preview -- --port ${String(PORT)} --strictPort`,
    cwd: "../..",
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { TMDB_API_KEY: "" },
  },
});
