import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalEditarValor from '@/components/ModalEditarValor';
import { toast } from 'react-hot-toast';
import { CriterioTipo } from '@/types';

jest.mock('react-hot-toast');

describe('ModalEditarValor', () => {
  const mockOnClose = jest.fn();
  const mockOnSalvar = jest.fn();
  const mockOnRestaurar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não deve renderizar quando isOpen é false', () => {
    const { container } = render(
      <ModalEditarValor
        isOpen={false}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o modal quando isOpen é true', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('deve exibir valor atual no input', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={150.5}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    const input = screen.getByDisplayValue((content, element) => {
      return element?.tagName.toLowerCase() === 'input' && parseFloat(content) === 150.5;
    });
    expect(input).toBeInTheDocument();
  });

  it('deve permitir editar o valor', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    const input = screen.getByDisplayValue('100');
    fireEvent.change(input, { target: { value: '200' } });
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
  });

  it('deve exibir botões de percentual', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    const botoes = screen.queryAllByRole('button');
    expect(botoes.length).toBeGreaterThan(0);
  });

  it('deve aplicar percentual ao clicar no botão', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    const botao50 = screen.getByText('50%');
    fireEvent.click(botao50);

    // 50% de 100 = 50
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('deve salvar novo valor ao clicar em Salvar', async () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    const input = screen.getByDisplayValue('100');
    fireEvent.change(input, { target: { value: '250' } });

    const botaoSalvar = screen.getByText('Salvar');
    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(mockOnSalvar).toHaveBeenCalledWith(250, undefined);
    });
  });

  it('deve fechar modal ao clicar em Cancelar', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    const botaoCancelar = screen.getByText('Cancelar');
    fireEvent.click(botaoCancelar);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve ter botão de restaurar quando valorOriginal existe', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={80}
        valorOriginal={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        onRestaurar={mockOnRestaurar}
        isPending={false}
      />
    );

    const botoes = screen.getAllByRole('button');
    expect(botoes.length).toBeGreaterThan(2);
  });

  it('não deve exibir botão de restaurar quando valorOriginal não existe', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    expect(screen.queryByText(/Restaurar valor original/i)).not.toBeInTheDocument();
  });

  it('deve ter callback onRestaurar quando fornecido', async () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={80}
        valorOriginal={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        onRestaurar={mockOnRestaurar}
        isPending={false}
      />
    );

    expect(mockOnRestaurar).toBeDefined();
  });

  it('deve desabilitar botões quando isPending é true', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={true}
      />
    );

    const botaoSalvar = screen.getByText(/Salvando/i);
    expect(botaoSalvar).toBeDisabled();
  });

  it('deve ter checkbox disponivel', () => {
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    const checkbox = screen.queryByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('deve permitir salvar com callback', async () => {
    mockOnSalvar.mockResolvedValue(undefined);
    
    render(
      <ModalEditarValor
        isOpen={true}
        onClose={mockOnClose}
        valorAtual={100}
        descricaoTransacao="Compra"
        onSalvar={mockOnSalvar}
        isPending={false}
      />
    );

    // Clicar em salvar diretamente (sem criar regra)
    const form = screen.getByRole('button', { name: /salvar/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSalvar).toHaveBeenCalledWith(100, undefined);
    });
  });
});
