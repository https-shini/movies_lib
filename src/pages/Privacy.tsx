import { definedLegalBases, hasLegalContact, legalContact } from "../config/legal";
import { interpolate, messages } from "../i18n";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./Legal.css";

/** O que é coletado, por quem e para quê (LGPD). */
const Privacy = () => {
  const text = messages.privacy;
  const bases = definedLegalBases();
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

        <section className="legal__section" aria-labelledby="privacy-purposes">
          <h2 id="privacy-purposes" className="legal__title display">
            {text.purposesTitle}
          </h2>
          <ul className="legal__list" role="list">
            {text.purposes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {bases.length > 0 && (
          <section className="legal__section" aria-labelledby="privacy-legal-bases">
            <h2 id="privacy-legal-bases" className="legal__title display">
              {text.legalBasesTitle}
            </h2>
            <p>{text.legalBasesText}</p>
            <ul className="legal__list" role="list">
              {bases.map(({ purpose, basis }) => (
                <li key={purpose}>
                  {interpolate(text.legalBasisItem, {
                    purpose: text.purposeNames[purpose],
                    basis,
                  })}
                </li>
              ))}
            </ul>
          </section>
        )}

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

        <section className="legal__section" aria-labelledby="privacy-hosting">
          <h2 id="privacy-hosting" className="legal__title display">
            {text.hostingTitle}
          </h2>
          <p>{text.hostingText}</p>
        </section>

        <section className="legal__section" aria-labelledby="privacy-logs">
          <h2 id="privacy-logs" className="legal__title display">
            {text.logsTitle}
          </h2>
          <p>{text.logsText}</p>
        </section>

        <section className="legal__section" aria-labelledby="privacy-retention">
          <h2 id="privacy-retention" className="legal__title display">
            {text.retentionTitle}
          </h2>
          <ul className="legal__list" role="list">
            {text.retention.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="legal__section" aria-labelledby="privacy-rights">
          <h2 id="privacy-rights" className="legal__title display">
            {text.rightsTitle}
          </h2>
          <p>{text.rightsText}</p>
        </section>

        {hasLegalContact() && (
          <section className="legal__section" aria-labelledby="privacy-contact">
            <h2 id="privacy-contact" className="legal__title display">
              {text.contactTitle}
            </h2>
            <p>{interpolate(text.contactController, { controller: legalContact.controller })}</p>
            <p>
              {interpolate(text.contactEmail, { email: "" })}
              <a className="text-link" href={`mailto:${legalContact.email}`}>
                {legalContact.email}
              </a>
            </p>
            <p>{text.contactProcedure}</p>
          </section>
        )}

        <p className="legal__footer mono">{text.updated}</p>
      </div>
    </main>
  );
};

export default Privacy;
