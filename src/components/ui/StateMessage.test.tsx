import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StateMessage from "./StateMessage";

describe("StateMessage", () => {
  it("anuncia erros como alerta e oferece nova tentativa", async () => {
    const onRetry = vi.fn();
    render(<StateMessage tone="error" title="Falhou" message="Tente de novo." onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Falhou");
    expect(screen.getByText("Tente de novo.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("mostra o estado vazio como status, sem botão quando não há ação", () => {
    render(<StateMessage title="Nada por aqui" />);

    expect(screen.getByRole("status")).toHaveTextContent("Nada por aqui");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("aceita uma ação própria", () => {
    render(<StateMessage title="Vazio" action={<button type="button">Limpar filtros</button>} />);

    expect(screen.getByRole("button", { name: "Limpar filtros" })).toBeInTheDocument();
  });
});
