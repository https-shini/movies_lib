import { messages } from "../../i18n";
import { describePerson } from "../../lib/people";
import type { PersonSummary } from "../../types/tmdb";
import StateMessage from "../ui/StateMessage";
import PersonCard, { PersonCardSkeleton } from "./PersonCard";
import "./PeopleGrid.css";

const text = messages.people;

interface PeopleGridProps {
  people: readonly PersonSummary[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  label: string;
  emptyTitle: string;
  emptyMessage?: string | undefined;
  skeletonCount?: number | undefined;
}

/** Grade de pessoas com estados de carregamento, erro e vazio. */
const PeopleGrid = ({
  people,
  isLoading,
  error,
  onRetry,
  label,
  emptyTitle,
  emptyMessage,
  skeletonCount = 12,
}: PeopleGridProps) => {
  if (isLoading) {
    return (
      <div className="people-grid" aria-busy="true" aria-label={text.loading}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <PersonCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <StateMessage tone="error" title={text.error} message={error} onRetry={onRetry} />;
  }

  if (!people.length) {
    return <StateMessage tone="empty" title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <ul className="people-grid reveal" role="list" aria-label={label}>
      {people.map((person) => (
        <li key={person.id}>
          <PersonCard
            person={{
              id: person.id,
              name: person.name,
              role: describePerson(person),
              profilePath: person.profile_path,
            }}
          />
        </li>
      ))}
    </ul>
  );
};

export default PeopleGrid;
