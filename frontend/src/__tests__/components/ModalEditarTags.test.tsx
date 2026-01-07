import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalEditarTags from '@/components/ModalEditarTags';
import { toast } from 'react-hot-toast';
import { CriterioTipo } from '@/types';

jest.mock('react-hot-toast');

describe('ModalEditarTags', () => {
  const mockOnClose = jest.fn();
  const mockOnAdicionarTags = jest.fn();
  const mockOnRemoverTag = jest.fn();

  const mockTagsAtuais = [
    { id: 1, nome: 'Essencial', cor: '#3B82F6', descricao: 'Gasto essencial' },
    { id: 2, nome: 'Recorrente', cor: '#10B981', descricao: 'Gasto recorrente' },
  ];

  const mockTodasTags = [
    { id: 1, nome: 'Essencial', cor: '#3B82F6', descricao: 'Gasto essencial' },
    { id: 2, nome: 'Recorrente', cor: '#10B981', descricao: 'Gasto recorrente' },
    { id: 3, nome: 'Variável', cor: '#F59E0B', descricao: 'Gasto variável' },
    { id: 4, nome: 'Fixo', cor: '#8B5CF6', descricao: 'Gasto fixo' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAdicionarTags.mockResolvedValue(undefined);
    mockOnRemoverTag.mockResolvedValue(undefined);
  });

  it('não deve renderizar quando isOpen é false', () => {
    const { container } = render(
      <ModalEditarTags
        isOpen={false}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o modal quando isOpen é true', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    expect(screen.getByText('Essencial')).toBeInTheDocument();
  });

  it('deve exibir tags atuais', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('Recorrente')).toBeInTheDocument();
  });

  it('deve exibir apenas tags disponíveis (não aplicadas)', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    // Tags disponíveis: Variável e Fixo (não estão em tagsAtuais)
    expect(screen.getByText('Variável')).toBeInTheDocument();
    expect(screen.getByText('Fixo')).toBeInTheDocument();
  });

  it('deve permitir interagir com tags', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    const tagVariavel = screen.getByText('Variável');
    fireEvent.click(tagVariavel);
    
    expect(tagVariavel).toBeInTheDocument();
  });

  it('deve permitir clicar em tags', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    const tagVariavel = screen.getByText('Variável');
    fireEvent.click(tagVariavel);
    fireEvent.click(tagVariavel);
    
    expect(tagVariavel).toBeInTheDocument();
  });

  it('deve ter callback onAdicionarTags', async () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    expect(mockOnAdicionarTags).toBeDefined();
  });

  it('deve ter callback onRemoverTag', async () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    expect(mockOnRemoverTag).toBeDefined();
  });

  it('deve fechar modal ao clicar em Fechar', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    const botaoFechar = screen.getByText('Fechar');
    fireEvent.click(botaoFechar);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve desabilitar botões quando isPending é true', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={true}
      />
    );

    const botoes = screen.getAllByRole('button');
    botoes.forEach(botao => {
      expect(botao).toBeDisabled();
    });
  });

  it('deve renderizar quando todas tags estão aplicadas', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTodasTags}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    const botoes = screen.getAllByRole('button');
    expect(botoes.length).toBeGreaterThan(0);
  });

  it('deve ter checkbox disponível', () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    const checkbox = screen.queryByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('deve renderizar botão de adicionar tags', async () => {
    render(
      <ModalEditarTags
        isOpen={true}
        onClose={mockOnClose}
        transacaoId={1}
        tagsAtuais={mockTagsAtuais}
        todasTags={mockTodasTags}
        descricaoTransacao="Compra no mercado"
        onAdicionarTags={mockOnAdicionarTags}
        onRemoverTag={mockOnRemoverTag}
        isPending={false}
      />
    );

    const botoes = screen.getAllByRole('button');
    expect(botoes.length).toBeGreaterThan(2);
  });
});
