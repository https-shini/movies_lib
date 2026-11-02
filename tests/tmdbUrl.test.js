import test from "node:test";
import assert from "node:assert/strict";

import { buildTmdbUrl } from "../src/services/tmdbUrl.js";

const baseConfig = {
  baseUrl: "https://api.themoviedb.org/3/movie/",
  endpoint: "top_rated",
  apiKey: "sample-key",
};

test("buildTmdbUrl resolves a relative endpoint against the configured base URL", () => {
  const url = buildTmdbUrl(baseConfig);
  assert.equal(url.origin, "https://api.themoviedb.org");
  assert.equal(url.pathname, "/3/movie/top_rated");
  assert.equal(url.searchParams.get("api_key"), "sample-key");
});

test("buildTmdbUrl accepts an absolute endpoint for search requests", () => {
  const url = buildTmdbUrl({
    ...baseConfig,
    endpoint: "https://api.themoviedb.org/3/search/movie",
  });

  assert.equal(url.pathname, "/3/search/movie");
});

test("buildTmdbUrl accepts a parameterized API key configuration", () => {
  const url = buildTmdbUrl({ ...baseConfig, apiKey: "api_key=another-key" });
  assert.equal(url.searchParams.get("api_key"), "another-key");
});

test("buildTmdbUrl does not overwrite an API key already present in the endpoint", () => {
  const url = buildTmdbUrl({
    ...baseConfig,
    endpoint: "https://api.themoviedb.org/3/movie/top_rated?api_key=endpoint-key",
  });

  assert.equal(url.searchParams.get("api_key"), "endpoint-key");
});

test("buildTmdbUrl encodes query parameters and ignores empty values", () => {
  const url = buildTmdbUrl({
    ...baseConfig,
    params: { query: "ação & aventura", page: 2, language: "", absent: undefined, empty: null },
  });

  assert.equal(url.searchParams.get("query"), "ação & aventura");
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(url.searchParams.has("language"), false);
  assert.equal(url.searchParams.has("absent"), false);
  assert.equal(url.searchParams.has("empty"), false);
});

test("buildTmdbUrl rejects missing configuration", () => {
  assert.throws(() => buildTmdbUrl({ ...baseConfig, apiKey: "" }), /VITE_API_KEY/);
  assert.throws(() => buildTmdbUrl({ ...baseConfig, baseUrl: "" }), /VITE_API/);
});
