/**
 * URLs de imagens do TMDB. As imagens são públicas e não exigem chave.
 * Tamanhos conforme a seção 7 da identidade visual: w342 no grid, w500 nos
 * detalhes e w780/w1280 para backdrops.
 */
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type PosterSize = "w92" | "w185" | "w342" | "w500" | "w780" | "original";
export type BackdropSize = "w300" | "w780" | "w1280" | "original";
export type ProfileSize = "w185" | "original";
export type LogoSize = "w92" | "w185" | "original";

type ImageSize = PosterSize | BackdropSize | ProfileSize | LogoSize;

function buildImageUrl(path: string | null | undefined, size: ImageSize): string | null {
  if (typeof path !== "string" || path.trim() === "") return null;
  return `${IMAGE_BASE_URL}/${size}/${path.replace(/^\/+/, "")}`;
}

export function getPosterUrl(
  path: string | null | undefined,
  size: PosterSize = "w342",
): string | null {
  return buildImageUrl(path, size);
}

export function getBackdropUrl(
  path: string | null | undefined,
  size: BackdropSize = "w1280",
): string | null {
  return buildImageUrl(path, size);
}

export function getProfileUrl(
  path: string | null | undefined,
  size: ProfileSize = "w185",
): string | null {
  return buildImageUrl(path, size);
}

export function getLogoUrl(path: string | null | undefined, size: LogoSize = "w92"): string | null {
  return buildImageUrl(path, size);
}

/**
 * Monta um `srcset` com larguras reais, para o navegador escolher o menor
 * arquivo suficiente para a tela. Ex.: posterSrcSet(path, ["w185", "w342"]).
 */
export function posterSrcSet(
  path: string | null | undefined,
  sizes: readonly Exclude<PosterSize, "original">[],
): string | undefined {
  const entries = sizes
    .map((size) => {
      const url = getPosterUrl(path, size);
      return url ? `${url} ${size.slice(1)}w` : null;
    })
    .filter((entry): entry is string => entry !== null);

  return entries.length > 0 ? entries.join(", ") : undefined;
}
