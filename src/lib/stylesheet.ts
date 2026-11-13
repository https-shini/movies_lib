/**
 * Folhas de estilo carregadas sob demanda (D-63).
 *
 * O CSS global vai num arquivo só (D-57), e tudo nele bloqueia a primeira pintura de toda
 * página. O que só uma rota ou uma interação usa fica fora dele e é carregado aqui. A
 * ordem da cascata não depende de quando a folha chega: as camadas já foram declaradas
 * pelo CSS global (D-58), então as regras caem na camada que declaram.
 */
const pending = new Map<string, Promise<void>>();

export function loadStylesheet(href: string): Promise<void> {
  const known = pending.get(href);
  if (known) return known;
  const promise = new Promise<void>((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    // Uma falha de rede não deve travar a página: ela abre sem os estilos extras.
    link.addEventListener("load", () => {
      resolve();
    });
    link.addEventListener("error", () => {
      pending.delete(href);
      resolve();
    });
    document.head.append(link);
  });
  pending.set(href, promise);
  return promise;
}
