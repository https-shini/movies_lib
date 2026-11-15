import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import RouteError from "./RouteError";

const robots = () => document.head.querySelector('meta[name="robots"]');

function renderRoute(route: { element?: React.ReactNode; loader?: () => never }) {
  const router = createMemoryRouter([{ path: "/", errorElement: <RouteError />, ...route }]);
  return render(<RouterProvider router={router} />);
}

const Broken = () => {
  throw new Error("falha de renderização simulada");
};

describe("RouteError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("erro inesperado: título próprio, caminhos de volta e sem noindex", async () => {
    // O React registra o erro no console; aqui ele é esperado.
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderRoute({ element: <Broken /> });

    expect(
      await screen.findByRole("heading", { level: 1, name: "O projetor falhou" }),
    ).toBeVisible();
    expect(document.title).toBe("Algo deu errado · Cinelux");
    expect(screen.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Descobrir filmes" })).toHaveAttribute(
      "href",
      "/discover",
    );
    // Uma falha passageira de uma página que existe não deve sair dos buscadores.
    expect(robots()).toBeNull();
  });

  it("404 vinda do roteador: tela de página inexistente com noindex", async () => {
    renderRoute({
      loader: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- é assim que o React Router sinaliza 404
        throw new Response("", { status: 404 });
      },
      element: <p>nunca exibido</p>,
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Esta cena foi cortada" }),
    ).toBeVisible();
    expect(document.title).toBe("Página não encontrada · Cinelux");
    expect(robots()?.getAttribute("content")).toBe("noindex");
  });
});
