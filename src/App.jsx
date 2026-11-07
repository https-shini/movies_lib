import { Outlet, ScrollRestoration } from "react-router";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <Navbar />
      <div id="main-content" className="app-content" tabIndex={-1}>
        <Outlet />
      </div>
      <footer className="site-footer">
        <p>MoviesLib <span aria-hidden="true">•</span> Descubra seu próximo filme favorito.</p>
        <p className="site-footer__credits">
          Dados e imagens fornecidos pelo{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>.
          Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
        </p>
      </footer>
      <ScrollRestoration />
    </div>
  );
}

export default App;
