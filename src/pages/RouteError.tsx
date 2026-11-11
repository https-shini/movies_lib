import { isRouteErrorResponse, useRouteError } from "react-router";
import { messages } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import StatusScreen from "../components/ui/StatusScreen";

const text = messages.status;

const RouteError = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  useDocumentTitle(isNotFound ? text.notFoundTitle : text.errorTitle);

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
