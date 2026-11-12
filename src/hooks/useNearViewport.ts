import { useEffect, useState, type RefObject } from "react";

/** Distância da área visível a partir da qual o conteúdo sob demanda começa a carregar. */
export const NEAR_VIEWPORT_MARGIN = "200px 0px";

/**
 * Fica `true` quando o elemento entra na área visível ou chega perto dela, e continua
 * `true` depois disso. Sem IntersectionObserver (navegadores antigos, testes em jsdom),
 * já começa `true`: o conteúdo carrega como antes, sem ficar preso no estado de espera.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  rootMargin: string = NEAR_VIEWPORT_MARGIN,
): boolean {
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (near || !element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref, near, rootMargin]);

  return near;
}
