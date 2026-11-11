import { describe, expect, it } from "vitest";
import { getBackdropUrl, getLogoUrl, getPosterUrl, getProfileUrl, posterSrcSet } from "./images";

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
