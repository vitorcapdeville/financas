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

describe("BotoesAcaoTransacao", () => {
  const mockTransacao = {
    id: 1,
    data: "2024-01-15",
    descricao: "Compra no supermercado",
    valor: 150.0,
    tipo: "saida" as const,
    categoria: "Alimentação",
    origem: "manual",
    tags: [
      { id: 1, nome: "Essencial", cor: "#3B82F6" },
      { id: 2, nome: "Recorrente", cor: "#10B981" },
    ],
  };

  const mockTodasTags = [
    { id: 1, nome: "Essencial", cor: "#3B82F6", descricao: "Tag essencial" },
    { id: 2, nome: "Recorrente", cor: "#10B981", descricao: "Tag recorrente" },
    { id: 3, nome: "Variável", cor: "#F59E0B", descricao: "Tag variável" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar botão de editar categoria", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    expect(screen.getByText("Editar Categoria")).toBeInTheDocument();
  });

  it("deve renderizar botão de editar categoria", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    expect(screen.getByText("Editar Categoria")).toBeInTheDocument();
  });

  it("deve renderizar botão de editar valor", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    expect(screen.getByText("Editar Valor")).toBeInTheDocument();
  });

  it("deve renderizar botão de gerenciar tags", () => {
    render(
      <BotoesAcaoTransacao
        transacao={mockTransacao}
        todasTags={mockTodasTags}
      />
    );

    expect(screen.getByText("Gerenciar Tags")).toBeInTheDocument();
  });

  it("deve navegar para edição de categoria ao clicar", () => {
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

  it("deve navegar para edição de valor ao clicar", () => {
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

  it("deve navegar para gerenciamento de tags ao clicar", () => {
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
});
