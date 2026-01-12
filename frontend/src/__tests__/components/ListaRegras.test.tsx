import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import { ListaRegras } from "@/components/ListaRegras";
import { Regra, CriterioTipo, TipoAcao } from "@/types";
import {
  deletarRegraAction,
  toggleAtivoAction,
  aplicarRegraRetroativamenteAction,
  atualizarPrioridadeAction,
} from "@/app/regras/actions";

jest.mock("react-hot-toast");
jest.mock("@/app/regras/actions", () => ({
  deletarRegraAction: jest.fn(),
  toggleAtivoAction: jest.fn(),
  aplicarRegraRetroativamenteAction: jest.fn(),
  atualizarPrioridadeAction: jest.fn(),
}));

const mockDeletarRegraAction = deletarRegraAction as jest.MockedFunction<
  typeof deletarRegraAction
>;
const mockToggleAtivoAction = toggleAtivoAction as jest.MockedFunction<
  typeof toggleAtivoAction
>;
const mockAplicarRegraAction =
  aplicarRegraRetroativamenteAction as jest.MockedFunction<
    typeof aplicarRegraRetroativamenteAction
  >;
const mockAtualizarPrioridadeAction =
  atualizarPrioridadeAction as jest.MockedFunction<
    typeof atualizarPrioridadeAction
  >;

