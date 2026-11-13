/**
 * Executa `callback` depois que a página terminou de carregar e o navegador ficou ocioso
 * (D-63): o que não é necessário para a primeira tela não disputa rede nem processamento
 * com ela. Devolve uma função que cancela o agendamento.
 */
export function whenIdleAfterLoad(callback: () => void, timeout = 2000): () => void {
  let cancelled = false;
  let idleHandle: number | undefined;
  const run = () => {
    if (cancelled) return;
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(callback, { timeout });
    } else {
      idleHandle = window.setTimeout(callback, 1);
    }
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (idleHandle === undefined) return;
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
    else window.clearTimeout(idleHandle);
  };
}
