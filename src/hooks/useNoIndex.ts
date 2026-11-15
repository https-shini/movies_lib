import { useEffect } from "react";

/**
 * Pede aos buscadores que não indexem a página atual (D-69): 404 e conteúdo inexistente.
 *
 * A SPA responde HTTP 200 para qualquer rota (o `index.html`), então a meta tag é o único
 * sinal disponível sem mudar a infraestrutura. Ela é criada ao montar e removida ao
 * desmontar; uma contagem de uso evita que um componente remova a tag de outro, e que a
 * navegação para uma página válida carregue o `noindex` da anterior.
 */
const SELECTOR = 'meta[name="robots"][data-cinelux-noindex]';
let users = 0;

function addTag(): void {
  if (document.head.querySelector(SELECTOR)) return;
  const meta = document.createElement("meta");
  meta.name = "robots";
  meta.content = "noindex";
  meta.setAttribute("data-cinelux-noindex", "");
  document.head.append(meta);
}

function removeTag(): void {
  document.head.querySelector(SELECTOR)?.remove();
}

export function useNoIndex(active = true): void {
  useEffect(() => {
    if (!active) return undefined;
    users += 1;
    addTag();
    return () => {
      users -= 1;
      if (users === 0) removeTag();
    };
  }, [active]);
}
