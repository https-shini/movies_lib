import { useSyncExternalStore } from "react";
import { PiCheckCircle, PiInfo, PiWarningCircle, PiX } from "react-icons/pi";
import { messages } from "../../i18n";
import { dismissToast, getToasts, subscribeToasts, type ToastTone } from "../../lib/toast";
import toasterStyles from "./Toaster.css?url";
import { loadStylesheet } from "../../lib/stylesheet";

// Fora do CSS global: os avisos só aparecem depois de uma ação (D-63).
void loadStylesheet(toasterStyles);

const icons: Record<ToastTone, typeof PiInfo | null> = {
  neutral: null,
  success: PiCheckCircle,
  info: PiInfo,
  danger: PiWarningCircle,
};

/**
 * Região de avisos temporários. Fica sempre no DOM (vazia) para que leitores de tela já
 * conheçam a região viva antes do primeiro aviso; erros são anunciados com prioridade.
 */
const Toaster = () => {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  return (
    <section className="toaster" aria-label={messages.toast.region}>
      <div role="status" aria-live="polite">
        <ol className="toaster__list">
          {toasts.map((toast) => {
            const Icon = icons[toast.tone];
            return (
              <li key={toast.id} className={`toast toast--${toast.tone}`}>
                {Icon ? <Icon className="toast__icon" aria-hidden="true" /> : null}
                <p className="toast__message">{toast.message}</p>
                {toast.action ? (
                  <button
                    type="button"
                    className="toast__action"
                    onClick={() => {
                      toast.action?.onAction();
                      dismissToast(toast.id);
                    }}
                  >
                    {toast.action.label}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="toast__close icon-btn"
                  aria-label={messages.toast.dismiss}
                  onClick={() => {
                    dismissToast(toast.id);
                  }}
                >
                  <PiX aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Toaster;
