import { Link } from "react-router";

const NotFound = () => (
  <main className="not-found">
    <p className="not-found__code">404</p>
    <h1>Esta página não foi encontrada</h1>
    <p>O endereço pode estar incorreto ou o conteúdo não está disponível.</p>
    <Link to="/">Voltar para o início</Link>
  </main>
);

export default NotFound;
