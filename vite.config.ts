import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { tmdbDevProxy } from "./server/viteTmdbProxy.ts";

export default defineConfig(({ mode }) => {
  // Carrega também variáveis sem o prefixo VITE_; elas ficam só no servidor local.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tmdbDevProxy({ apiKey: env.TMDB_API_KEY ?? process.env.TMDB_API_KEY })],
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      include: [
        "src/**/*.test.{ts,tsx}",
        "server/**/*.test.ts",
        "api/**/*.test.ts",
        "tests/**/*.test.js",
      ],
      clearMocks: true,
      restoreMocks: true,
    },
  };
});
