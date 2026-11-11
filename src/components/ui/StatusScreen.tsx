import { Link } from "react-router";
import { messages } from "../../i18n";
import "./StatusScreen.css";

interface StatusScreenProps {
  code: string;
  title: string;
  message: string;
}

/** Tela de página inexistente ou erro inesperado, com caminhos de volta. */
const StatusScreen = ({ code, title, message }: StatusScreenProps) => (
  <main className="status-screen">
    <div className="shell status-screen__inner reveal">
      <p className="status-screen__code display" aria-hidden="true">
        {code}
      </p>
      <h1 className="status-screen__title display">{title}</h1>
      <p className="status-screen__message">{message}</p>
      <div className="status-screen__actions">
        <Link to="/" className="btn btn--primary">
          {messages.common.backHome}
        </Link>
        <Link to="/discover" className="btn btn--ghost">
          {messages.common.discoverMovies}
        </Link>
      </div>
    </div>
  </main>
);

export default StatusScreen;
