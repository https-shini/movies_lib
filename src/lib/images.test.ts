import { describe, expect, it } from "vitest";
import {
  backdropSrcSet,
  getBackdropUrl,
  getGalleryUrl,
  getLogoUrl,
  getPosterUrl,
  getProfileUrl,
  pickGalleryImages,
  POSTER_VARIANTS,
  posterSrcSet,
} from "./images";

describe("URLs de imagens do TMDB", () => {
  it("usa w342 por padrão no pôster (grid) e aceita outros tamanhos", () => {
    expect(getPosterUrl("/abc.jpg")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
    expect(getPosterUrl("abc.jpg", "w500")).toBe("https://image.tmdb.org/t/p/w500/abc.jpg");
  });

  it("monta backdrop, perfil e logo com os tamanhos padrão", () => {
    expect(getBackdropUrl("/b.jpg")).toBe("https://image.tmdb.org/t/p/w1280/b.jpg");
    expect(getBackdropUrl("/b.jpg", "w780")).toBe("https://image.tmdb.org/t/p/w780/b.jpg");
    expect(getProfileUrl("/p.jpg")).toBe("https://image.tmdb.org/t/p/w185/p.jpg");
    expect(getLogoUrl("/l.png")).toBe("https://image.tmdb.org/t/p/w92/l.png");
  });

  it.each([null, undefined, "", "   "])("retorna null sem caminho: %s", (path) => {
    expect(getPosterUrl(path)).toBeNull();
    expect(getBackdropUrl(path)).toBeNull();
  });

  it("monta srcset com as larguras reais", () => {
    expect(posterSrcSet("/a.jpg", ["w185", "w342"])).toBe(
      "https://image.tmdb.org/t/p/w185/a.jpg 185w, https://image.tmdb.org/t/p/w342/a.jpg 342w",
    );
    expect(posterSrcSet(null, ["w185"])).toBeUndefined();
  });
});

describe("variantes de pôster e srcset de backdrop", () => {
  it("monta srcset com as larguras de cada variante", () => {
    expect(posterSrcSet("/p.jpg", POSTER_VARIANTS.thumb.srcSet)).toBe(
      "https://image.tmdb.org/t/p/w92/p.jpg 92w, https://image.tmdb.org/t/p/w185/p.jpg 185w",
    );
    expect(POSTER_VARIANTS.card.srcSet).toEqual(["w185", "w342"]);
    expect(POSTER_VARIANTS.detail.src).toBe("w500");
  });

  it("monta srcset de backdrop e ignora caminho vazio", () => {
    expect(backdropSrcSet("/b.jpg", ["w780", "w1280"])).toBe(
      "https://image.tmdb.org/t/p/w780/b.jpg 780w, https://image.tmdb.org/t/p/w1280/b.jpg 1280w",
    );
    expect(backdropSrcSet(null, ["w780"])).toBeUndefined();
  });
});

describe("galeria", () => {
  it("monta as URLs da miniatura e da imagem ampliada por formato", () => {
    expect(getGalleryUrl("/a.jpg", "backdrop", "thumb")).toBe(
      "https://image.tmdb.org/t/p/w300/a.jpg",
    );
    expect(getGalleryUrl("/a.jpg", "poster", "full")).toBe("https://image.tmdb.org/t/p/w780/a.jpg");
    expect(getGalleryUrl(null, "profile", "full")).toBeNull();
  });

  it("junta fundos, pôsteres e retratos respeitando os limites e sem repetir", () => {
    const images = pickGalleryImages(
      {
        backdrops: [{ file_path: "/b1.jpg" }, { file_path: "/b2.jpg" }, { file_path: "/b3.jpg" }],
        posters: [{ file_path: "/p1.jpg" }, { file_path: "/b1.jpg" }, { file_path: "" }],
      },
      { backdrops: 2, posters: 3 },
    );

    expect(images).toEqual([
      { path: "/b1.jpg", kind: "backdrop" },
      { path: "/b2.jpg", kind: "backdrop" },
      { path: "/p1.jpg", kind: "poster" },
    ]);
    expect(pickGalleryImages(undefined)).toEqual([]);
  });
});
