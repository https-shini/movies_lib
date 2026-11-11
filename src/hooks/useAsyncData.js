import { useCallback, useEffect, useState } from "react";

/**
 * Centraliza estados de carregamento, erro, cancelamento e nova tentativa.
 * A função loader deve ser estabilizada pelo consumidor com useCallback.
 */
export function useAsyncData(loader) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function execute() {
      setIsLoading(true);
      setError("");
      setData(null);

      try {
        const result = await loader(controller.signal);
        if (active) setData(result);
      } catch (requestError) {
        if (active && requestError?.name !== "AbortError") {
          setError(requestError?.message || "Ocorreu um erro inesperado.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    execute();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loader, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { data, isLoading, error, reload };
}
