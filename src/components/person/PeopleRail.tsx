import { useRef, type ReactNode } from "react";
import { interpolate, messages } from "../../i18n";
import Rail, { RailControls } from "../ui/Rail";
import SectionHeader from "../ui/SectionHeader";
import PersonCard, { PersonCardSkeleton, type PersonCardData } from "./PersonCard";

interface PeopleRailProps {
  id: string;
  index?: string | undefined;
  title: string;
  subtitle?: string | undefined;
  people: readonly PersonCardData[];
  /** Mostra esqueletos enquanto os dados chegam, para a página não mudar de altura. */
  isLoading?: boolean | undefined;
  /** Link ou conteúdo extra ao lado do título. */
  link?: ReactNode;
  /** Conteúdo abaixo da faixa (ex.: elenco completo). */
  children?: ReactNode;
}

/** Seção com faixa horizontal de pessoas (elenco, equipe ou destaques). */
const PeopleRail = ({
  id,
  index,
  title,
  subtitle,
  people,
  isLoading = false,
  link,
  children,
}: PeopleRailProps) => {
  const railRef = useRef<HTMLUListElement>(null);
  if (!people.length && !isLoading) return null;
  const titleId = `${id}-title`;

  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <SectionHeader
        id={titleId}
        index={index}
        title={title}
        subtitle={subtitle}
        aside={
          <>
            {link}
            {!isLoading && <RailControls railRef={railRef} label={title} />}
          </>
        }
      />
      {isLoading ? (
        <Rail label={interpolate(messages.rail.loading, { title })} className="rail--wide">
          {Array.from({ length: 8 }, (_, item) => (
            <li key={item}>
              <PersonCardSkeleton />
            </li>
          ))}
        </Rail>
      ) : (
        <Rail railRef={railRef} label={title} className="rail--wide">
          {people.map((person) => (
            <li key={person.id}>
              <PersonCard person={person} />
            </li>
          ))}
        </Rail>
      )}
      {children}
    </section>
  );
};

export default PeopleRail;
