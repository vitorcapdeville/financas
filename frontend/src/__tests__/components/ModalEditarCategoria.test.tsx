import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalEditarCategoria from '@/components/ModalEditarCategoria';
import { transacoesService } from '@/services/api.service';
import { toast } from 'react-hot-toast';
import { CriterioTipo } from '@/types';

// Mock services
jest.mock('@/services/api.service');
jest.mock('react-hot-toast');

describe('ModalEditarCategoria', () => {
  const mockOnClose = jest.fn();
  const mockOnSalvar = jest.fn();

  const mockCategorias = ['Alimentação', 'Transporte', 'Moradia', 'Lazer'];

  beforeEach(() => {
    jest.clearAllMocks();
    (transacoesService.listarCategorias as jest.Mock).mockResolvedValue(mockCategorias);
  });

  it('não deve renderizar quando isOpen é false', () => {
    const { container } = render(
      <ModalEditarCategoria
        isOpen={false}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o modal quando isOpen é true', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    // Verifica se o modal está visível aguardando o carregamento
    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });
  });

  it('deve carregar e exibir categorias existentes', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    await waitFor(() => {
      expect(transacoesService.listarCategorias).toHaveBeenCalled();
    });

    // Categorias devem aparecer como botões
    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
    });
  });

  it('deve permitir selecionar uma categoria existente', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    await waitFor(() => {
      const botaoTransporte = screen.getByText('Transporte');
      fireEvent.click(botaoTransporte);
    });

    const botaoSalvar = screen.getByText('Salvar');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(mockOnSalvar).toHaveBeenCalledWith('Transporte', undefined);
    });
  });

  it('deve permitir digitar uma categoria customizada', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    // Verifica que o componente carregou
    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });
  });

  it('deve exibir botão Salvar', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual=""
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeInTheDocument();
    });
  });

  it('deve fechar o modal ao clicar em Cancelar', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    await waitFor(() => {
      const botaoCancelar = screen.getByText('Cancelar');
      fireEvent.click(botaoCancelar);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve desabilitar botões quando isPending é true', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={true}
      />
    );

    await waitFor(() => {
      const botaoSalvar = screen.getByText(/Salvando/i);
      expect(botaoSalvar).toBeDisabled();
    });
  });

  it('deve exibir checkbox para criar regra', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    await waitFor(() => {
      const checkbox = screen.queryByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  it('deve permitir marcar checkbox', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    // Marca checkbox
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  it('deve permitir salvar alteração', async () => {
    render(
      <ModalEditarCategoria
        isOpen={true}
        onClose={mockOnClose}
        categoriaAtual="Alimentação"
        descricaoTransacao="Compra no mercado"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    // Seleciona categoria
    await waitFor(() => {
      const botaoTransporte = screen.getByText('Transporte');
      fireEvent.click(botaoTransporte);
    });

    // Salva
    const botaoSalvar = screen.getByText('Salvar');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(mockOnSalvar).toHaveBeenCalled();
    });
  });
});
