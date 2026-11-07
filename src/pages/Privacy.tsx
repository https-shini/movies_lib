import { messages } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./Legal.css";

/** O que é coletado, por quem e para quê (LGPD). */
const Privacy = () => {
  const text = messages.privacy;
  useDocumentTitle(text.title);

  return (
    <main className="page legal">
      <div className="shell legal__inner">
        <header className="page-head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">{text.heading}</h1>
          <p className="page-head__lede">{text.lede}</p>
        </header>

        <section className="legal__section" aria-labelledby="privacy-summary">
          <h2 id="privacy-summary" className="legal__title display">
            {text.summaryTitle}
          </h2>
          <ul className="legal__list" role="list">
            {text.summary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="legal__section" aria-labelledby="privacy-analytics">
          <h2 id="privacy-analytics" className="legal__title display">
            {text.analyticsTitle}
          </h2>
          <p>{text.analyticsText}</p>
        </section>

        <section className="legal__section" aria-labelledby="privacy-speed">
          <h2 id="privacy-speed" className="legal__title display">
            {text.speedTitle}
          </h2>
          <p>{text.speedText}</p>
        </section>

        <section className="legal__section" aria-labelledby="privacy-third-party">
          <h2 id="privacy-third-party" className="legal__title display">
            {text.thirdPartyTitle}
          </h2>
          <p>{text.thirdPartyText}</p>
          <ul className="legal__list" role="list">
            {text.thirdParty.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="legal__section" aria-labelledby="privacy-storage">
          <h2 id="privacy-storage" className="legal__title display">
            {text.storageTitle}
          </h2>
          <p>{text.storageText}</p>
        </section>

        <p className="legal__footer mono">{text.updated}</p>
      </div>
    </main>
  );
};

export default Privacy;
