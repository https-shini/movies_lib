import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist/",
    "coverage/",
    "node_modules/",
    ".vercel/",
    "playwright-report/",
    "test-results/",
  ]),

  js.configs.recommended,

  // TypeScript com verificação de tipos (src, api, server e configs)
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },

  // Código de interface: hooks e acessibilidade
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    extends: [reactHooks.configs.flat["recommended-latest"], jsxA11y.configs.recommended],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // role="list" é intencional: o Safari/VoiceOver remove a semântica de lista
      // quando o CSS usa list-style: none (ver docs/DECISIONS.md, D-12).
      "jsx-a11y-x/no-redundant-roles": ["error", { ul: ["list"], ol: ["list"] }],
    },
  },

  // Código executado no Node (função da Vercel, proxy local, configs e testes, inclusive E2E)
  {
    files: [
      "api/**",
      "server/**",
      "e2e/**",
      "*.config.{js,ts}",
      "tests/**",
      "**/*.test.{js,ts,tsx}",
    ],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },

  // Arquivos JavaScript ainda não migrados (removidos ao fim da Fase 5)
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },

  prettier,
]);
