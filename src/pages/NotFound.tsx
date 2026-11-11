import { messages } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import StatusScreen from "../components/ui/StatusScreen";

const text = messages.status;

const NotFound = () => {
  useDocumentTitle(text.notFoundTitle);

  return (
    <StatusScreen
      code={text.notFoundCode}
      title={text.notFoundHeading}
      message={text.notFoundMessage}
    />
  );
};

export default NotFound;
