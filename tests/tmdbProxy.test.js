import { describe, expect, it, vi } from "vitest";

import { buildUpstreamRequest, handleTmdbProxy } from "../server/tmdbProxy.js";

const request = (query, method = "GET") =>
  new Request(`https://app.example/api/tmdb?${query}`, { method });
const okResponse = (body = { results: [] }) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json;charset=utf-8" },
  });

describe("buildUpstreamRequest", () => {
  it("adds the server-side API key and forwards allowed parameters", () => {
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

  it("uses a bearer header for v4 read access tokens", () => {
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJ4In0.signature";
    const { url, headers } = buildUpstreamRequest({
      path: "movie/550",
      searchParams: new URLSearchParams(),
      apiKey: token,
    });

    expect(headers.Authorization).toBe(`Bearer ${token}`);
    expect(url.searchParams.has("api_key")).toBe(false);
  });

  it("drops unknown parameters, client-supplied keys and disallowed appends", () => {
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

  it.each(["account/123", "movie/550/../../account", "authentication/token/new", "movie/abc", ""])(
    "rejects endpoints outside the allowlist: %s",
    (path) => {
      expect(() =>
        buildUpstreamRequest({ path, searchParams: new URLSearchParams(), apiKey: "key" }),
      ).toThrow(/não permitido/);
    },
  );
});

describe("handleTmdbProxy", () => {
  it("returns TMDB data with CDN cache headers", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse({ results: [{ id: 1 }] }));
    const response = await handleTmdbProxy(request("path=movie/popular&language=pt-BR"), {
      apiKey: "key",
      fetchImpl,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ results: [{ id: 1 }] });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
    expect(fetchImpl.mock.calls[0][0].searchParams.get("api_key")).toBe("key");
  });

  it("reports a missing server key without calling TMDB", async () => {
    const fetchImpl = vi.fn();
    const response = await handleTmdbProxy(request("path=movie/popular"), {
      apiKey: "",
      fetchImpl,
    });

    expect(response.status).toBe(500);
    expect((await response.json()).code).toBe("missing_api_key");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns 404 for endpoints outside the allowlist", async () => {
    const response = await handleTmdbProxy(request("path=account/1"), {
      apiKey: "key",
      fetchImpl: vi.fn(),
    });
    expect(response.status).toBe(404);
  });

  it("only accepts GET", async () => {
    const response = await handleTmdbProxy(request("path=movie/popular", "POST"), {
      apiKey: "key",
      fetchImpl: vi.fn(),
    });
    expect(response.status).toBe(405);
  });

  it("passes TMDB errors through without caching them", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response('{"status_code":34}', { status: 404 }));
    const response = await handleTmdbProxy(request("path=movie/999999"), {
      apiKey: "key",
      fetchImpl,
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 502 when TMDB cannot be reached", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const response = await handleTmdbProxy(request("path=movie/popular"), {
      apiKey: "key",
      fetchImpl,
    });

    expect(response.status).toBe(502);
    expect((await response.json()).code).toBe("upstream_unavailable");
  });
});
