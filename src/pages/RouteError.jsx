import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const RouteError = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  useDocumentTitle(isNotFound ? "Página não encontrada" : "Algo deu errado");

  if (import.meta.env.DEV && !isNotFound) {
    console.error(error);
  }

  return (
    <main className="not-found">
      <p className="not-found__code">{isNotFound ? "404" : "Ops"}</p>
      <h1>{isNotFound ? "Esta página não foi encontrada" : "Algo deu errado ao exibir esta página"}</h1>
      <p>
        {isNotFound
          ? "O endereço pode estar incorreto ou o conteúdo não está disponível."
          : "Tente recarregar a página. Se o problema continuar, volte para o início."}
      </p>
      <Link to="/">Voltar para o início</Link>
    </main>
  );
};

export default RouteError;
