import { isRouteErrorResponse, useRouteError } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import StatusScreen from "../components/ui/StatusScreen";

const RouteError = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  useDocumentTitle(isNotFound ? "Página não encontrada" : "Algo deu errado");

  if (import.meta.env.DEV && !isNotFound) {
    console.error(error);
  }

  return isNotFound ? (
    <StatusScreen
      code="404"
      title="Esta cena foi cortada"
      message="O endereço pode estar incorreto ou o conteúdo não está mais disponível."
    />
  ) : (
    <StatusScreen
      code="Ops"
      title="O projetor falhou"
      message="Algo deu errado ao exibir esta página. Recarregue a página ou volte para o início."
    />
  );
};

export default RouteError;
