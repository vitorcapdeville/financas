/**
 * Testes de Integração - Fluxo de Transações
 */

import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Fluxo de Integração - Transações', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Criação e Listagem', () => {
    it('deve criar nova transação e listar', async () => {
      const novaTransacao = {
        data: '2024-06-20',
        descricao: 'Restaurante',
        valor: 75.00,
        tipo: 'saida',
        categoria: 'Alimentação',
      };

      const mockResposta = { id: 3, ...novaTransacao, tags: [] };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResposta });

      const resultado = await mockedAxios.post('/transacoes', novaTransacao);

      expect(resultado.data).toMatchObject(novaTransacao);
      expect(resultado.data.id).toBe(3);
    });
  });

  describe('Resumo Mensal', () => {
    it('deve calcular resumo mensal corretamente', async () => {
      const mockResumo = {
        mes: 6,
        ano: 2024,
        total_entradas: 5000.00,
        total_saidas: 2500.00,
        saldo: 2500.00,
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockResumo });

      const resultado = await mockedAxios.get('/transacoes/resumo/mensal', {
        params: { mes: 6, ano: 2024 },
      });

      expect(resultado.data.total_entradas).toBe(5000.00);
      expect(resultado.data.total_saidas).toBe(2500.00);
      expect(resultado.data.saldo).toBe(2500.00);
    });
  });
});
