import { messages } from "../i18n";
import type { WatchProvider, WatchProviderRegion, WatchProvidersResponse } from "../types/tmdb";

type ProviderGroupKey = Exclude<keyof WatchProviderRegion, "link">;

const PROVIDER_GROUPS: readonly ProviderGroupKey[] = ["flatrate", "free", "ads", "rent", "buy"];

export interface ProviderGroup {
  key: ProviderGroupKey;
  label: string;
  providers: WatchProvider[];
}

export interface RegionAvailability {
  region: string;
  link: string | null;
  groups: ProviderGroup[];
}

/** Provedores de uma região, agrupados por modalidade e ordenados pela prioridade do TMDB. */
export function getWatchProvidersForRegion(
  payload: WatchProvidersResponse | null | undefined,
  region = "BR",
): RegionAvailability {
  const code = region.toUpperCase();
  const regionData = payload?.results[code];

  if (!regionData) return { region: code, link: null, groups: [] };

  const groups = PROVIDER_GROUPS.map((key) => ({
    key,
    label: messages.watchProviders[key],
    providers: (regionData[key] ?? [])
      .filter((provider) => provider.provider_id && provider.provider_name)
      .sort((a, b) => (a.display_priority ?? Infinity) - (b.display_priority ?? Infinity)),
  })).filter((group) => group.providers.length > 0);

  return { region: code, link: regionData.link ?? null, groups };
}
