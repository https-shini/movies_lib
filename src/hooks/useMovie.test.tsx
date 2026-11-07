import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { urlOf } from "../test/fetch";
import { useAsync } from "./useAsync";
import { formatDocumentTitle, useDocumentTitle } from "./useDocumentTitle";
import { useMovie } from "./useMovie";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMovie", () => {
  it("carrega os detalhes e recarrega ao trocar de filme", async () => {
    const fetchMock = vi.fn<typeof fetch>((input) => {
      const id = /movie\/(\d+)/.exec(urlOf(input))?.[1] ?? "0";
      return Promise.resolve(
        new Response(JSON.stringify({ id: Number(id), title: `Filme ${id}`, poster_path: null }), {
          status: 200,
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(({ id }: { id: number }) => useMovie(id), {
      initialProps: { id: 550 },
    });
    await waitFor(() => {
      expect(result.current.data?.title).toBe("Filme 550");
    });

    rerender({ id: 603 });
    await waitFor(() => {
      expect(result.current.data?.title).toBe("Filme 603");
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("mostra erro amigável para filme inexistente", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(JSON.stringify({ status_code: 34 }), { status: 404 })),
    );
    const { result } = renderHook(() => useMovie(999999999));
    await waitFor(() => {
      expect(result.current.errorCode).toBe("notFound");
    });
    expect(result.current.data).toBeNull();
  });
});

describe("useAsync", () => {
  it("tenta de novo com reload", async () => {
    const loader = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockRejectedValueOnce(new Error("falhou"))
      .mockResolvedValueOnce("ok");

    const { result } = renderHook(() => useAsync(loader));
    await waitFor(() => {
      expect(result.current.errorCode).toBe("unknown");
    });

    act(() => {
      result.current.reload();
    });
    await waitFor(() => {
      expect(result.current.data).toBe("ok");
    });
    expect(result.current.error).toBe("");
  });
});

describe("useDocumentTitle", () => {
  it("usa o formato 'Título · Cinelux' e o título padrão", () => {
    expect(formatDocumentTitle("Duna")).toBe("Duna · Cinelux");
    expect(formatDocumentTitle("  ")).toBe("Cinelux · Seu acervo de cinema");

    renderHook(() => {
      useDocumentTitle("Duna");
    });
    expect(document.title).toBe("Duna · Cinelux");
  });
});
