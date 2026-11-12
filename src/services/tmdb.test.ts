import { afterEach, describe, expect, it, vi } from "vitest";
import { urlOf } from "../test/fetch";
import {
  buildProxyUrl,
  CLIENT_CACHE_TTL_MS,
  discoverMovies,
  discoverTv,
  errorCodeFromResponse,
  getCollection,
  getMovieDetails,
  getMovieGenres,
  getMovieList,
  getPersonDetails,
  getPersonDetailsInEnglish,
  getPopularPeople,
  getPopularTv,
  getTvDetails,
  getTvGenres,
  PREFETCH,
  searchMovies,
  searchPeople,
  searchTv,
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

  it("detalhes trazem elenco, vídeos, recomendações e onde assistir numa única chamada, sem região", async () => {
    const fetchMock = mockFetch(
      jsonResponse({ id: 550, title: "Clube da Luta", poster_path: null }),
    );
    await getMovieDetails(550);

    const url = requestedUrl(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(url.pathname).toBe("/api/tmdb/movie/550");
    expect(url.searchParams.get("append_to_response")).toBe(
      "credits,videos,recommendations,similar,watch/providers,release_dates,images,external_ids",
    );
    expect(url.searchParams.get("include_image_language")).toBe("pt,null,en");
    expect(url.searchParams.get("include_video_language")).toBe("pt,en,null");
    expect(url.searchParams.get("language")).toBe("pt-BR");
    expect(url.searchParams.has("region")).toBe(false);
  });

  it("gêneros devolvem a lista", async () => {
    mockFetch(jsonResponse({ genres: [{ id: 18, name: "Drama" }] }));
    await expect(getMovieGenres()).resolves.toEqual([{ id: 18, name: "Drama" }]);
  });

  it("cancelar o único interessado cancela a requisição", async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    const pending = getMovieList("popular", 1, { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });
});

describe("cache de respostas no cliente", () => {
  it("pedidos iguais compartilham uma única requisição e reaproveitam o resultado", async () => {
    const fetchMock = mockFetch(jsonResponse(page));

    const [first, second] = await Promise.all([getMovieList("popular"), getMovieList("popular")]);
    const third = await getMovieList("popular");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(third).toBe(first);
  });

  it("não guarda erros: a nova tentativa consulta de novo", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(jsonResponse(page));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getMovieList("popular")).rejects.toMatchObject({ code: "unavailable" });
    await expect(getMovieList("popular")).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("consulta de novo depois que o prazo do cache expira", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse(page)));
    vi.stubGlobal("fetch", fetchMock);
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);

    await getMovieList("popular");
    now.mockReturnValue(1_000 + CLIENT_CACHE_TTL_MS - 1);
    await getMovieList("popular");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1_000 + CLIENT_CACHE_TTL_MS + 1);
    await getMovieList("popular");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("a desistência de um interessado não cancela a requisição dos outros", async () => {
    let resolveFetch: (response: Response) => void = () => undefined;
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const leaving = new AbortController();

    const abandoned = getMovieList("popular", 1, { signal: leaving.signal });
    const kept = getMovieList("popular", 1, { signal: new AbortController().signal });
    leaving.abort();
    resolveFetch(jsonResponse(page));

    await expect(abandoned).rejects.toMatchObject({ name: "AbortError" });
    await expect(kept).resolves.toEqual(page);
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
  });

  it("o erro de um pré-carregamento chega uma vez à página, sem repetir a requisição", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(jsonResponse(page));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getMovieList("popular", 1, PREFETCH)).rejects.toMatchObject({
      code: "unavailable",
    });
    // A página recebe o mesmo erro, sem nova requisição...
    await expect(
      getMovieList("popular", 1, { signal: new AbortController().signal }),
    ).rejects.toMatchObject({ code: "unavailable" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // ...e "Tentar novamente" consulta de novo.
    await expect(
      getMovieList("popular", 1, { signal: new AbortController().signal }),
    ).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("o pré-carregamento mantém a requisição viva mesmo se a página desistir", async () => {
    let resolveFetch: (response: Response) => void = () => undefined;
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    const prefetched = getMovieList("popular");
    const fromPage = getMovieList("popular", 1, { signal: controller.signal });
    controller.abort();
    resolveFetch(jsonResponse(page));

    await expect(fromPage).rejects.toMatchObject({ name: "AbortError" });
    await expect(prefetched).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledTimes(1);
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

describe("séries, pessoas e coleções", () => {
  const page = { page: 1, results: [], total_pages: 0, total_results: 0 };

  it("série completa numa única chamada, com os complementos de séries", async () => {
    const fetchMock = mockFetch(
      jsonResponse({ id: 1396, name: "Breaking Bad", poster_path: null }),
    );
    await getTvDetails(1396);

    const url = requestedUrl(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(url.pathname).toBe("/api/tmdb/tv/1396");
    expect(url.searchParams.get("append_to_response")).toBe(
      "aggregate_credits,videos,recommendations,similar,watch/providers,content_ratings,images,external_ids",
    );
    expect(url.searchParams.get("language")).toBe("pt-BR");
  });

  it("pessoa com filmografia, fotos e perfis oficiais; biografia em inglês sem complementos", async () => {
    const fetchMock = mockFetch(jsonResponse({ id: 287, name: "Brad Pitt", profile_path: null }));
    await getPersonDetails(287);
    const url = requestedUrl(fetchMock);
    expect(url.pathname).toBe("/api/tmdb/person/287");
    expect(url.searchParams.get("append_to_response")).toBe("combined_credits,images,external_ids");
    expect(url.searchParams.get("language")).toBe("pt-BR");

    const englishMock = mockFetch(jsonResponse({ id: 287, name: "Brad Pitt", profile_path: null }));
    await getPersonDetailsInEnglish(287);
    const english = requestedUrl(englishMock);
    expect(english.searchParams.get("language")).toBe("en-US");
    expect(english.searchParams.has("append_to_response")).toBe(false);
  });

  it("listas, gêneros, descoberta e coleção usam os endpoints permitidos pelo proxy", async () => {
    const cases: [() => Promise<unknown>, string, unknown][] = [
      [() => getPopularTv(), "/api/tmdb/tv/popular", page],
      [() => getPopularPeople(2), "/api/tmdb/person/popular", page],
      [() => getTvGenres(), "/api/tmdb/genre/tv/list", { genres: [] }],
      [() => discoverTv({ genre: "18" }), "/api/tmdb/discover/tv", page],
      [() => getCollection(2344), "/api/tmdb/collection/2344", { id: 2344, name: "x", parts: [] }],
    ];

    for (const [call, pathname, body] of cases) {
      const fetchMock = mockFetch(jsonResponse(body));
      await call();
      expect(requestedUrl(fetchMock).pathname).toBe(pathname);
    }
  });

  it("buscas de séries e pessoas codificam o termo e não consultam com termo vazio", async () => {
    const fetchMock = mockFetch(jsonResponse(page));
    await searchTv("Velozes & Furiosos");
    expect(requestedUrl(fetchMock).pathname).toBe("/api/tmdb/search/tv");
    expect(requestedUrl(fetchMock).searchParams.get("query")).toBe("Velozes & Furiosos");

    const peopleMock = mockFetch(jsonResponse(page));
    await searchPeople("  brad  ");
    expect(requestedUrl(peopleMock).pathname).toBe("/api/tmdb/search/person");
    expect(requestedUrl(peopleMock).searchParams.get("query")).toBe("brad");

    const emptyMock = mockFetch(jsonResponse(page));
    await expect(searchTv("   ")).resolves.toMatchObject({ results: [] });
    await expect(searchPeople("")).resolves.toMatchObject({ results: [] });
    expect(emptyMock).not.toHaveBeenCalled();
  });
});
