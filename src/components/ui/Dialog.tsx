import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { PiX } from "react-icons/pi";
import { messages } from "../../i18n";
import "./Dialog.css";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  /** "sheet": painel inferior no celular; "media": vídeo em destaque. */
  variant?: "sheet" | "media" | undefined;
  footer?: ReactNode | undefined;
  children?: ReactNode | undefined;
}

/**
 * Modal acessível sobre o <dialog> nativo: foco preso, Esc e fundo inerte.
 * No celular, a variante "sheet" aparece como painel inferior.
 */
const Dialog = ({
  open,
  onClose,
  title,
  description,
  variant = "sheet",
  footer,
  children,
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    // Clique no fundo (fora da caixa) fecha o diálogo.
    if (event.target === ref.current) onClose();
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  return (
    // O clique no fundo é só um atalho de mouse: pelo teclado o diálogo fecha com Esc
    // (evento cancel) e pelo botão "Fechar", então não há perda de acesso.
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={`dialog dialog--${variant}`}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className="dialog__box">
        <header className="dialog__header">
          <div>
            <h2 id={titleId} className="dialog__title">
              {title}
            </h2>
            {description && <p className="dialog__description">{description}</p>}
          </div>
          <button
            type="button"
            className="icon-btn dialog__close"
            onClick={onClose}
            aria-label={messages.common.close}
          >
            <PiX aria-hidden="true" />
          </button>
        </header>
        <div className="dialog__body">{open ? children : null}</div>
        {footer && <footer className="dialog__footer">{footer}</footer>}
      </div>
    </dialog>
  );
};

export default Dialog;
