import type { ReactNode } from "react";
import { PiArrowClockwise, PiFilmSlate, PiWarningCircle } from "react-icons/pi";
import { messages } from "../../i18n";
import "./StateMessage.css";

const ICONS = {
  error: PiWarningCircle,
  empty: PiFilmSlate,
} as const;

interface StateMessageProps {
  tone?: keyof typeof ICONS | undefined;
  title?: string | undefined;
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
  action?: ReactNode | undefined;
  compact?: boolean | undefined;
}

/** Estados de erro e vazio com mensagem clara e ação opcional. */
const StateMessage = ({
  tone = "empty",
  title,
  message,
  onRetry,
  action,
  compact = false,
}: StateMessageProps) => {
  const Icon = ICONS[tone];

  return (
    <div
      className={`state ${compact ? "state--compact" : ""} state--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className="state__icon" aria-hidden="true" />
      <div className="state__body">
        {title && <p className="state__title">{title}</p>}
        {message && <p className="state__message">{message}</p>}
      </div>
      {(onRetry ?? action) && (
        <div className="state__actions">
          {onRetry && (
            <button type="button" className="btn btn--ghost" onClick={onRetry}>
              <PiArrowClockwise aria-hidden="true" /> {messages.common.retry}
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );
};

export default StateMessage;
