import { afterEach, describe, expect, it, vi } from "vitest";
import { urlOf } from "../test/fetch";
import {
  buildProxyUrl,
  discoverMovies,
  errorCodeFromResponse,
  getMovieDetails,
  getMovieGenres,
  getMovieList,
  getMovieWatchProviders,
  searchMovies,
  TmdbError,
} from "./tmdb";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const page = { page: 1, results: [], total_pages: 1, total_results: 0 };

function mockFetch(response: Response) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const requestedUrl = (fetchMock: ReturnType<typeof mockFetch>) => {
  const [input] = fetchMock.mock.calls[0] ?? [];
  return new URL(urlOf(input), "http://localhost");
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildProxyUrl", () => {
  it("chama o proxy interno, nunca o TMDB, e não inclui chave", () => {
    const url = buildProxyUrl("movie/top_rated", { language: "pt-BR", page: 2 });
    expect(url).toBe("/api/tmdb/movie/top_rated?language=pt-BR&page=2");
    expect(url).not.toContain("api_key");
    expect(url).not.toContain("themoviedb.org");
  });

  it("ignora parâmetros vazios e rejeita endpoint vazio", () => {
    expect(buildProxyUrl("/genre/movie/list/", { a: "", b: null, c: undefined })).toBe(
      "/api/tmdb/genre/movie/list",
    );
    expect(() => buildProxyUrl("")).toThrow();
  });
});

describe("requisições ao TMDB", () => {
  it("listas usam idioma e região do Brasil", async () => {
    const fetchMock = mockFetch(jsonResponse(page));
    await getMovieList("top_rated", 2);

    const url = requestedUrl(fetchMock);
    expect(url.pathname).toBe("/api/tmdb/movie/top_rated");
    expect(url.searchParams.get("language")).toBe("pt-BR");
    expect(url.searchParams.get("region")).toBe("BR");
    expect(url.searchParams.get("page")).toBe("2");
  });

  it.each(["Velozes & Furiosos", "#Alive", "Quem? Onde?"])(
    "codifica corretamente o termo de busca %s",
    async (term) => {
      const fetchMock = mockFetch(jsonResponse(page));
      await searchMovies(`  ${term}  `);

      const url = requestedUrl(fetchMock);
      expect(url.pathname).toBe("/api/tmdb/search/movie");
      expect(url.searchParams.get("query")).toBe(term);
      expect(url.searchParams.get("include_adult")).toBe("false");
      expect(url.searchParams.get("region")).toBe("BR");
    },
  );

  it("busca vazia não faz requisição", async () => {
    const fetchMock = mockFetch(jsonResponse(page));
    await expect(searchMovies("   ")).resolves.toEqual({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("descoberta envia filtros, idioma e região", async () => {
    const fetchMock = mockFetch(jsonResponse(page));
    await discoverMovies({ genre: "18", sort: "vote_average.desc" }, 3);

    const url = requestedUrl(fetchMock);
    expect(url.pathname).toBe("/api/tmdb/discover/movie");
    expect(url.searchParams.get("with_genres")).toBe("18");
    expect(url.searchParams.get("vote_count.gte")).toBe("200");
    expect(url.searchParams.get("page")).toBe("3");
    expect(url.searchParams.get("region")).toBe("BR");
  });

  it("detalhes trazem elenco, vídeos e recomendações numa única chamada, sem região", async () => {
    const fetchMock = mockFetch(
      jsonResponse({ id: 550, title: "Clube da Luta", poster_path: null }),
    );
    await getMovieDetails(550);

    const url = requestedUrl(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(url.pathname).toBe("/api/tmdb/movie/550");
    expect(url.searchParams.get("append_to_response")).toBe(
      "credits,videos,recommendations,similar",
    );
    expect(url.searchParams.get("include_video_language")).toBe("pt,en,null");
    expect(url.searchParams.get("language")).toBe("pt-BR");
    expect(url.searchParams.has("region")).toBe(false);
  });

  it("gêneros devolvem a lista e provedores usam o endpoint do filme", async () => {
    mockFetch(jsonResponse({ genres: [{ id: 18, name: "Drama" }] }));
    await expect(getMovieGenres()).resolves.toEqual([{ id: 18, name: "Drama" }]);

    const fetchMock = mockFetch(jsonResponse({ results: {} }));
    await getMovieWatchProviders(550);
    expect(requestedUrl(fetchMock).pathname).toBe("/api/tmdb/movie/550/watch/providers");
  });

  it("repassa o AbortSignal para o fetch", async () => {
    const fetchMock = mockFetch(jsonResponse(page));
    const controller = new AbortController();
    await getMovieList("popular", 1, { signal: controller.signal });
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
  });
});

describe("tratamento de erros", () => {
  it.each([
    [401, "unauthorized"],
    [404, "notFound"],
    [422, "invalidRequest"],
    [429, "rateLimited"],
    [502, "upstream"],
    [503, "unavailable"],
    [418, "unknown"],
  ] as const)("HTTP %i vira o código %s", async (status, code) => {
    mockFetch(jsonResponse({ success: false }, status));
    const error = await getMovieList("popular").catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(TmdbError);
    expect(error).toMatchObject({ code, status });
  });

  it("identifica a chave ausente no servidor", () => {
    expect(errorCodeFromResponse(500, "missing_server_key")).toBe("missingServerKey");
  });

  it("falha de rede vira erro amigável", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(getMovieList("popular")).rejects.toMatchObject({ code: "network" });
  });

  it("cancelamento é propagado sem conversão", async () => {
    const abort = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));
    await expect(getMovieList("popular")).rejects.toBe(abort);
  });

  it("rejeita resposta sem JSON e payload com success=false", async () => {
    mockFetch(new Response("<html>", { status: 200 }));
    await expect(getMovieList("popular")).rejects.toMatchObject({ code: "invalidResponse" });

    mockFetch(jsonResponse({ success: false }, 200));
    await expect(getMovieList("popular")).rejects.toMatchObject({ code: "unknown" });
  });

  it("a mensagem do erro vem do i18n", () => {
    expect(new TmdbError("rateLimited").message).toBe(
      "Muitas consultas em pouco tempo. Aguarde um instante e tente de novo.",
    );
  });
});
