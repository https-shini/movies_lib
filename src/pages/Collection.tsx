import { Link, useParams } from "react-router";
import { messages, plural } from "../i18n";
import { textOr } from "../lib/format";
import { backdropSrcSet, getBackdropUrl } from "../lib/images";
import { useCollection } from "../hooks/useCollection";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import PosterGrid from "../components/movie/PosterGrid";
import SectionHeader from "../components/ui/SectionHeader";
import StateMessage from "../components/ui/StateMessage";
import NotFound from "./NotFound";
import "./Collection.css";

const text = messages.collection;

const CollectionSkeleton = () => (
  <main className="collection" aria-busy="true" aria-label={text.loading}>
    <section className="collection-hero">
      <div className="collection-hero__media skeleton" />
      <div className="collection-hero__content">
        <span className="skeleton skeleton--text" style={{ width: "9rem" }} />
        <span className="skeleton collection-hero__title-skeleton" />
      </div>
    </section>
  </main>
);

const CollectionDetails = ({ id }: { id: string }) => {
  const { data: collection, isLoading, error, reload } = useCollection(id);
  useDocumentTitle(textOr(collection?.name, isLoading ? text.loadingTitle : text.fallbackTitle));

  if (isLoading) return <CollectionSkeleton />;

  if (error || !collection) {
    return (
      <main className="page">
        <div className="shell">
          <StateMessage
            tone="error"
            title={text.error}
            message={error || text.notFound}
            onRetry={reload}
            action={
              <Link to="/" className="btn btn--quiet">
                {messages.common.backHome}
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  // Ordem de lançamento; filmes ainda sem data ficam por último.
  const parts = [...collection.parts].sort((a, b) => {
    if (!a.release_date || !b.release_date) return a.release_date ? -1 : b.release_date ? 1 : 0;
    return a.release_date.localeCompare(b.release_date);
  });
  const backdrop = getBackdropUrl(collection.backdrop_path);

  return (
    <main className="collection">
      <section className="collection-hero" aria-labelledby="collection-title">
        <div className="collection-hero__media">
          {backdrop && (
            <img
              src={backdrop}
              srcSet={backdropSrcSet(collection.backdrop_path, ["w780", "w1280"])}
              sizes="100vw"
              alt=""
              fetchPriority="high"
            />
          )}
        </div>
        <div className="collection-hero__content reveal">
          <p className="page-head__kicker mono">
            {[text.kicker, plural(text.count, parts.length)].join(" · ")}
          </p>
          <h1 id="collection-title" className="collection-hero__title display">
            {collection.name}
          </h1>
          <p className="collection-hero__overview">
            {textOr(collection.overview, text.noOverview)}
          </p>
        </div>
      </section>

      <div className="shell">
        <section className="section" aria-labelledby="parts-title">
          <SectionHeader
            id="parts-title"
            index="01"
            title={text.partsTitle}
            subtitle={text.partsSubtitle}
          />
          <PosterGrid
            label={text.partsLabel}
            movies={parts}
            isLoading={false}
            error=""
            onRetry={reload}
          />
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
