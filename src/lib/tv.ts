import type { AggregateCastMember, TvDetails } from "../types/tmdb";
import { BRAZILIAN_RATINGS, type BrazilianRating } from "./movie";

/** Classificação indicativa da série no Brasil; `null` quando o TMDB não informa. */
export function getBrazilianTvRating(
  ratings: TvDetails["content_ratings"] | null | undefined,
): BrazilianRating | null {
  const brazil = ratings?.results.find((entry) => entry.iso_3166_1 === "BR");
  const rating = brazil?.rating.trim().toUpperCase() ?? "";
  return (BRAZILIAN_RATINGS as readonly string[]).includes(rating)
    ? (rating as BrazilianRating)
    : null;
}

export interface TvCastEntry {
  id: number;
  name: string;
  profilePath: string | null;
  /** Personagens interpretados, do que aparece em mais episódios para o que aparece menos. */
  characters: string[];
  episodeCount: number;
}

/** Elenco da série somando todas as temporadas, na ordem de destaque do TMDB. */
export function pickTvCast(
  cast: readonly AggregateCastMember[] | null | undefined,
  limit = Number.POSITIVE_INFINITY,
): TvCastEntry[] {
  return [...(cast ?? [])]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, limit)
    .map((member) => ({
      id: member.id,
      name: member.name,
      profilePath: member.profile_path,
      characters: [...member.roles]
        .sort((a, b) => b.episode_count - a.episode_count)
        .map((role) => role.character.trim())
        .filter(Boolean),
      episodeCount: member.total_episode_count,
    }));
}

/** Temporadas regulares em ordem; os "Especiais" (temporada 0) ficam por último. */
export function sortSeasons<T extends { season_number: number }>(seasons: readonly T[]): T[] {
  return [...seasons].sort((a, b) => {
    if (a.season_number === 0) return 1;
    if (b.season_number === 0) return -1;
    return a.season_number - b.season_number;
  });
}
