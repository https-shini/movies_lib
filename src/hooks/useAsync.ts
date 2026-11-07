import { useCallback, useEffect, useState } from "react";
import { messages } from "../i18n";
import { isAbortError, TmdbError, type TmdbErrorCode } from "../services/tmdb";

export interface AsyncError {
  code: TmdbErrorCode;
  message: string;
}

/** Converte qualquer falha num erro exibível. */
export function toAsyncError(error: unknown): AsyncError {
  if (error instanceof TmdbError) return { code: error.code, message: error.message };
  return { code: "unknown", message: messages.errors.unknown };
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  /** Mensagem pronta para a interface; vazia quando não há erro. */
  error: string;
  errorCode: TmdbErrorCode | null;
  reload: () => void;
}

/**
 * Executa um carregamento assíncrono com estados de carregamento, erro,
 * cancelamento (AbortController) e nova tentativa.
 * O `loader` deve ser estável (useCallback) e mudar quando seus dados mudarem.
 */
export function useAsync<T>(loader: (signal: AbortSignal) => Promise<T>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AsyncError | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function execute() {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await loader(controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (cause) {
        if (!controller.signal.aborted && !isAbortError(cause)) setError(toAsyncError(cause));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void execute();
    return () => {
      controller.abort();
    };
  }, [loader, attempt]);

  const reload = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  return { data, isLoading, error: error?.message ?? "", errorCode: error?.code ?? null, reload };
}
