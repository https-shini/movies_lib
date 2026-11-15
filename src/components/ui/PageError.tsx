import type { ReactNode } from "react";
import { Link } from "react-router";
import { messages } from "../../i18n";
import { useNoIndex } from "../../hooks/useNoIndex";
import type { TmdbErrorCode } from "../../services/tmdb";
import StateMessage from "./StateMessage";

/** Textos de erro de cada página de detalhe (filme, série, pessoa, temporada, coleção). */
export interface PageErrorTexts {
  kicker: string;
  notFoundTitle: string;
  notFoundMessage: string;
  errorTitle: string;
}

/**
 * Falhas que a pessoa entende e que uma nova tentativa pode resolver. As demais (chave do
 * servidor, resposta inesperada...) são detalhes técnicos: no lugar, uma mensagem genérica.
 */
const FRIENDLY_ERRORS: readonly TmdbErrorCode[] = [
  "network",
  "rateLimited",
  "upstream",
  "unavailable",
];

/** Título da aba no erro; a página o usa no próprio `useDocumentTitle` (D-69). */
export function pageErrorTitle(code: TmdbErrorCode | null, texts: PageErrorTexts): string {
  return code === "notFound" ? texts.notFoundTitle : texts.errorTitle;
}

interface PageErrorProps {
  texts: PageErrorTexts;
  code: TmdbErrorCode | null;
  /** Mensagem do serviço; só aparece quando é uma falha que a pessoa entende. */
  message: string;
  onRetry: () => void;
  /** Caminho a mais, antes dos padrões (ex.: "Voltar para a série" na temporada). */
  extraAction?: ReactNode | undefined;
}

/**
 * Erro de página de detalhe (D-69), com título de página (`h1`):
 * - inexistente: sem "Tentar novamente" (não resolveria), com caminhos para descobrir e
 *   para o início, e `noindex` (a SPA responde 200 também para conteúdo inexistente);
 * - falha temporária: a mensagem do serviço e "Tentar novamente";
 * - falha técnica: mensagem genérica, sem detalhes do servidor.
 */
const PageError = ({ texts, code, message, onRetry, extraAction }: PageErrorProps) => {
  const notFound = code === "notFound";
  const friendly = code !== null && FRIENDLY_ERRORS.includes(code);
  useNoIndex(notFound);

  return (
    <main className="page page-error">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">{texts.kicker}</p>
          <h1 className="page-head__title display">{pageErrorTitle(code, texts)}</h1>
        </header>
        <StateMessage
          tone="error"
          message={
            notFound ? texts.notFoundMessage : friendly ? message : messages.pageError.generic
          }
          onRetry={notFound ? undefined : onRetry}
          action={
            <>
              {extraAction}
              {notFound && (
                <Link to="/discover" className="btn btn--ghost">
                  {messages.common.discoverMovies}
                </Link>
              )}
              <Link to="/" className="btn btn--quiet">
                {messages.common.backHome}
              </Link>
            </>
          }
        />
      </div>
    </main>
  );
};

export default PageError;
