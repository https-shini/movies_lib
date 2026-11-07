import { Link } from "react-router";
import { BRAND } from "../../config/brand";
import BrandMark from "./BrandMark";
import "./SiteFooter.css";

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="shell site-footer__inner">
      <div className="site-footer__brand">
        <BrandMark />
        <p>{BRAND.description}</p>
      </div>

      <nav className="site-footer__nav" aria-label="Rodapé">
        <Link to="/">Início</Link>
        <Link to="/discover">Descobrir</Link>
        <Link to="/search">Buscar</Link>
      </nav>

      <p className="site-footer__credits">
        Dados e imagens fornecidos pelo{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
          TMDB
        </a>
        . Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.
      </p>
    </div>
  </footer>
);

export default SiteFooter;
