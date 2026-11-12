import { Link } from "react-router";
import { messages } from "../../i18n";
import BrandMark from "./BrandMark";
import "./SiteFooter.css";

const text = messages.footer;

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="shell site-footer__inner">
      <div className="site-footer__brand">
        <BrandMark />
        <p>{messages.brand.tagline}</p>
      </div>

      <nav className="site-footer__nav" aria-label={text.navLabel}>
        <Link to="/">{text.home}</Link>
        <Link to="/discover">{text.discover}</Link>
        <Link to="/pessoas">{text.people}</Link>
        <Link to="/search">{text.search}</Link>
        <Link to="/sobre">{text.about}</Link>
        <Link to="/privacidade">{text.privacy}</Link>
      </nav>

      <p className="site-footer__credits">
        {text.dataBy}{" "}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
          TMDB
        </a>
        . {text.notice} {text.availabilityBy}{" "}
        <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer">
          {messages.watchProvidersCredit.justWatch}
        </a>
        .
      </p>
    </div>
  </footer>
);

export default SiteFooter;
