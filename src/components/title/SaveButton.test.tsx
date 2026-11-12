import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Toaster from "../ui/Toaster";
import SaveButton from "./SaveButton";
import { resetToasts } from "../../lib/toast";
import { WATCHLIST_STORAGE_KEY } from "../../lib/watchlist";

const dune = {
  id: 438631,
  mediaType: "movie" as const,
  title: "Duna",
  posterPath: null,
  date: "2021-10-21",
  voteAverage: 7.8,
};
const other = { ...dune, id: 1, title: "Outro" };

function nth(elements: HTMLElement[], index: number): HTMLElement {
  const element = elements[index];
  if (!element) throw new Error(`elemento ${String(index)} ausente`);
  return element;
}

function stored(): string[] {
  const raw = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
  return raw === null ? [] : (JSON.parse(raw) as { title: string }[]).map((item) => item.title);
}

describe("SaveButton", () => {
  beforeEach(() => {
    window.localStorage.clear();
    act(() => {
      resetToasts();
    });
  });
  afterEach(() => {
    act(() => {
      resetToasts();
    });
  });

  it("salva, avisa, remove e desfaz devolvendo a lista na mesma ordem", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SaveButton item={other} />
        <SaveButton item={dune} />
        <Toaster />
      </>,
    );
    const saveButtons = screen.getAllByRole("button", { name: "Salvar na lista" });
    await user.click(nth(saveButtons, 0));
    await user.click(nth(saveButtons, 1));
    expect(screen.getByRole("status")).toHaveTextContent("Duna entrou na sua lista");
    const before = stored();
    expect(before).toHaveLength(2);

    await user.click(nth(screen.getAllByRole("button", { name: "Na sua lista" }), 1));
    expect(stored()).toEqual(["Outro"]);
    expect(screen.getByRole("status")).toHaveTextContent("Duna saiu da sua lista");

    await user.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(stored()).toEqual(before);
    expect(screen.getAllByRole("button", { name: "Na sua lista" })).toHaveLength(2);
  });

  it("fecha o aviso pelo botão", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SaveButton item={dune} />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Salvar na lista" }));
    await user.click(screen.getByRole("button", { name: "Fechar aviso" }));
    expect(screen.queryByRole("listitem")).toBeNull();
  });
});
