import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { urlOf } from "../test/fetch";
import type { MovieSummary } from "../types/tmdb";
import { mergeMovies, useMovies, type MovieSource } from "./useMovies";

const movie = (id: number): MovieSummary => ({
  id,
  title: `Filme ${String(id)}`,
  poster_path: null,
});

const pageResponse = (pageNumber: number, ids: number[], totalPages = 3) =>
  new Response(
    JSON.stringify({
      page: pageNumber,
      results: ids.map(movie),
      total_pages: totalPages,
      total_results: 60,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mergeMovies", () => {
  it("não repete filmes entre páginas", () => {
    expect(mergeMovies([movie(1), movie(2)], [movie(2), movie(3)]).map(({ id }) => id)).toEqual([
      1, 2, 3,
    ]);
  });
});

describe("useMovies", () => {
  it("carrega a primeira página e acrescenta a próxima com 'Carregar mais'", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(pageResponse(1, [1, 2]))
      .mockResolvedValueOnce(pageResponse(2, [2, 3]));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useMovies({ kind: "list", list: "top_rated" }));
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.movies.map(({ id }) => id)).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.totalResults).toBe(60);

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.isLoadingMore).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingMore).toBe(false);
    });
    expect(result.current.movies.map(({ id }) => id)).toEqual([1, 2, 3]);
    expect(result.current.page).toBe(2);
    expect(urlOf(fetchMock.mock.calls[1]?.[0])).toContain("page=2");
  });

  it("mantém a lista quando falha ao carregar mais e permite tentar de novo", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(pageResponse(1, [1]))
        .mockResolvedValueOnce(new Response("{}", { status: 503 })),
    );

    const { result } = renderHook(() => useMovies({ kind: "list", list: "popular" }));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => {
      expect(result.current.loadMoreError).not.toBe("");
    });
    expect(result.current.movies.map(({ id }) => id)).toEqual([1]);
    expect(result.current.error).toBe("");
  });

  it("expõe erro do carregamento inicial e recarrega com reload", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 401 }))
        .mockResolvedValueOnce(pageResponse(1, [7], 1)),
    );

    const { result } = renderHook(() => useMovies({ kind: "list", list: "popular" }));
    await waitFor(() => {
      expect(result.current.errorCode).toBe("unauthorized");
    });
    expect(result.current.error).toMatch(/chave do TMDB/);

    act(() => {
      result.current.reload();
    });
    await waitFor(() => {
      expect(result.current.movies.map(({ id }) => id)).toEqual([7]);
    });
    expect(result.current.hasMore).toBe(false);
  });

  it("recomeça do zero quando a origem muda e cancela a requisição anterior", async () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>((_input, init) => {
        if (init?.signal) signals.push(init.signal);
        return Promise.resolve(pageResponse(1, [signals.length]));
      }),
    );

    const { result, rerender } = renderHook(
      ({ source }: { source: MovieSource }) => useMovies(source),
      {
        initialProps: { source: { kind: "search", query: "duna" } as MovieSource },
      },
    );
    rerender({ source: { kind: "search", query: "matrix" } });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(signals[0]?.aborted).toBe(true);
    expect(result.current.movies).toHaveLength(1);
  });

  it("não faz requisição quando a origem é nula (busca vazia)", () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useMovies(null));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.movies).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
