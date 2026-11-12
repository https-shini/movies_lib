import { useEffect, useState } from "react";
import { PiCheck, PiShareNetwork } from "react-icons/pi";
import { messages } from "../../i18n";

const text = messages.share;

type ShareState = "idle" | "copied" | "failed";

/** Tempo em que o aviso "Link copiado" fica visível. */
const FEEDBACK_MS = 2500;

/**
 * Compartilha a página atual: usa a folha de compartilhamento do sistema quando existe
 * (celulares) e, nos demais casos, copia o link.
 */
const ShareButton = ({ title }: { title: string }) => {
  const [state, setState] = useState<ShareState>("idle");

  useEffect(() => {
    if (state === "idle") return undefined;
    const timer = window.setTimeout(() => {
      setState("idle");
    }, FEEDBACK_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch (error) {
      // Fechar a folha de compartilhamento não é erro.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setState("failed");
    }
  };

  const label = state === "copied" ? text.copied : state === "failed" ? text.failed : text.share;

  return (
    <>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          void share();
        }}
      >
        {state === "copied" ? (
          <PiCheck aria-hidden="true" />
        ) : (
          <PiShareNetwork aria-hidden="true" />
        )}
        {label}
      </button>
      <span className="sr-only" role="status">
        {state === "idle" ? "" : label}
      </span>
    </>
  );
};

export default ShareButton;
