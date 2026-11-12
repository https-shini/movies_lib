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

/** `srcset` de backdrops (imagens de fundo), com as larguras reais de cada arquivo. */
export function backdropSrcSet(
  path: string | null | undefined,
  sizes: readonly Exclude<BackdropSize, "original">[],
): string | undefined {
  const entries = sizes
    .map((size) => {
      const url = getBackdropUrl(path, size);
      return url ? `${url} ${size.slice(1)}w` : null;
    })
    .filter((entry): entry is string => entry !== null);

  return entries.length > 0 ? entries.join(", ") : undefined;
}

/**
 * Variantes de pôster com `srcset` e `sizes` medidos nos cinco tamanhos de tela (D-40):
 * - card: grades e faixas, de 132 a 200 px de largura;
 * - thumb: miniaturas do ranking, de 56 a 64 px;
 * - detail: pôster da página do filme, 112 px até 899 px de tela e até 280 px acima.
 */
export const POSTER_VARIANTS = {
  card: { src: "w342", srcSet: ["w185", "w342"], sizes: "(min-width: 700px) 200px, 45vw" },
  thumb: { src: "w185", srcSet: ["w92", "w185"], sizes: "64px" },
  detail: {
    src: "w500",
    srcSet: ["w185", "w342", "w500"],
    sizes: "(min-width: 900px) 280px, 112px",
  },
} as const satisfies Record<
  string,
  { src: PosterSize; srcSet: readonly Exclude<PosterSize, "original">[]; sizes: string }
>;

export type PosterVariant = keyof typeof POSTER_VARIANTS;

/** Tamanhos da galeria: miniatura e imagem ampliada, por formato. */
export const GALLERY_SIZES = {
  backdrop: { thumb: "w300", full: "w1280" },
  poster: { thumb: "w185", full: "w780" },
  profile: { thumb: "w185", full: "original" },
} as const;

export type GalleryKind = keyof typeof GALLERY_SIZES;

/** URL de uma imagem da galeria (pôster, fundo ou foto) no tamanho pedido. */
export function getGalleryUrl(
  path: string | null | undefined,
  kind: GalleryKind,
  size: "thumb" | "full",
): string | null {
  return buildImageUrl(path, GALLERY_SIZES[kind][size]);
}
