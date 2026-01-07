import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BotoesAcaoTransacao from '@/components/BotoesAcaoTransacao';
import { toast } from 'react-hot-toast';
import { 
  atualizarCategoriaAction, 
  atualizarValorAction, 
  restaurarValorOriginalAction 
} from '@/app/transacao/[id]/actions';
import { criarRegraAction, aplicarRegraRetroativamenteAction } from '@/app/regras/actions';

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('react-hot-toast');
jest.mock('@/app/transacao/[id]/actions');
jest.mock('@/app/regras/actions');

// Mock do serviço de transações
jest.mock('@/services/api.service', () => ({
  transacoesService: {
    listarCategorias: jest.fn().mockResolvedValue(['Alimentação', 'Transporte', 'Lazer']),
  },
}));

// Mock dos modais
jest.mock('@/components/ModalEditarCategoria', () => {
  return function MockModalEditarCategoria({ isOpen, onSalvar, isPending }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal-categoria">
        <button onClick={() => onSalvar('Nova Categoria')}>Salvar Categoria</button>
        <button onClick={() => onSalvar('Com Regra', { 
          criterio: 'descricao_contem', 
          nomeRegra: 'Regra Teste',
          criterio_valor: 'teste' 
        })}>Salvar com Regra</button>
        {isPending && <span>Loading...</span>}
      </div>
    );
  };
});

jest.mock('@/components/ModalEditarValor', () => {
  return function MockModalEditarValor({ isOpen, onSalvar, onRestaurar, isPending }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal-valor">
        <button onClick={() => onSalvar(200)}>Salvar Valor</button>
        <button onClick={() => onSalvar(150, { 
          criterio: 'categoria', 
          nomeRegra: 'Regra Valor',
          percentual: 10,
          criterio_valor: 'Categoria' 
        })}>Salvar Valor com Regra</button>
        {onRestaurar && <button onClick={onRestaurar}>Restaurar</button>}
        {isPending && <span>Loading...</span>}
      </div>
    );
  };
});

jest.mock('@/components/ModalEditarTags', () => {
  return function MockModalEditarTags({ isOpen, onAdicionarTags, onRemoverTag, isPending }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal-tags">
        <button onClick={() => onAdicionarTags([1, 2])}>Adicionar Tags</button>
        <button onClick={() => onAdicionarTags([1], { 
          criterio: 'descricao_contem', 
          nomeRegra: 'Regra Tag',
          tags: [1],
          criterio_valor: 'mercado' 
        })}>Adicionar com Regra</button>
        <button onClick={() => onRemoverTag(1)}>Remover Tag</button>
        {isPending && <span>Loading...</span>}
      </div>
    );
  };
});

const mockAtualizarCategoria = atualizarCategoriaAction as jest.MockedFunction<typeof atualizarCategoriaAction>;
const mockAtualizarValor = atualizarValorAction as jest.MockedFunction<typeof atualizarValorAction>;
const mockRestaurarValor = restaurarValorOriginalAction as jest.MockedFunction<typeof restaurarValorOriginalAction>;
const mockCriarRegra = criarRegraAction as jest.MockedFunction<typeof criarRegraAction>;
const mockAplicarRegra = aplicarRegraRetroativamenteAction as jest.MockedFunction<typeof aplicarRegraRetroativamenteAction>;

