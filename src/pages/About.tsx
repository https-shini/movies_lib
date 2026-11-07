import { Link } from "react-router";
import { PiArrowUpRight } from "react-icons/pi";
import { messages } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./Legal.css";

const TMDB_URL = "https://www.themoviedb.org/";
const JUSTWATCH_URL = "https://www.justwatch.com/";

const ExternalLink = ({ href, children }: { href: string; children: string }) => (
  <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">
    {children} <PiArrowUpRight aria-hidden="true" />
  </a>
);

/** Créditos exigidos pelo TMDB (logo e aviso) e pelo JustWatch. */
const About = () => {
  const text = messages.about;
  useDocumentTitle(text.title);

  return (
    <main className="page legal">
      <div className="shell legal__inner">
        <header className="page-head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">{text.heading}</h1>
          <p className="page-head__lede">{text.lede}</p>
        </header>

        <section className="legal__section" aria-labelledby="about-tmdb">
          <h2 id="about-tmdb" className="legal__title display">
            {text.tmdbTitle}
          </h2>
          <img
            className="legal__logo"
            src="/tmdb-logo.svg"
            alt={text.tmdbLogoAlt}
            width="249"
            height="18"
          />
          <p>{text.tmdbText}</p>
          <figure className="legal__notice">
            <figcaption>{text.tmdbNoticeLabel}</figcaption>
            <blockquote lang="en">
              <p>{text.tmdbNoticeOriginal}</p>
            </blockquote>
            <p>{text.tmdbNoticeTranslation}</p>
          </figure>
          <ExternalLink href={TMDB_URL}>{text.tmdbLink}</ExternalLink>
        </section>

        <section className="legal__section" aria-labelledby="about-justwatch">
          <h2 id="about-justwatch" className="legal__title display">
            {text.justWatchTitle}
          </h2>
          <p>{text.justWatchText}</p>
          <ExternalLink href={JUSTWATCH_URL}>{text.justWatchLink}</ExternalLink>
        </section>

        <section className="legal__section" aria-labelledby="about-youtube">
          <h2 id="about-youtube" className="legal__title display">
            {text.youTubeTitle}
          </h2>
          <p>{text.youTubeText}</p>
        </section>

        <p className="legal__footer">
          <Link className="text-link" to="/privacidade">
            {text.privacyLink}
          </Link>
        </p>
      </div>
    </main>
  );
};

export default About;
