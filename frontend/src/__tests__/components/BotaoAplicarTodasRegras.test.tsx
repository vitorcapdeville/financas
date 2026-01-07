import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { BotaoAplicarTodasRegras } from '@/components/BotaoAplicarTodasRegras';
import { aplicarTodasRegrasAction } from '@/app/regras/actions';

jest.mock('react-hot-toast');
jest.mock('@/app/regras/actions', () => ({
  aplicarTodasRegrasAction: jest.fn(),
}));

const mockAplicarTodasRegrasAction = aplicarTodasRegrasAction as jest.MockedFunction<typeof aplicarTodasRegrasAction>;

describe('BotaoAplicarTodasRegras', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAplicarTodasRegrasAction.mockResolvedValue({ total_aplicacoes: 10 } as any);
  });

  it('deve renderizar botão de aplicar regras', () => {
    render(<BotaoAplicarTodasRegras />);

    expect(screen.getByText('🔄 Aplicar Todas as Regras')).toBeInTheDocument();
  });

  it('não deve mostrar modal inicialmente', () => {
    render(<BotaoAplicarTodasRegras />);

    expect(screen.queryByText('Aplicar Todas as Regras')).not.toBeInTheDocument();
  });

  it('deve abrir modal ao clicar no botão', () => {
    render(<BotaoAplicarTodasRegras />);

    const botao = screen.getByText('🔄 Aplicar Todas as Regras');
    fireEvent.click(botao);

    expect(screen.getByText('Aplicar Todas as Regras')).toBeInTheDocument();
  });

  it('deve exibir mensagem de confirmação no modal', () => {
    render(<BotaoAplicarTodasRegras />);

    fireEvent.click(screen.getByText('🔄 Aplicar Todas as Regras'));

    expect(screen.getByText(/TODAS as regras ativas/i)).toBeInTheDocument();
    expect(screen.getByText(/TODAS as transações existentes/i)).toBeInTheDocument();
  });

  it('deve chamar aplicarTodasRegrasAction ao confirmar', async () => {
    render(<BotaoAplicarTodasRegras />);

    fireEvent.click(screen.getByText('🔄 Aplicar Todas as Regras'));
    
    const botaoConfirmar = screen.getByText('Aplicar Todas');
    fireEvent.click(botaoConfirmar);

    await waitFor(() => {
      expect(mockAplicarTodasRegrasAction).toHaveBeenCalled();
    });
  });

  it('deve exibir toast de sucesso com número de aplicações', async () => {
    mockAplicarTodasRegrasAction.mockResolvedValue({ total_aplicacoes: 25 } as any);

    render(<BotaoAplicarTodasRegras />);

    fireEvent.click(screen.getByText('🔄 Aplicar Todas as Regras'));
    fireEvent.click(screen.getByText('Aplicar Todas'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('25 aplicações realizadas')
      );
    });
  });

  it('deve fechar modal após aplicação bem-sucedida', async () => {
    render(<BotaoAplicarTodasRegras />);

    fireEvent.click(screen.getByText('🔄 Aplicar Todas as Regras'));
    fireEvent.click(screen.getByText('Aplicar Todas'));

    await waitFor(() => {
      expect(screen.queryByText('Aplicar Todas as Regras')).not.toBeInTheDocument();
    });
  });

  it('deve exibir toast de erro quando falha', async () => {
    mockAplicarTodasRegrasAction.mockRejectedValue(new Error('Erro ao aplicar'));

    render(<BotaoAplicarTodasRegras />);

    fireEvent.click(screen.getByText('🔄 Aplicar Todas as Regras'));
    fireEvent.click(screen.getByText('Aplicar Todas'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Erro ao aplicar regras'));
    });
  });

  it('deve fechar modal ao cancelar', () => {
    render(<BotaoAplicarTodasRegras />);

    fireEvent.click(screen.getByText('🔄 Aplicar Todas as Regras'));
    expect(screen.getByText(/TODAS as regras ativas/i)).toBeInTheDocument();

    const botaoCancelar = screen.getByText('Cancelar');
    fireEvent.click(botaoCancelar);

    expect(screen.queryByText(/TODAS as regras ativas/i)).not.toBeInTheDocument();
  });

  it('deve ter botão principal com estilo azul', () => {
    render(<BotaoAplicarTodasRegras />);

    const botao = screen.getByText('🔄 Aplicar Todas as Regras');
    expect(botao).toHaveClass('bg-blue-600');
  });
});
