/**
 * Avisos temporários (toasts) do Cinelux: um store mínimo, sem dependência, lido com
 * useSyncExternalStore (D-60). Cada aviso some sozinho; quem tem uma ação ("Desfazer")
 * fica mais tempo na tela, para dar tempo de usar o teclado ou o leitor de tela.
 */
export type ToastTone = "neutral" | "success" | "danger" | "info";

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastAction | undefined;
}

export const TOAST_MS = 3500;
export const TOAST_WITH_ACTION_MS = 6500;
/** Mais de três avisos ao mesmo tempo só poluem a tela: os mais antigos saem. */
export const TOAST_LIMIT = 3;

let toasts: readonly Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, number>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): readonly Toast[] {
  return toasts;
}

export function dismissToast(id: number): void {
  const timer = timers.get(id);
  if (timer !== undefined) window.clearTimeout(timer);
  timers.delete(id);
  if (!toasts.some((toast) => toast.id === id)) return;
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function showToast(
  message: string,
  options: { tone?: ToastTone; action?: ToastAction } = {},
): number {
  const id = nextId++;
  const toast: Toast = { id, message, tone: options.tone ?? "neutral", action: options.action };
  const overflow = toasts.length + 1 - TOAST_LIMIT;
  if (overflow > 0) for (const old of toasts.slice(0, overflow)) dismissToast(old.id);
  toasts = [...toasts, toast];
  timers.set(
    id,
    window.setTimeout(
      () => {
        dismissToast(id);
      },
      options.action ? TOAST_WITH_ACTION_MS : TOAST_MS,
    ),
  );
  emit();
  return id;
}

/** Só para testes: volta ao estado inicial. */
export function resetToasts(): void {
  for (const timer of timers.values()) window.clearTimeout(timer);
  timers.clear();
  toasts = [];
  emit();
}
