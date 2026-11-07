import { useDocumentTitle } from "../hooks/useDocumentTitle";
import StatusScreen from "../components/ui/StatusScreen";

const NotFound = () => {
  useDocumentTitle("Página não encontrada");

  return (
    <StatusScreen
      code="404"
      title="Esta cena foi cortada"
      message="O endereço pode estar incorreto ou o conteúdo não está mais disponível."
    />
  );
};

export default NotFound;
