import { messages } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useNoIndex } from "../hooks/useNoIndex";
import StatusScreen from "../components/ui/StatusScreen";

const text = messages.status;

const NotFound = () => {
  useDocumentTitle(text.notFoundTitle);
  // A SPA responde 200 também aqui: o noindex evita que a 404 seja indexada (D-69).
  useNoIndex();

  return (
    <StatusScreen
      code={text.notFoundCode}
      title={text.notFoundHeading}
      message={text.notFoundMessage}
    />
  );
};

export default NotFound;