describe("ListaRegras", () => {
  const mockRegras: Regra[] = [
    {
      id: 1,
      nome: "Regra de Teste",
      tipo_acao: TipoAcao.ALTERAR_CATEGORIA,
      criterio_tipo: CriterioTipo.DESCRICAO_CONTEM,
      criterio_valor: "mercado",
      acao_valor: "Alimentação",
      prioridade: 1,
      ativo: true,
      criado_em: "2024-01-01",
      atualizado_em: "2024-01-01",
    },
    {
      id: 2,
      nome: "Regra Inativa",
      tipo_acao: TipoAcao.ADICIONAR_TAGS,
      criterio_tipo: CriterioTipo.CATEGORIA,
      criterio_valor: "Lazer",
      acao_valor: "[1,2]",
      prioridade: 2,
      ativo: false,
      criado_em: "2024-01-02",
      atualizado_em: "2024-01-02",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockToggleAtivoAction.mockResolvedValue(undefined);
    mockDeletarRegraAction.mockResolvedValue(undefined);
    mockAplicarRegraAction.mockResolvedValue({
      total_processado: 50,
      total_modificado: 10,
    } as any);
    mockAtualizarPrioridadeAction.mockResolvedValue(undefined);
  });

  it("deve renderizar lista de regras", () => {
    render(<ListaRegras regras={mockRegras} />);
    expect(screen.getByText("Regra de Teste")).toBeInTheDocument();
    expect(screen.getByText("Regra Inativa")).toBeInTheDocument();
  });

  it("deve renderizar lista vazia quando não há regras", () => {
    const { container } = render(<ListaRegras regras={[]} />);
    expect(container.querySelector(".space-y-4")).toBeInTheDocument();
  });

  it("deve mostrar border verde para regra ativa", () => {
    const { container } = render(<ListaRegras regras={[mockRegras[0]]} />);
    const card = container.querySelector(".border-green-500");
    expect(card).toBeInTheDocument();
  });

  it("deve mostrar border cinza para regra inativa", () => {
    const { container } = render(<ListaRegras regras={[mockRegras[1]]} />);
    const card = container.querySelector(".border-gray-300");
    expect(card).toBeInTheDocument();
  });

  it("deve formatar critério de descrição contém corretamente", () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);
    expect(screen.getByText(/Descrição contém "mercado"/i)).toBeInTheDocument();
  });

  it("deve formatar critério de categoria corretamente", () => {
    render(<ListaRegras regras={[mockRegras[1]]} />);
    expect(screen.getByText(/Categoria = "Lazer"/i)).toBeInTheDocument();
  });

  it("deve formatar ação de alterar categoria corretamente", () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);
    expect(screen.getByText(/→ Categoria: "Alimentação"/i)).toBeInTheDocument();
  });

  it("deve formatar ação de adicionar tags corretamente", () => {
    render(<ListaRegras regras={[mockRegras[1]]} />);
    expect(screen.getByText(/→ Adicionar 2 tag\(s\)/i)).toBeInTheDocument();
  });

  it("deve renderizar badge de ativo/inativo", () => {
    render(<ListaRegras regras={mockRegras} />);
    expect(screen.getByText("✓ Ativa")).toBeInTheDocument();
    expect(screen.getByText("○ Inativa")).toBeInTheDocument();
  });

  it("deve chamar toggleAtivoAction ao clicar em ativar/desativar", async () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    const botaoToggle = screen.getByText("Desativar");
    fireEvent.click(botaoToggle);

    await waitFor(() => {
      expect(mockToggleAtivoAction).toHaveBeenCalledWith(1);
    });
  });

  it("deve abrir modal ao clicar em deletar", () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    const botaoDeletar = screen.getByText("Deletar");
    fireEvent.click(botaoDeletar);

    expect(screen.getByText("Deletar Regra")).toBeInTheDocument();
  });

  it("deve chamar deletarRegraAction ao confirmar deleção", async () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    // Abre modal
    const botaoDeletar = screen.getByRole("button", { name: /Deletar/i });
    fireEvent.click(botaoDeletar);

    // Aguarda modal aparecer e confirma
    await waitFor(() => {
      expect(screen.getByText("Deletar Regra")).toBeInTheDocument();
    });

    const botoes = screen.getAllByRole("button", { name: /Deletar/i });
    fireEvent.click(botoes[botoes.length - 1]); // Último botão (é o do modal)

    await waitFor(() => {
      expect(mockDeletarRegraAction).toHaveBeenCalledWith(1);
    });
  });

  it("deve abrir modal ao clicar em aplicar", () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    const botaoAplicar = screen.getByText("Aplicar Agora");
    fireEvent.click(botaoAplicar);

    expect(screen.getByText("Aplicar Regra")).toBeInTheDocument();
  });

  it("deve chamar aplicarRegraRetroativamenteAction ao confirmar aplicação", async () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    fireEvent.click(screen.getByText("Aplicar Agora"));
    const botoesAplicar = screen.getAllByText("Aplicar");
    fireEvent.click(botoesAplicar[botoesAplicar.length - 1]); // Botão do modal

    await waitFor(() => {
      expect(mockAplicarRegraAction).toHaveBeenCalledWith(1);
    });
  });

  it("deve exibir toast de sucesso após aplicar regra", async () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    fireEvent.click(screen.getByText("Aplicar Agora"));
    const botoesAplicar = screen.getAllByText("Aplicar");
    fireEvent.click(botoesAplicar[botoesAplicar.length - 1]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("10 de 50 transações modificadas")
      );
    });
  });

  it("deve exibir toast de erro quando falha ao aplicar", async () => {
    mockAplicarRegraAction.mockRejectedValue(new Error("Erro ao aplicar"));

    render(<ListaRegras regras={[mockRegras[0]]} />);

    fireEvent.click(screen.getByText("Aplicar Agora"));
    const botoesAplicar = screen.getAllByText("Aplicar");
    fireEvent.click(botoesAplicar[botoesAplicar.length - 1]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("deve permitir editar prioridade ao clicar no botão", () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    const botaoEditarPrioridade = screen.getByText("Editar");
    fireEvent.click(botaoEditarPrioridade);

    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
  });

  it("deve salvar nova prioridade", async () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    fireEvent.click(screen.getByText("Editar"));

    const input = screen.getByDisplayValue("1");
    fireEvent.change(input, { target: { value: "5" } });

    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(mockAtualizarPrioridadeAction).toHaveBeenCalledWith(1, 5);
    });
  });

  it("deve exibir erro ao tentar salvar prioridade inválida", async () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    fireEvent.click(screen.getByText("Editar"));

    const input = screen.getByDisplayValue("1");
    fireEvent.change(input, { target: { value: "0" } });

    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Prioridade deve ser um número maior ou igual a 1"
      );
    });
  });

  it("deve cancelar edição de prioridade", () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    fireEvent.click(screen.getByText("Editar"));
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByDisplayValue("1")).not.toBeInTheDocument();
  });

  it("deve exibir prioridade corretamente", () => {
    const { container } = render(<ListaRegras regras={mockRegras} />);

    const prioridadeTexts = screen.getAllByText("Prioridade:");
    expect(prioridadeTexts.length).toBe(2); // 2 regras

    // Verifica que há elementos com os números das prioridades
    const prioridades = container.querySelectorAll(
      ".font-semibold.text-gray-900"
    );
    expect(prioridades.length).toBeGreaterThan(0);
  });

  it("deve renderizar botões de ação corretamente", () => {
    render(<ListaRegras regras={[mockRegras[0]]} />);

    expect(screen.getByText("Desativar")).toBeInTheDocument();
    expect(screen.getByText("Aplicar Agora")).toBeInTheDocument();
    expect(screen.getByText("Deletar")).toBeInTheDocument();
  });

  it("deve formatar ação de alterar valor corretamente", () => {
    const regraValor: Regra = {
      ...mockRegras[0],
      tipo_acao: TipoAcao.ALTERAR_VALOR,
      acao_valor: "10.50",
    };

    render(<ListaRegras regras={[regraValor]} />);
    expect(
      screen.getByText(/→ Reduzir 10.50% do valor original/i)
    ).toBeInTheDocument();
  });
});
