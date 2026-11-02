import test from "node:test";
import assert from "node:assert/strict";

import { formatCurrency, formatRating, formatRuntime } from "../src/utils/formatters.js";

test("formatCurrency formats positive amounts as USD using pt-BR locale", () => {
  assert.equal(formatCurrency(1250000), "US$ 1.250.000");
});

test("formatCurrency handles missing, zero, negative and non-finite values", () => {
  assert.equal(formatCurrency(0), "Não informado");
  assert.equal(formatCurrency(-10), "Não informado");
  assert.equal(formatCurrency(Number.NaN), "Não informado");
  assert.equal(formatCurrency(Number.POSITIVE_INFINITY), "Não informado");
});

test("formatRuntime formats minutes and hours", () => {
  assert.equal(formatRuntime(45), "45 min");
  assert.equal(formatRuntime(60), "1h");
  assert.equal(formatRuntime(125), "2h 5min");
});

test("formatRuntime handles unavailable values", () => {
  assert.equal(formatRuntime(0), "Não informada");
  assert.equal(formatRuntime(null), "Não informada");
  assert.equal(formatRuntime(Number.NaN), "Não informada");
});

test("formatRating uses one decimal place", () => {
  assert.equal(formatRating(8), "8,0");
  assert.equal(formatRating(7.25), "7,3");
});

test("formatRating rejects values outside the TMDB range", () => {
  assert.equal(formatRating(-1), "N/A");
  assert.equal(formatRating(10.1), "N/A");
  assert.equal(formatRating(Number.NaN), "N/A");
});
