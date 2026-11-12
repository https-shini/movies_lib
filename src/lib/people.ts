import { interpolate, messages } from "../i18n";
import type { PersonSummary } from "../types/tmdb";

const departments = messages.title.departments as Record<string, string>;

/** Nome em português de um departamento do TMDB ("Acting" → "Atuação"). */
export const departmentLabel = (department: string): string =>
  departments[department] ?? department;

/** Linha de apoio do card: "Atuação · Conhecido(a) por Clube da Luta, Seven". */
export function describePerson(person: PersonSummary): string {
  const titles = (person.known_for ?? [])
    .map((item) => (item.media_type === "tv" ? item.name : item.title))
    .filter(Boolean)
    .slice(0, 2);

  return [
    person.known_for_department ? departmentLabel(person.known_for_department) : null,
    titles.length ? interpolate(messages.people.knownFor, { titles: titles.join(", ") }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
