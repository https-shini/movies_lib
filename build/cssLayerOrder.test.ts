// @vitest-environment node
import { describe, expect, it } from "vitest";
import { cssLayerOrder, readLayerStatement } from "./cssLayerOrder.ts";

interface Asset {
  type: "asset";
  fileName: string;
  source: string | Uint8Array;
}

function runPlugin(bundle: Record<string, Asset | { type: "chunk"; fileName: string }>): void {
  const plugin = cssLayerOrder();
  const hook = plugin.generateBundle as unknown as (o: unknown, b: typeof bundle) => void;
  hook.call({}, {}, bundle);
}

describe("readLayerStatement", () => {
  it("lê a ordem das camadas de src/styles/layers.css", () => {
    expect(readLayerStatement()).toBe(
      "@layer tokens,base,typography,primitives,layout,components,pages,utilities,overrides;",
    );
  });

  it("ignora comentários e normaliza espaços", () => {
    expect(readLayerStatement("/* x */\n@layer a ,\n  b,c ;")).toBe("@layer a,b,c;");
  });

  it("falha quando não há declaração", () => {
    expect(() => readLayerStatement(".a{}")).toThrow(/não encontrada/);
  });
});

describe("cssLayerOrder", () => {
  it("põe a declaração antes de um bloco que chegou primeiro na concatenação", () => {
    const css: Asset = {
      type: "asset",
      fileName: "assets/style.css",
      source: "@layer components{.a{}}@layer tokens{}",
    };
    runPlugin({ css });
    expect(String(css.source)).toMatch(/^@layer tokens,base,[a-z,]+;@layer components\{/);
  });

  it("aceita fonte binária e não toca em outros arquivos", () => {
    const css: Asset = {
      type: "asset",
      fileName: "a.css",
      source: new TextEncoder().encode(".a{}"),
    };
    const svg: Asset = { type: "asset", fileName: "a.svg", source: "<svg/>" };
    runPlugin({ css, svg, js: { type: "chunk", fileName: "a.js" } });
    expect(String(css.source)).toMatch(/^@layer [a-z,]+;\.a\{\}$/);
    expect(svg.source).toBe("<svg/>");
  });
});
