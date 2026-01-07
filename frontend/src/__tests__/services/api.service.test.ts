import { transacoesService, tagsService, configuracoesService } from '@/services/api.service';
import { TipoTransacao } from '@/types';
import api from '@/lib/api';

jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transacoesService', () => {
    describe('listar', () => {
      it('deve listar transações com parâmetros', async () => {
        const mockTransacoes = [
          { id: 1, descricao: 'Compra', valor: 100, tipo: 'saida' },
          { id: 2, descricao: 'Salário', valor: 5000, tipo: 'entrada' },
        ];

        mockedApi.get.mockResolvedValueOnce({ data: mockTransacoes });

        const result = await transacoesService.listar({
          mes: 6,
          ano: 2024,
          categoria: 'Alimentação',
        });

        expect(mockedApi.get).toHaveBeenCalledWith('/transacoes', {
          params: { mes: 6, ano: 2024, categoria: 'Alimentação' },
        });
        expect(result).toEqual(mockTransacoes);
      });

      it('deve listar transações sem parâmetros', async () => {
        mockedApi.get.mockResolvedValueOnce({ data: [] });

        await transacoesService.listar();

        expect(mockedApi.get).toHaveBeenCalledWith('/transacoes', { params: undefined });
      });
    });

    describe('obter', () => {
      it('deve obter transação por ID', async () => {
        const mockTransacao = { id: 1, descricao: 'Teste', valor: 100 };
        mockedApi.get.mockResolvedValueOnce({ data: mockTransacao });

        const result = await transacoesService.obter(1);

        expect(mockedApi.get).toHaveBeenCalledWith('/transacoes/1');
        expect(result).toEqual(mockTransacao);
      });
    });

    describe('criar', () => {
      it('deve criar transação', async () => {
        const novaTransacao = {
          data: '2024-06-15',
          descricao: 'Compra supermercado',
          valor: 150.50,
          tipo: TipoTransacao.SAIDA,
          categoria: 'Alimentação',
        };

        const mockResposta = { id: 1, ...novaTransacao };
        mockedApi.post.mockResolvedValueOnce({ data: mockResposta });

        const result = await transacoesService.criar(novaTransacao);

        expect(mockedApi.post).toHaveBeenCalledWith('/transacoes', novaTransacao);
        expect(result).toEqual(mockResposta);
      });
    });

    describe('atualizar', () => {
      it('deve atualizar transação', async () => {
        const atualizacao = { categoria: 'Transporte', valor: 200 };
        const mockResposta = { id: 1, ...atualizacao };

        mockedApi.patch.mockResolvedValueOnce({ data: mockResposta });

        const result = await transacoesService.atualizar(1, atualizacao);

        expect(mockedApi.patch).toHaveBeenCalledWith('/transacoes/1', atualizacao);
        expect(result).toEqual(mockResposta);
      });
    });
  });

  describe('tagsService', () => {
    describe('listar', () => {
      it('deve listar todas as tags', async () => {
        const mockTags = [
          { id: 1, nome: 'Essencial', cor: '#ff0000' },
          { id: 2, nome: 'Lazer', cor: '#00ff00' },
        ];

        mockedApi.get.mockResolvedValueOnce({ data: mockTags });

        const result = await tagsService.listar();

        expect(mockedApi.get).toHaveBeenCalledWith('/tags');
        expect(result).toEqual(mockTags);
      });
    });

    describe('criar', () => {
      it('deve criar tag', async () => {
        const novaTag = { nome: 'Assinaturas', cor: '#0000ff' };
        const mockResposta = { id: 1, ...novaTag };

        mockedApi.post.mockResolvedValueOnce({ data: mockResposta });

        const result = await tagsService.criar(novaTag);

        expect(mockedApi.post).toHaveBeenCalledWith('/tags', novaTag);
        expect(result).toEqual(mockResposta);
      });
    });
  });

  describe('configuracoesService', () => {
    describe('obter', () => {
      it('deve obter configuração por chave', async () => {
        const mockConfig = { chave: 'diaInicioPeriodo', valor: '15' };
        mockedApi.get.mockResolvedValueOnce({ data: mockConfig });

        const result = await configuracoesService.obter('diaInicioPeriodo');

        expect(mockedApi.get).toHaveBeenCalledWith('/configuracoes/diaInicioPeriodo');
        expect(result).toEqual(mockConfig);
      });
    });

    describe('salvar', () => {
      it('deve salvar configuração', async () => {
        const mockResposta = { chave: 'diaInicioPeriodo', valor: '25' };
        mockedApi.post.mockResolvedValueOnce({ data: mockResposta });

        const result = await configuracoesService.salvar('diaInicioPeriodo', '25');

        expect(mockedApi.post).toHaveBeenCalledWith('/configuracoes/', {
          chave: 'diaInicioPeriodo',
          valor: '25',
        });
        expect(result).toEqual(mockResposta);
      });
    });
  });
});
