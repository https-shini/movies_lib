import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { clearTmdbCache } from "./src/services/tmdb";

afterEach(() => {
  cleanup();
  // O cache de respostas é global: cada teste começa sem nada guardado.
  clearTmdbCache();
});
