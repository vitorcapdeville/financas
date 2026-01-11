import { render, screen, fireEvent } from "@testing-library/react";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import { CriterioDataTransacao } from "@/types";

// Mock do Next.js navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("FiltrosPeriodo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete("periodo");
    mockSearchParams.delete("diaInicio");
    mockSearchParams.delete("criterio");
  });

  it("deve renderizar o seletor de período", () => {
    render(<FiltrosPeriodo />);

    // Verifica se os botões de navegação estão presentes
    const botoes = screen.getAllByRole("button");
    expect(botoes).toHaveLength(2); // Botão anterior e próximo

    // Verifica se há o texto "até" indicando o período
    expect(screen.getByText(/até/)).toBeInTheDocument();
  });

  it("deve usar valores padrão quando não há parâmetros na URL", () => {
    render(<FiltrosPeriodo />);

    // Verifica se há algum texto de período renderizado
    expect(screen.getByText(/até/)).toBeInTheDocument();
  });

  it("deve exibir período calculado corretamente", () => {
    mockSearchParams.set("periodo", "2024-01");
    mockSearchParams.set("diaInicio", "25");

    render(<FiltrosPeriodo />);

    // Deve mostrar "25 de dez. até 24 de jan. 2024"
    expect(screen.getByText(/25 de/)).toBeInTheDocument();
    expect(screen.getByText(/até/)).toBeInTheDocument();
  });

  it("deve exibir critério de data da transação", () => {
    mockSearchParams.set("criterio", CriterioDataTransacao.DATA_TRANSACAO);

    render(<FiltrosPeriodo />);

    expect(screen.getByText(/Data da transação/i)).toBeInTheDocument();
  });

  it("deve exibir critério de data da fatura", () => {
    mockSearchParams.set("criterio", CriterioDataTransacao.DATA_FATURA);

    render(<FiltrosPeriodo />);

    expect(screen.getByText(/Data da fatura/i)).toBeInTheDocument();
  });

  it("deve navegar ao clicar no botão de próximo período", () => {
    mockSearchParams.set("periodo", "2024-03");

    render(<FiltrosPeriodo />);

    const botaoProximo = screen.getByLabelText("Próximo período");
    fireEvent.click(botaoProximo);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("periodo=2024-04")
    );
  });

  it("deve navegar ao clicar no botão de período anterior", () => {
    mockSearchParams.set("periodo", "2024-03");

    render(<FiltrosPeriodo />);

    const botaoAnterior = screen.getByLabelText("Período anterior");
    fireEvent.click(botaoAnterior);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("periodo=2024-02")
    );
  });

  it("deve preservar outros parâmetros ao mudar período", () => {
    mockSearchParams.set("periodo", "2024-03");
    mockSearchParams.set("diaInicio", "15");
    mockSearchParams.set("tags", "1,2");

    render(<FiltrosPeriodo />);

    const botaoProximo = screen.getByLabelText("Próximo período");
    fireEvent.click(botaoProximo);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("diaInicio=15")
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("tags=1%2C2")
    );
  });

  it("deve usar dia de início 1 como padrão", () => {
    mockSearchParams.set("periodo", "2024-01");

    render(<FiltrosPeriodo />);

    // Com dia início 1, deve mostrar "1 de jan."
    expect(screen.getByText(/1 de/)).toBeInTheDocument();
  });

  it("deve calcular período corretamente com dia de início diferente", () => {
    mockSearchParams.set("periodo", "2024-02");
    mockSearchParams.set("diaInicio", "10");

    render(<FiltrosPeriodo />);

    // Dia 10 de fev até 9 de mar
    expect(screen.getByText(/10 de/)).toBeInTheDocument();
  });
});
