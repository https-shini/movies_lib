import { fetchTmdb, getLogoUrl } from "./tmdb.js";

const PROVIDER_GROUPS = [
  { key: "flatrate", label: "Assinatura" },
  { key: "free", label: "Gratuito" },
  { key: "ads", label: "Com anúncios" },
  { key: "rent", label: "Aluguel" },
  { key: "buy", label: "Compra" },
];

export async function fetchMovieWatchProviders(movieId, { signal } = {}) {
  if (!movieId) throw new Error("O identificador do filme é obrigatório.");

  return fetchTmdb(`movie/${movieId}/watch/providers`, { signal });
}

export function getWatchProvidersForRegion(payload, region = "BR") {
  const regionData = payload?.results?.[region.toUpperCase()];

  if (!regionData) {
    return { region: region.toUpperCase(), link: null, groups: [] };
  }

  const groups = PROVIDER_GROUPS.map(({ key, label }) => ({
    key,
    label,
    providers: (regionData[key] ?? [])
      .filter((provider) => provider?.provider_id && provider?.provider_name)
      .sort((a, b) => (a.display_priority ?? Infinity) - (b.display_priority ?? Infinity)),
  })).filter((group) => group.providers.length > 0);

  return {
    region: region.toUpperCase(),
    link: regionData.link || null,
    groups,
  };
}

export function getProviderLogoUrl(path) {
  return getLogoUrl(path);
}
