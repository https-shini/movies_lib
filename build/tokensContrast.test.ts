// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/tokens.css"), "utf8");

/**
 * Contraste da paleta (WCAG 2.2, critério 1.4.3). Lê tokens.css e resolve as cores
 * sólidas, para que um token novo ou alterado não passe sem conferência (D-59).
 */
const rootBlock = css.slice(0, css.indexOf("@media"));
const declarations = new Map(
  [...rootBlock.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1] ?? "", (m[2] ?? "").trim()]),
);

function resolveHex(token: string, depth = 0): string {
  const value = declarations.get(token);
  if (value === undefined) throw new Error(`token ausente: ${token}`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  if (ref?.[1] !== undefined && depth < 8) return resolveHex(ref[1], depth + 1);
  if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value))
    throw new Error(`${token} não é cor sólida: ${value}`);
  return value.length === 4 ? `#${value.slice(1).replace(/./g, "$&$&")}` : value;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const surfaces = [
  "--color-bg",
  "--color-surface-base",
  "--color-surface-elevated",
  "--color-surface-raised",
];
const textTokens = [
  "--color-text-heading",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-tertiary",
  "--color-accent-default",
  "--color-accent-hover",
  "--color-secondary",
  "--color-tertiary",
  "--color-editorial",
  "--color-danger",
  "--color-success",
  "--color-warning",
  "--color-info",
];

describe("contraste dos tokens", () => {
  it("calcula a razão conhecida de preto sobre branco", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  for (const text of textTokens) {
    for (const surface of surfaces) {
      it(`${text} sobre ${surface} tem pelo menos 4,5:1`, () => {
        expect(contrast(resolveHex(text), resolveHex(surface))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  // Texto escuro sobre os preenchimentos fortes (botões, selos e gradiente de marca).
  for (const fill of [
    "--color-accent-default",
    "--color-accent-hover",
    "--gold-300",
    "--ember-500",
  ]) {
    it(`--color-accent-on sobre ${fill} tem pelo menos 4,5:1`, () => {
      expect(contrast(resolveHex("--color-accent-on"), resolveHex(fill))).toBeGreaterThanOrEqual(
        4.5,
      );
    });
  }
});
