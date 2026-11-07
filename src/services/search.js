import { normalizePage } from "./pagination.js";

export function buildSearchParams({ query, page = 1 }) {
  return {
    query: typeof query === "string" ? query.trim() : "",
    language: "pt-BR",
    include_adult: false,
    page: normalizePage(page),
  };
}
