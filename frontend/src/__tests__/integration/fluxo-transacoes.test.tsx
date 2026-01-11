/**
 * Testes de Integração - Fluxo de Transações
 */

import { transacoesService } from "@/services/api.service";

// Mock do fetch global
global.fetch = jest.fn();

describe("Fluxo de Integração - Transações", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Criação e Listagem", () => {
    it("deve criar nova transação e listar", async () => {
      const novaTransacao = {
        data: "2024-06-20",
        descricao: "Restaurante",
        valor: 75.0,
        tipo: "saida",
        categoria: "Alimentação",
        origem: "MANUAL",
      };

      const mockResposta = { id: 3, ...novaTransacao, tags: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResposta,
      });

      const resultado = await transacoesService.criar(novaTransacao);

      expect(resultado).toMatchObject(novaTransacao);
      expect(resultado.id).toBe(3);
    });
  });

  describe("Resumo Mensal", () => {
    it("deve calcular resumo mensal corretamente", async () => {
      const mockResumo = {
        mes: 6,
        ano: 2024,
        total_entradas: 5000.0,
        total_saidas: 2500.0,
        saldo: 2500.0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResumo,
      });

      const resultado = await transacoesService.resumoMensal(6, 2024);

      expect(resultado.total_entradas).toBe(5000.0);
      expect(resultado.total_saidas).toBe(2500.0);
      expect(resultado.saldo).toBe(2500.0);
    });
  });
});
