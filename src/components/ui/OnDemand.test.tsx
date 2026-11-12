import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OnDemand from "./OnDemand";

type Callback = (entries: { isIntersecting: boolean }[]) => void;

function stubObserver() {
  const state: { callback: Callback | null; disconnected: number; options: unknown } = {
    callback: null,
    disconnected: 0,
    options: null,
  };
  class FakeObserver {
    constructor(callback: Callback, options: unknown) {
      state.callback = callback;
      state.options = options;
    }
    observe() {
      return undefined;
    }
    disconnect() {
      state.disconnected += 1;
    }
  }
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  return state;
}

describe("OnDemand", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mostra o espaço reservado até a seção chegar perto da tela, e então monta o conteúdo", () => {
    const observer = stubObserver();
    render(
      <OnDemand fallback={<p>carregando</p>}>
        <p>conteúdo</p>
      </OnDemand>,
    );

    expect(screen.getByText("carregando")).toBeInTheDocument();
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();
    // Em espera, o contêiner é marcado para os esqueletos não animarem fora da tela.
    expect(screen.getByText("carregando").parentElement).toHaveClass("on-demand--idle");
    expect(observer.options).toEqual({ rootMargin: "200px 0px" });

    act(() => {
      observer.callback?.([{ isIntersecting: false }]);
    });
    expect(screen.queryByText("conteúdo")).not.toBeInTheDocument();

    act(() => {
      observer.callback?.([{ isIntersecting: true }]);
    });
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
    expect(screen.queryByText("carregando")).not.toBeInTheDocument();
    expect(screen.getByText("conteúdo").parentElement).not.toHaveClass("on-demand--idle");
    // Depois de montado, deixa de observar: o conteúdo não volta ao espaço reservado.
    expect(observer.disconnected).toBeGreaterThan(0);
  });

  it("monta o conteúdo direto quando o navegador não tem IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(
      <OnDemand fallback={<p>carregando</p>}>
        <p>conteúdo</p>
      </OnDemand>,
    );

    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });
});
