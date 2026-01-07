import { render, screen, fireEvent } from '@testing-library/react';
import { ModalConfirmacao } from '@/components/ModalConfirmacao';

describe('ModalConfirmacao Component', () => {
  const mockOnConfirmar = jest.fn();
  const mockOnCancelar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar com título e mensagem', () => {
    render(
      <ModalConfirmacao
        titulo="Deletar Item"
        mensagem="Tem certeza?"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
      />
    );

    expect(screen.getByText('Deletar Item')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
  });

  it('deve renderizar botões com textos padrão', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
      />
    );

    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve renderizar botões com textos customizados', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
        textoBotaoConfirmar="Deletar"
        textoBotaoCancelar="Voltar"
      />
    );

    expect(screen.getByText('Deletar')).toBeInTheDocument();
    expect(screen.getByText('Voltar')).toBeInTheDocument();
  });

  it('deve chamar onConfirmar quando botão confirmar é clicado', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
      />
    );

    fireEvent.click(screen.getByText('Confirmar'));
    expect(mockOnConfirmar).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onCancelar quando botão cancelar é clicado', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
      />
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnCancelar).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onCancelar quando clica no overlay', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
      />
    );

    const overlay = screen.getByText('Título').closest('.fixed');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnCancelar).toHaveBeenCalledTimes(1);
    }
  });

  it('deve desabilitar botões quando isPending é true', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
        isPending={true}
      />
    );

    const botaoConfirmar = screen.getByText('Processando...');
    const botaoCancelar = screen.getByText('Cancelar');

    expect(botaoConfirmar).toBeDisabled();
    expect(botaoCancelar).toBeDisabled();
  });

  it('não deve chamar onCancelar ao clicar no overlay quando isPending', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
        isPending={true}
      />
    );

    const overlay = screen.getByText('Título').closest('.fixed');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnCancelar).not.toHaveBeenCalled();
    }
  });

  it('deve aplicar estilos de danger quando tipo é danger', () => {
    render(
      <ModalConfirmacao
        titulo="Deletar"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
        tipo="danger"
      />
    );

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('deve aplicar estilos de warning quando tipo é warning', () => {
    render(
      <ModalConfirmacao
        titulo="Atenção"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
        tipo="warning"
      />
    );

    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('deve aplicar estilos de info quando tipo é info', () => {
    render(
      <ModalConfirmacao
        titulo="Informação"
        mensagem="Mensagem"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
        tipo="info"
      />
    );

    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('deve renderizar mensagem com quebras de linha', () => {
    render(
      <ModalConfirmacao
        titulo="Título"
        mensagem="Linha 1\nLinha 2\nLinha 3"
        onConfirmar={mockOnConfirmar}
        onCancelar={mockOnCancelar}
      />
    );

    expect(screen.getByText(/Linha 1/)).toBeInTheDocument();
  });
});
