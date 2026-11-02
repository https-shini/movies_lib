import { useEffect, useState } from "react";

/**
 * Centraliza estados de carregamento, erro e cancelamento de requisições.
 * O consumidor deve informar dependências estáveis para refazer a consulta.
 */
export function useAsyncData(loader, dependencies = []) {
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
    // A lista de dependências é definida pelo componente consumidor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, isLoading, error };
}
