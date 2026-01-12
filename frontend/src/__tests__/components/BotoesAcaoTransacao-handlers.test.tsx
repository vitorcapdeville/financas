import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import BotoesAcaoTransacao from "@/components/BotoesAcaoTransacao";

// Mock Next.js navigation
const mockPush = jest.fn();
const mockSearchParams = {
  toString: jest.fn(() => "periodo=2024-01&diaInicio=1"),
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("BotoesAcaoTransacao - Navegação", () => {
  const mockTransacao = {
    id: 1,
    descricao: "Compra Mercado",
    valor: 150.0,
    data: "2024-01-15",
    tipo: "saida" as const,
    categoria: "Alimentação",
    tags: [],
  };

  const mockTodasTags = [
    { id: 1, nome: "Tag 1", cor: "#000000" },
    { id: 2, nome: "Tag 2", cor: "#111111" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar os três botões de ação", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    expect(screen.getByText("Editar Categoria")).toBeInTheDocument();
    expect(screen.getByText("Editar Valor")).toBeInTheDocument();
    expect(screen.getByText("Gerenciar Tags")).toBeInTheDocument();
  });

  it("deve navegar para página de edição de categoria", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    fireEvent.click(screen.getByText("Editar Categoria"));

    expect(mockPush).toHaveBeenCalledWith(
      "/transacao/1/categoria?periodo=2024-01&diaInicio=1"
    );
  });

  it("deve navegar para página de edição de valor", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    fireEvent.click(screen.getByText("Editar Valor"));

    expect(mockPush).toHaveBeenCalledWith(
      "/transacao/1/valor?periodo=2024-01&diaInicio=1"
    );
  });

  it("deve navegar para página de gerenciamento de tags", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    fireEvent.click(screen.getByText("Gerenciar Tags"));

    expect(mockPush).toHaveBeenCalledWith(
      "/transacao/1/tags?periodo=2024-01&diaInicio=1"
    );
  });

  it("deve preservar query strings ao navegar", () => {
    mockSearchParams.toString.mockReturnValue(
      "periodo=2024-06&diaInicio=15&criterio=data_transacao"
    );

    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    fireEvent.click(screen.getByText("Editar Categoria"));

    expect(mockPush).toHaveBeenCalledWith(
      "/transacao/1/categoria?periodo=2024-06&diaInicio=15&criterio=data_transacao"
    );
  });
});
