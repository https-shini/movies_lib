import type { PersonCredit } from "../types/tmdb";
import type { MediaType } from "./media";

/** Idade em anos completos na data de referência (hoje ou a data da morte). */
export function getAge(
  birthday: string | null | undefined,
  deathday?: string | null,
  today: Date = new Date(),
): number | null {
  const born = parseIsoDate(birthday);
  if (!born) return null;
  const end = parseIsoDate(deathday) ?? {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  let age = end.year - born.year;
  if (end.month < born.month || (end.month === born.month && end.day < born.day)) age -= 1;
  return age >= 0 ? age : null;
}

function parseIsoDate(value: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** Uma obra na filmografia, com todos os papéis da pessoa nela. */
export interface FilmographyEntry {
  id: number;
  mediaType: MediaType;
  title: string;
  /** Data de lançamento ou de estreia (AAAA-MM-DD), ou "" quando ainda não anunciada. */
  date: string;
  year: string | null;
  /** Personagens (atuação) ou funções (equipe). */
  roles: string[];
  episodeCount: number | null;
  posterPath: string | null;
  voteAverage: number | null;
  voteCount: number;
}

export interface FilmographyGroup {
  /** Departamento do TMDB ("Acting", "Directing"...). */
  department: string;
  entries: FilmographyEntry[];
}

export const ACTING = "Acting";

const creditTitle = (credit: PersonCredit) => credit.title ?? credit.name ?? "";
const creditDate = (credit: PersonCredit) => credit.release_date ?? credit.first_air_date ?? "";

function toEntries(credits: readonly PersonCredit[], roleOf: (credit: PersonCredit) => string) {
  const byMedia = new Map<string, FilmographyEntry>();

  for (const credit of credits) {
    const title = creditTitle(credit);
    if (!title) continue;

    const key = `${credit.media_type}:${String(credit.id)}`;
    const role = roleOf(credit).trim();
    const existing = byMedia.get(key);

    if (existing) {
      if (role && !existing.roles.includes(role)) existing.roles.push(role);
      if (credit.episode_count) {
        existing.episodeCount = Math.max(existing.episodeCount ?? 0, credit.episode_count);
      }
      continue;
    }

    const date = creditDate(credit);
    byMedia.set(key, {
      id: credit.id,
      mediaType: credit.media_type,
      title,
      date,
      year: /^\d{4}/.test(date) ? date.slice(0, 4) : null,
      roles: role ? [role] : [],
      episodeCount: credit.episode_count ?? null,
      posterPath: credit.poster_path,
      voteAverage: credit.vote_average ?? null,
      voteCount: credit.vote_count ?? 0,
    });
  }

  // Sem data primeiro (projetos anunciados), depois do mais recente para o mais antigo.
  return [...byMedia.values()].sort((a, b) => {
    if (!a.date || !b.date) return a.date ? 1 : b.date ? -1 : a.title.localeCompare(b.title);
    return b.date.localeCompare(a.date);
  });
}

/**
 * Filmografia agrupada por departamento: atuação e cada área da equipe técnica. O
 * departamento principal da pessoa vem primeiro; os demais, do maior para o menor.
 */
export function buildFilmography(
  credits: { cast?: PersonCredit[]; crew?: PersonCredit[] } | null | undefined,
  mainDepartment: string | null | undefined,
): FilmographyGroup[] {
  const groups: FilmographyGroup[] = [];

  const acting = toEntries(credits?.cast ?? [], (credit) => credit.character ?? "");
  if (acting.length) groups.push({ department: ACTING, entries: acting });

  const crewByDepartment = new Map<string, PersonCredit[]>();
  for (const credit of credits?.crew ?? []) {
    const department = credit.department ?? "Crew";
    crewByDepartment.set(department, [...(crewByDepartment.get(department) ?? []), credit]);
  }
  for (const [department, items] of crewByDepartment) {
    const entries = toEntries(items, (credit) => credit.job ?? "");
    if (entries.length) groups.push({ department, entries });
  }

  return groups.sort((a, b) => {
    if (a.department === mainDepartment) return -1;
    if (b.department === mainDepartment) return 1;
    return b.entries.length - a.entries.length;
  });
}

/** Gêneros de TV que não são obras de ficção ou documentário: talk shows e noticiários. */
const TALK_AND_NEWS_GENRES = [10767, 10763];
const SELF_ROLE = /\b(self|ele mesmo|ela mesma|si mesmo|si mesma|host|apresentador)\b/i;

/**
 * Obras pelas quais a pessoa é mais conhecida: as mais votadas do departamento principal,
 * sem participações como ela mesma em talk shows e premiações.
 */
export function pickKnownFor(
  credits: { cast?: PersonCredit[]; crew?: PersonCredit[] } | null | undefined,
  mainDepartment: string | null | undefined,
  limit = 12,
): FilmographyEntry[] {
  const isActor = !mainDepartment || mainDepartment === ACTING;
  const source = isActor
    ? (credits?.cast ?? []).filter(
        (credit) =>
          !SELF_ROLE.test(credit.character ?? "") &&
          !credit.genre_ids?.some((genre) => TALK_AND_NEWS_GENRES.includes(genre)),
      )
    : (credits?.crew ?? []).filter((credit) => credit.department === mainDepartment);

  const roleOf = (credit: PersonCredit) => (isActor ? credit.character : credit.job) ?? "";
  return toEntries(source, roleOf)
    .filter((entry) => entry.posterPath)
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}

/**
 * Iniciais para o monograma de quem não tem foto (D-66): primeira letra do primeiro e do
 * último nome. Conta caracteres pelo Unicode (nomes em chinês, tailandês, coreano), e
 * nomes de uma palavra só, ou escritos sem espaços, dão uma inicial.
 */
export function getInitials(name: string | null | undefined): string {
  const words = (name ?? "")
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+/u, ""))
    .filter(Boolean);
  const first = words[0];
  if (!first) return "";
  const initial = (word: string) => Array.from(word)[0]?.toLocaleUpperCase("pt-BR") ?? "";
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  return initial(first) + (last ? initial(last) : "");
}
