import { useSearchParams } from "react-router";
import { messages } from "../i18n";
import PeopleGrid from "../components/person/PeopleGrid";
import Pagination from "../components/ui/Pagination";
import { getTotalPages, normalizePage } from "../lib/pagination";
import { usePeople } from "../hooks/usePeople";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const text = messages.people;

const People = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = normalizePage(searchParams.get("page") ?? "1");
  const { data, isLoading, error, reload } = usePeople(null, page);
  useDocumentTitle(text.title);

  const people = data?.results ?? [];

  return (
    <main className="page people">
      <div className="shell">
        <header className="page-head">
          <p className="page-head__kicker mono">{text.kicker}</p>
          <h1 className="page-head__title display">{text.heading}</h1>
          <p className="page-head__lede">{text.lede}</p>
        </header>

        <PeopleGrid
          label={text.listLabel}
          people={people}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          emptyTitle={text.empty}
        />

        {!isLoading && !error && people.length > 0 && (
          <Pagination
            page={page}
            totalPages={getTotalPages(data)}
            onPageChange={(nextPage) => {
              setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
            }}
          />
        )}
      </div>
    </main>
  );
};

export default People;
