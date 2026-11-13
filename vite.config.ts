import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { cssLayerOrder } from "./build/cssLayerOrder.ts";
import { securityHeaders } from "./server/securityHeaders.ts";
import { tmdbDevProxy } from "./server/viteTmdbProxy.ts";

export default defineConfig(({ mode }) => {
  // Carrega também variáveis sem o prefixo VITE_; elas ficam só no servidor local.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      cssLayerOrder(),
      tmdbDevProxy({ apiKey: env.TMDB_API_KEY ?? process.env.TMDB_API_KEY }),
    ],
    // Mesmos cabeçalhos de segurança da Vercel, inclusive a CSP (testes E2E rodam no preview).
    preview: { headers: securityHeaders() },
    build: {
      // Uma única folha de estilo (cerca de 16 KB com gzip): o Início não espera três
      // arquivos de CSS antes de pintar (D-57).
      cssCodeSplit: false,
      rolldownOptions: {
        output: {
          // As bibliotecas num único pacote, em vez de vários arquivos pequenos na abertura
          // da página. As páginas continuam carregadas sob demanda.
          advancedChunks: {
            groups: [
              // As estatísticas da Vercel ficam fora: carregam depois da página (D-41).
              { name: "vendor", test: /node_modules\/(?!@vercel)/ },
            ],
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      include: [
        "src/**/*.test.{ts,tsx}",
        "server/**/*.test.ts",
        "api/**/*.test.ts",
        "build/**/*.test.ts",
      ],
      clearMocks: true,
      restoreMocks: true,
    },
  };
});
