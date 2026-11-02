import { useEffect, useState } from "react";

/**
 * Centraliza estados de carregamento, erro e cancelamento de requisições.
 * A função loader deve ser estabilizada pelo consumidor com useCallback.
 */
export function useAsyncData(loader) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, [loader]);

  return { data, isLoading, error };
}