describe('BotoesAcaoTransacao - Handlers', () => {
  const mockTransacao = {
    id: 1,
    data: '2024-01-15',
    descricao: 'Compra no supermercado',
    valor: 150.00,
    tipo: 'saida' as const,
    categoria: 'Alimentação',
    origem: 'manual',
    tags: [
      { id: 1, nome: 'Essencial', cor: '#3B82F6' },
    ],
    valor_original: 200.00,
  };

  const mockTodasTags = [
    { id: 1, nome: 'Essencial', cor: '#3B82F6', descricao: 'Tag essencial' },
    { id: 2, nome: 'Recorrente', cor: '#10B981', descricao: 'Tag recorrente' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockAtualizarCategoria.mockResolvedValue(undefined);
    mockAtualizarValor.mockResolvedValue(undefined);
    mockRestaurarValor.mockResolvedValue(undefined);
    mockCriarRegra.mockResolvedValue({ id: 1, nome: 'Regra' } as any);
    mockAplicarRegra.mockResolvedValue({ transacoes_modificadas: 5 } as any);
  });

  describe('Modal de Categoria', () => {
    it('deve atualizar categoria sem criar regra', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('✏️ Editar Categoria'));
      fireEvent.click(screen.getByText('Salvar Categoria'));

      await waitFor(() => {
        expect(mockAtualizarCategoria).toHaveBeenCalledWith(1, 'Nova Categoria');
        expect(toast.success).toHaveBeenCalledWith('Categoria atualizada!');
      });
    });

    it('deve criar regra ao salvar categoria', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('✏️ Editar Categoria'));
      fireEvent.click(screen.getByText('Salvar com Regra'));

      await waitFor(() => {
        expect(mockCriarRegra).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Categoria atualizada e regra criada!');
      });
    });

    it('deve mostrar modal de aplicar regra após criar', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('✏️ Editar Categoria'));
      fireEvent.click(screen.getByText('Salvar com Regra'));

      await waitFor(() => {
        expect(screen.getByText(/Aplicar Regra em Transações Existentes/i)).toBeInTheDocument();
      });
    });

    it('deve aplicar regra retroativamente quando confirmado', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('✏️ Editar Categoria'));
      fireEvent.click(screen.getByText('Salvar com Regra'));

      await waitFor(() => {
        expect(screen.getByText('Sim, Aplicar Agora')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Sim, Aplicar Agora'));

      await waitFor(() => {
        expect(mockAplicarRegra).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Modal de Valor', () => {
    it('deve atualizar valor sem criar regra', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('💰 Editar Valor'));
      fireEvent.click(screen.getByText('Salvar Valor'));

      await waitFor(() => {
        expect(mockAtualizarValor).toHaveBeenCalledWith(1, 200);
        expect(toast.success).toHaveBeenCalledWith('Valor atualizado!');
      });
    });

    it('deve criar regra ao salvar valor', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('💰 Editar Valor'));
      fireEvent.click(screen.getByText('Salvar Valor com Regra'));

      await waitFor(() => {
        expect(mockCriarRegra).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Valor atualizado e regra criada!');
      });
    });

    it('deve restaurar valor original', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('💰 Editar Valor'));
      fireEvent.click(screen.getByText('Restaurar'));

      await waitFor(() => {
        expect(mockRestaurarValor).toHaveBeenCalledWith(1);
        expect(toast.success).toHaveBeenCalledWith('Valor original restaurado!');
      });
    });

    it('não deve mostrar botão restaurar se não há valor original', () => {
      const transacaoSemOriginal = { ...mockTransacao, valor_original: undefined };
      render(<BotoesAcaoTransacao transacao={transacaoSemOriginal} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('💰 Editar Valor'));
      expect(screen.queryByText('Restaurar')).not.toBeInTheDocument();
    });
  });

  describe('Modal de Tags', () => {
    it('deve adicionar tags sem criar regra', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('🏷️ Gerenciar Tags'));
      fireEvent.click(screen.getByText('Adicionar Tags'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('2 tag(s) adicionada(s)!');
      });
    });

    it('deve criar regra ao adicionar tags', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('🏷️ Gerenciar Tags'));
      fireEvent.click(screen.getByText('Adicionar com Regra'));

      await waitFor(() => {
        expect(mockCriarRegra).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Tags adicionadas e regra criada!');
      });
    });

    it('deve remover tag', async () => {
      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('🏷️ Gerenciar Tags'));
      fireEvent.click(screen.getByText('Remover Tag'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Tag removida!');
      });
    });

    it('deve exibir erro ao falhar remoção de tag', async () => {
      const { removerTagAction } = require('@/app/transacao/[id]/actions');
      removerTagAction.mockRejectedValue(new Error('Erro'));

      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('🏷️ Gerenciar Tags'));
      fireEvent.click(screen.getByText('Remover Tag'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao remover tag');
      });
    });

    it('deve exibir erro ao falhar adição de tags', async () => {
      const { adicionarTagAction } = require('@/app/transacao/[id]/actions');
      adicionarTagAction.mockRejectedValue(new Error('Erro'));

      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('🏷️ Gerenciar Tags'));
      fireEvent.click(screen.getByText('Adicionar Tags'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao adicionar tags');
      });
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir erro ao falhar atualização de categoria', async () => {
      mockAtualizarCategoria.mockRejectedValue(new Error('Erro'));

      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('✏️ Editar Categoria'));
      fireEvent.click(screen.getByText('Salvar Categoria'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar categoria');
      });
    });

    it('deve exibir erro ao falhar atualização de valor', async () => {
      mockAtualizarValor.mockRejectedValue(new Error('Erro'));

      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('💰 Editar Valor'));
      fireEvent.click(screen.getByText('Salvar Valor'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar valor');
      });
    });

    it('deve exibir erro ao falhar restauração de valor', async () => {
      mockRestaurarValor.mockRejectedValue(new Error('Erro'));

      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      fireEvent.click(screen.getByText('💰 Editar Valor'));
      fireEvent.click(screen.getByText('Restaurar'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao restaurar valor original');
      });
    });

    it('deve exibir erro ao falhar aplicação retroativa de regra', async () => {
      mockAplicarRegra.mockRejectedValue(new Error('Erro'));

      render(<BotoesAcaoTransacao transacao={mockTransacao} todasTags={mockTodasTags} />);

      // Criar regra
      fireEvent.click(screen.getByText('✏️ Editar Categoria'));
      fireEvent.click(screen.getByText('Salvar com Regra'));

      await waitFor(() => {
        expect(screen.getByText('Sim, Aplicar Agora')).toBeInTheDocument();
      });

      // Tentar aplicar (vai falhar)
      fireEvent.click(screen.getByText('Sim, Aplicar Agora'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao aplicar regra');
      });
    });
  });
});
