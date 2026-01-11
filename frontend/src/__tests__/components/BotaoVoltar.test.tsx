import { render, screen } from "@testing-library/react";
import BotaoVoltar from "@/components/BotaoVoltar";
import { useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

describe("BotaoVoltar Component", () => {
  const mockUseSearchParams = useSearchParams as jest.Mock;

  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("deve renderizar com texto padrão", () => {
    render(<BotaoVoltar />);
    expect(screen.getByText("Voltar")).toBeInTheDocument();
    expect(screen.getByText("←")).toBeInTheDocument();
  });

  it("deve renderizar com texto customizado", () => {
    render(<BotaoVoltar>← Voltar ao Dashboard</BotaoVoltar>);
    expect(screen.getByText("Voltar ao Dashboard")).toBeInTheDocument();
  });

  it("deve aplicar classe CSS padrão", () => {
    render(<BotaoVoltar />);
    const link = screen.getByText("Voltar").closest("a");
    expect(link).toHaveClass("group", "inline-flex", "items-center");
  });

  it("deve aplicar classe CSS customizada", () => {
    render(<BotaoVoltar className="custom-class">Voltar</BotaoVoltar>);
    const link = screen.getByText("Voltar").closest("a");
    expect(link).toHaveClass("custom-class");
  });

  it("deve criar link para dashboard quando não há origem", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    render(<BotaoVoltar />);
    const link = screen.getByText("Voltar").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("deve criar link para transacoes quando origem é transacoes", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("origem=transacoes")
    );
    render(<BotaoVoltar />);
    const link = screen.getByText("Voltar").closest("a");
    expect(link).toHaveAttribute("href", "/transacoes");
  });

  it("deve criar link para categoria quando origem é categoria", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("origem=categoria:Alimentação")
    );
    render(<BotaoVoltar />);
    const link = screen.getByText("Voltar").closest("a");
    expect(link?.getAttribute("href")).toContain("/categoria/Alimenta");
  });

  it("deve preservar período e diaInicio nos query params", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("periodo=2024-06&diaInicio=15")
    );
    render(<BotaoVoltar />);
    const link = screen.getByText("Voltar").closest("a");
    expect(link?.getAttribute("href")).toContain("periodo=2024-06");
    expect(link?.getAttribute("href")).toContain("diaInicio=15");
  });

  it("deve preservar tags nos query params", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("periodo=2024-06&tags=1,2,3")
    );
    render(<BotaoVoltar />);
    const link = screen.getByText("Voltar").closest("a");
    expect(link?.getAttribute("href")).toContain("tags=1%2C2%2C3");
  });
});
