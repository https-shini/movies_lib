import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { MovieSummary } from "../../types/tmdb";
import PosterGrid from "./PosterGrid";

const movies: MovieSummary[] = [
  {
    id: 550,
    title: "Clube da Luta",
    poster_path: "/a.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
  },
  { id: 1, title: "", poster_path: null, release_date: "", vote_average: 0 },
];

const renderGrid = (props: Partial<Parameters<typeof PosterGrid>[0]> = {}) =>
  render(
    <MemoryRouter>
      <PosterGrid
        movies={movies}
        isLoading={false}
        error=""
        onRetry={vi.fn()}
        label="Resultados"
        {...props}
      />
    </MemoryRouter>,
  );

describe("PosterGrid", () => {
  it("mostra esqueletos e aria-busy enquanto carrega", () => {
    renderGrid({ isLoading: true, skeletonCount: 4 });

    const busy = screen.getByLabelText("Carregando filmes");
    expect(busy).toHaveAttribute("aria-busy", "true");
    expect(busy.children).toHaveLength(4);
  });

  it("mostra o erro com nova tentativa", () => {
    renderGrid({ error: "O TMDB não respondeu a tempo." });

    expect(screen.getByRole("alert")).toHaveTextContent("O TMDB não respondeu a tempo.");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("mostra o estado vazio com a mensagem recebida", () => {
    renderGrid({
      movies: [],
      emptyTitle: "Nenhum filme encontrado",
      emptyMessage: "Confira a grafia.",
    });

    expect(screen.getByRole("status")).toHaveTextContent("Nenhum filme encontrado");
    expect(screen.getByText("Confira a grafia.")).toBeInTheDocument();
  });

  it("lista os filmes como links, com nota e ano", () => {
    renderGrid();

    const list = screen.getByRole("list", { name: "Resultados" });
    const [first] = within(list).getAllByRole("link");
    expect(first).toHaveAttribute("href", "/movie/550");
    expect(within(list).getByLabelText("Nota 8.4 de 10")).toBeInTheDocument();
    expect(within(list).getByText("1999")).toBeInTheDocument();
  });

  it("usa textos alternativos quando faltam pôster, título e data", () => {
    renderGrid();

    const [, card] = screen.getAllByRole("link");
    if (!card) throw new Error("o segundo card não foi renderizado");
    expect(card).toHaveAttribute("href", "/movie/1");
    // Sem pôster: o quadro mostra o título no lugar da imagem quebrada.
    expect(card.querySelector("img")).toBeNull();
    expect(within(card).getAllByText("Título não informado")).toHaveLength(2);
    expect(within(card).getByText("Sem data")).toBeInTheDocument();
  });
});
