import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

// O build e os testes rodam a partir da raiz do projeto.
const LAYERS_FILE = resolve(process.cwd(), "src/styles/layers.css");

/** Extrai a declaração `@layer a, b, c;` de src/styles/layers.css (fonte única da ordem). */
export function readLayerStatement(source = readFileSync(LAYERS_FILE, "utf8")): string {
  const match = /@layer\s+[\w-]+(?:\s*,\s*[\w-]+)*\s*;/.exec(source);
  if (!match) throw new Error("src/styles/layers.css: declaração @layer não encontrada");
  return match[0]
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*;$/, ";");
}

/**
 * Garante a ordem das camadas no CSS de produção (D-58).
 *
 * No build, o CSS de todos os módulos é concatenado num único arquivo, e a ordem dessa
 * concatenação segue o grafo de módulos, não a ordem dos imports em main.tsx: o CSS de um
 * componente pode chegar antes de layers.css. Como a ordem das camadas é a da primeira
 * aparição, isso inverteria a cascata. O plugin põe a declaração no início de cada folha
 * de estilo emitida, antes de qualquer bloco.
 */
export function cssLayerOrder(): Plugin {
  const statement = readLayerStatement();
  return {
    name: "cinelux:css-layer-order",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) continue;
        const css =
          typeof asset.source === "string" ? asset.source : new TextDecoder().decode(asset.source);
        asset.source = `${statement}${css}`;
      }
    },
  };
}
