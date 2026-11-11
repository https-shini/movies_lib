// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { urlOf } from "../src/test/fetch";
import { buildUpstreamRequest, extractTmdbPath, handleTmdbProxy } from "./tmdbProxy";

const request = (pathAndQuery: string, method = "GET") =>
  new Request(`https://cinelux.app${pathAndQuery}`, { method });

const okResponse = (body: unknown = { results: [] }) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json;charset=utf-8" },
  });

const fetchStub = () => vi.fn<typeof fetch>();

describe("extractTmdbPath", () => {
  it("lê o endpoint do caminho e aceita o formato antigo ?path=", () => {
    expect(extractTmdbPath(new URL("https://x/api/tmdb/movie/550"))).toBe("movie/550");
    expect(extractTmdbPath(new URL("https://x/api/tmdb/movie/550/watch/providers"))).toBe(
      "movie/550/watch/providers",
    );
    expect(extractTmdbPath(new URL("https://x/api/tmdb?path=movie/popular"))).toBe("movie/popular");
  });

  it("normaliza tentativas de subir diretórios antes da validação", () => {
    expect(extractTmdbPath(new URL("https://x/api/tmdb/movie/550/../../account/1"))).toBe(
      "account/1",
    );
  });
});

describe("buildUpstreamRequest", () => {
  it("adiciona a chave do servidor e repassa só os parâmetros permitidos", () => {
    const { url, headers } = buildUpstreamRequest({
      path: "movie/popular",
      searchParams: new URLSearchParams("language=pt-BR&region=BR&page=2"),
      apiKey: "server-key",
    });

    expect(url.href).toBe(
      "https://api.themoviedb.org/3/movie/popular?language=pt-BR&region=BR&page=2&api_key=server-key",
    );
    expect(headers.Authorization).toBeUndefined();
  });

  it("usa cabeçalho Bearer para o token de leitura v4", () => {
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJ4In0.signature";
    const { url, headers } = buildUpstreamRequest({
      path: "movie/550",
      searchParams: new URLSearchParams(),
      apiKey: token,
    });

    expect(headers.Authorization).toBe(`Bearer ${token}`);
    expect(url.searchParams.has("api_key")).toBe(false);
  });

  it("descarta parâmetros desconhecidos, chave enviada pelo cliente e anexos não permitidos", () => {
    const { url } = buildUpstreamRequest({
      path: "movie/550",
      searchParams: new URLSearchParams(
        "api_key=attacker&foo=bar&append_to_response=credits,account_states,videos",
      ),
      apiKey: "server-key",
    });

    expect(url.searchParams.get("api_key")).toBe("server-key");
    expect(url.searchParams.has("foo")).toBe(false);
    expect(url.searchParams.get("append_to_response")).toBe("credits,videos");
  });

  it.each(["account/123", "authentication/token/new", "movie/abc", "", null])(
    "rejeita endpoints fora da lista de permissões: %s",
    (path) => {
      expect(() =>
        buildUpstreamRequest({ path, searchParams: new URLSearchParams(), apiKey: "key" }),
      ).toThrow(/não permitido/);
    },
  );
});

describe("handleTmdbProxy", () => {
  it("atende o formato por caminho com cache na CDN", async () => {
    const fetchImpl = fetchStub().mockResolvedValue(okResponse({ results: [{ id: 1 }] }));
    const response = await handleTmdbProxy(request("/api/tmdb/movie/popular?language=pt-BR"), {
      apiKey: "key",
      fetchImpl,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ results: [{ id: 1 }] });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
    const [upstream] = fetchImpl.mock.calls[0] ?? [];
    expect(urlOf(upstream)).toContain("/3/movie/popular");
  });

  it("informa a chave ausente sem chamar o TMDB", async () => {
    const fetchImpl = fetchStub();
    const response = await handleTmdbProxy(request("/api/tmdb/movie/popular"), {
      apiKey: "",
      fetchImpl,
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ code: "missing_server_key" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("bloqueia endpoints não permitidos, inclusive com ..", async () => {
    const options = { apiKey: "key", fetchImpl: fetchStub() };
    expect((await handleTmdbProxy(request("/api/tmdb/account/1"), options)).status).toBe(404);
    expect(
      (await handleTmdbProxy(request("/api/tmdb/movie/550/../../account/1"), options)).status,
    ).toBe(404);
  });

  it("aceita apenas GET", async () => {
    const response = await handleTmdbProxy(request("/api/tmdb/movie/popular", "POST"), {
      apiKey: "key",
      fetchImpl: fetchStub(),
    });
    expect(response.status).toBe(405);
  });

  it("repassa erros do TMDB sem guardar em cache", async () => {
    const fetchImpl = fetchStub().mockResolvedValue(
      new Response('{"status_code":34}', { status: 404 }),
    );
    const response = await handleTmdbProxy(request("/api/tmdb/movie/999999999"), {
      apiKey: "key",
      fetchImpl,
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("retorna 502 quando o TMDB não responde", async () => {
    const fetchImpl = fetchStub().mockRejectedValue(new TypeError("fetch failed"));
    const response = await handleTmdbProxy(request("/api/tmdb/movie/popular"), {
      apiKey: "key",
      fetchImpl,
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ code: "upstream_unavailable" });
  });
});
