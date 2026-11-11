import { PiArrowClockwise, PiFilmSlate, PiWarningCircle } from "react-icons/pi";
import "./StateMessage.css";

const ICONS = {
  error: PiWarningCircle,
  empty: PiFilmSlate,
};

/**
 * Estados de erro e vazio com mensagem clara e ação opcional.
 */
const StateMessage = ({ tone = "empty", title, message, onRetry, action, compact = false }) => {
  const Icon = ICONS[tone] ?? PiFilmSlate;

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
      {(onRetry || action) && (
        <div className="state__actions">
          {onRetry && (
            <button type="button" className="btn btn--ghost" onClick={onRetry}>
              <PiArrowClockwise aria-hidden="true" /> Tentar novamente
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );
};

export default StateMessage;
