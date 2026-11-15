import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNoIndex } from "./useNoIndex";

const Probe = ({ active }: { active?: boolean }) => {
  useNoIndex(active);
  return null;
};

const tags = () => document.head.querySelectorAll('meta[name="robots"]');

describe("useNoIndex", () => {
  it("adiciona noindex ao montar e remove ao desmontar", () => {
    const { unmount } = render(<Probe />);
    expect(tags()).toHaveLength(1);
    expect(tags()[0]?.getAttribute("content")).toBe("noindex");
    unmount();
    expect(tags()).toHaveLength(0);
  });

  it("não age quando inativo", () => {
    render(<Probe active={false} />);
    expect(tags()).toHaveLength(0);
  });

  it("vários usuários dividem uma tag; só o último a sair a remove", () => {
    const first = render(<Probe />);
    const second = render(<Probe />);
    expect(tags()).toHaveLength(1);
    first.unmount();
    expect(tags()).toHaveLength(1);
    second.unmount();
    expect(tags()).toHaveLength(0);
  });

  it("deixar de estar ativo (o conteúdo carregou) remove a tag", () => {
    const { rerender, unmount } = render(<Probe active />);
    expect(tags()).toHaveLength(1);
    rerender(<Probe active={false} />);
    expect(tags()).toHaveLength(0);
    unmount();
  });

  it("não remove uma tag robots que não é dela", () => {
    const external = document.createElement("meta");
    external.name = "robots";
    external.content = "max-image-preview:large";
    document.head.append(external);
    const { unmount } = render(<Probe />);
    unmount();
    expect(tags()).toHaveLength(1);
    expect(tags()[0]).toBe(external);
    external.remove();
  });
});
