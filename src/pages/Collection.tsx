import { Link, useParams } from "react-router";
import { messages, plural } from "../i18n";
import {
  collectionPeriod,
  isLongCollectionName,
  sequenceNumber,
  sortCollectionParts,
} from "../lib/collection";
import { textOr } from "../lib/format";
import { backdropSrcSet, getBackdropUrl } from "../lib/images";
import { useCollection } from "../hooks/useCollection";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { TmdbErrorCode } from "../services/tmdb";
import PosterCard from "../components/movie/PosterCard";
import SectionHeader from "../components/ui/SectionHeader";
import ShareButton from "../components/ui/ShareButton";
import StateMessage from "../components/ui/StateMessage";
import NotFound from "./NotFound";
import "./Collection.css";

const text = messages.collection;

/**
 * Falhas que a pessoa entende e que uma nova tentativa pode resolver. As demais (chave do
 * servidor, resposta inesperada...) são detalhes técnicos: a página mostra uma mensagem
 * genérica no lugar (D-68).
 */
const FRIENDLY_ERRORS: readonly TmdbErrorCode[] = [
  "network",
  "rateLimited",
  "upstream",
  "unavailable",
];

/** Mesma grade do cabeçalho final: a página não salta quando os dados chegam (D-68). */
const CollectionSkeleton = () => (
  <main className="collection" aria-busy="true" aria-label={text.loading}>
    <section className="collection-hero">
      <div className="collection-hero__media skeleton" />
      <div className="shell collection-hero__content">
        <span className="skeleton skeleton--text" style={{ width: "6rem" }} />
        <span className="skeleton collection-hero__title-skeleton" />
        <span className="skeleton skeleton--text" style={{ width: "10rem" }} />
      </div>
    </section>
  </main>
);

/** Erro com título de página: inexistente não oferece nova tentativa (D-68). */
const CollectionError = ({
  code,
  message,
  onRetry,
}: {
  code: TmdbErrorCode | null;
  message: string;
  onRetry: () => void;
}) => {
  const notFound = code === "notFound";
  const friendly = code !== null && FRIENDLY_ERRORS.includes(code);

  return (
    <main className="page collection-error">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">
            {notFound ? text.notFoundTitle : text.errorTitle}
          </h1>
        </header>
        <StateMessage
          tone="error"
          message={notFound ? text.notFoundMessage : friendly ? message : text.errorGeneric}
          onRetry={notFound ? undefined : onRetry}
          action={
            <>
              {notFound && (
                <Link to="/discover" className="btn btn--ghost">
                  {text.discover}
                </Link>
              )}
              <Link to="/" className="btn btn--quiet">
                {messages.common.backHome}
              </Link>
            </>
          }
        />
      </div>
    </main>
  );
};

const CollectionDetails = ({ id }: { id: string }) => {
  const { data: collection, isLoading, error, errorCode, reload } = useCollection(id);
  const notFound = errorCode === "notFound";
  useDocumentTitle(
    textOr(
      collection?.name,
      isLoading ? text.loadingTitle : notFound ? text.notFoundTitle : text.fallbackTitle,
    ),
  );

  if (isLoading) return <CollectionSkeleton />;

  if (error || !collection) {
    return <CollectionError code={errorCode} message={error} onRetry={reload} />;
  }

  const parts = sortCollectionParts(collection.parts);
  const period = collectionPeriod(parts);
  const backdrop = getBackdropUrl(collection.backdrop_path);
  const facts = [period, parts.length ? plural(text.count, parts.length) : null].filter(Boolean);

  return (
    <main className="collection">
      <section
        className={`collection-hero ${backdrop ? "" : "collection-hero--plain"}`}
        aria-labelledby="collection-title"
      >
        {backdrop && (
          <div className="collection-hero__media">
            <img
              src={backdrop}
              srcSet={backdropSrcSet(collection.backdrop_path, ["w780", "w1280"])}
              sizes="100vw"
              alt=""
              fetchPriority="high"
            />
          </div>
        )}
        <div className="shell collection-hero__content reveal">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1
            id="collection-title"
            className={`collection-hero__title display ${
              isLongCollectionName(collection.name) ? "collection-hero__title--long" : ""
            }`}
          >
            {collection.name}
          </h1>
          {facts.length > 0 && <p className="collection-hero__facts mono">{facts.join(" · ")}</p>}
          <div className="collection-hero__actions">
            <ShareButton title={collection.name} />
          </div>
        </div>
      </section>

      <div className="shell">
        <p
          className={`collection-overview ${collection.overview ? "" : "collection-overview--empty"}`}
        >
          {textOr(collection.overview, text.noOverview)}
        </p>

        <section className="section" aria-labelledby="parts-title">
          <SectionHeader id="parts-title" title={text.partsTitle} subtitle={text.partsSubtitle} />
          {parts.length ? (
            <ol className="poster-grid collection-parts" aria-label={text.partsLabel}>
              {parts.map((part, index) => {
                const upcoming = !part.release_date;
                return (
                  <li key={part.id} className="collection-part">
                    {/* A posição já é anunciada pela lista ordenada ("1 de 27"). */}
                    <span className="collection-part__number display" aria-hidden="true">
                      {sequenceNumber(index)}
                    </span>
                    <PosterCard
                      movie={part}
                      // Com imagem de fundo, ela é o maior elemento: o pôster não disputa a banda.
                      priority={!backdrop && index === 0}
                      meta={upcoming ? text.upcoming : undefined}
                    />
                    {upcoming && (
                      <span className="collection-part__badge badge badge--info" aria-hidden="true">
                        {text.upcoming}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <StateMessage
              tone="empty"
              title={text.emptyTitle}
              message={text.emptyMessage}
              action={
                <Link to="/discover" className="btn btn--ghost">
                  {text.discover}
                </Link>
              }
            />
          )}
        </section>
      </div>
    </main>
  );
};

const Collection = () => {
  const { id = "" } = useParams();
  if (!/^\d+$/.test(id)) return <NotFound />;
  return <CollectionDetails key={id} id={id} />;
};

export default Collection;
