import { isRouteErrorResponse, useRouteError } from "react-router";
import { messages } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useNoIndex } from "../hooks/useNoIndex";
import StatusScreen from "../components/ui/StatusScreen";

const text = messages.status;

const RouteError = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  useDocumentTitle(isNotFound ? text.notFoundTitle : text.errorTitle);
  // Só a 404: um erro inesperado é uma falha passageira de uma página que existe (D-69).
  useNoIndex(isNotFound);

  if (import.meta.env.DEV && !isNotFound) {
    console.error(error);
  }

  return isNotFound ? (
    <StatusScreen
      code={text.notFoundCode}
      title={text.notFoundHeading}
      message={text.notFoundMessage}
    />
  ) : (
    <StatusScreen code={text.errorCode} title={text.errorHeading} message={text.errorMessage} />
  );
};

export default RouteError;
