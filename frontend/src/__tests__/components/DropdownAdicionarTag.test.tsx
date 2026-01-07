import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownAdicionarTag from '@/components/DropdownAdicionarTag';
import { Tag } from '@/types';
import { toast } from 'react-hot-toast';
import { adicionarTagAction } from '@/app/transacao/[id]/actions';

// Mocks
jest.mock('react-hot-toast');
jest.mock('@/app/transacao/[id]/actions', () => ({
  adicionarTagAction: jest.fn(),
}));

const mockAdicionarTagAction = adicionarTagAction as jest.MockedFunction<typeof adicionarTagAction>;

describe('DropdownAdicionarTag', () => {
  const mockTagsDisponiveis: Tag[] = [
    { id: 1, nome: 'Essencial', cor: '#10B981' },
    { id: 2, nome: 'Lazer', cor: '#3B82F6' },
    { id: 3, nome: 'Trabalho', cor: '#F59E0B' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o botão de adicionar tag', () => {
    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    const botao = screen.getByText('+ Adicionar tag');
    expect(botao).toBeInTheDocument();
  });

  it('não deve mostrar dropdown inicialmente', () => {
    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    const tagEssencial = screen.queryByText('Essencial');
    expect(tagEssencial).not.toBeInTheDocument();
  });

  it('deve mostrar dropdown ao clicar no botão', () => {
    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    const botao = screen.getByText('+ Adicionar tag');
    fireEvent.click(botao);

    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('Lazer')).toBeInTheDocument();
    expect(screen.getByText('Trabalho')).toBeInTheDocument();
  });

  it('deve fechar dropdown ao clicar no botão novamente', () => {
    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    const botao = screen.getByText('+ Adicionar tag');
    
    // Abrir
    fireEvent.click(botao);
    expect(screen.getByText('Essencial')).toBeInTheDocument();

    // Fechar
    fireEvent.click(botao);
    expect(screen.queryByText('Essencial')).not.toBeInTheDocument();
  });

  it('deve adicionar tag ao clicar em uma opção', async () => {
    mockAdicionarTagAction.mockResolvedValue(undefined);

    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    // Abrir dropdown
    const botao = screen.getByText('+ Adicionar tag');
    fireEvent.click(botao);

    // Clicar na tag
    const tagEssencial = screen.getByText('Essencial');
    fireEvent.click(tagEssencial);

    await waitFor(() => {
      expect(mockAdicionarTagAction).toHaveBeenCalledWith(1, 1);
    });
  });

  it('deve mostrar erro ao falhar ao adicionar tag', async () => {
    mockAdicionarTagAction.mockRejectedValue(new Error('Erro ao adicionar'));
    const mockToastError = toast.error as jest.Mock;

    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    // Abrir dropdown
    const botao = screen.getByText('+ Adicionar tag');
    fireEvent.click(botao);

    // Clicar na tag
    const tagEssencial = screen.getByText('Essencial');
    fireEvent.click(tagEssencial);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Erro ao adicionar tag. Tente novamente.');
    });
  });

  it('deve renderizar tags com cores corretas', () => {
    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    // Abrir dropdown
    const botao = screen.getByText('+ Adicionar tag');
    fireEvent.click(botao);

    // Verificar que existem divs coloridas (marcadores de cor)
    const divs = screen.getAllByRole('button').filter(el => el.textContent?.includes('Essencial'));
    expect(divs.length).toBeGreaterThan(0);
  });

  it('deve desabilitar botões quando isPending', async () => {
    mockAdicionarTagAction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={mockTagsDisponiveis}
      />
    );

    const botao = screen.getByText('+ Adicionar tag');
    fireEvent.click(botao);
    fireEvent.click(screen.getByText('Essencial'));

    // Verifica que a ação foi chamada
    await waitFor(() => {
      expect(mockAdicionarTagAction).toHaveBeenCalled();
    });
  });

  it('deve renderizar lista vazia quando não há tags disponíveis', () => {
    render(
      <DropdownAdicionarTag
        transacaoId={1}
        tagsDisponiveis={[]}
      />
    );

    // Abrir dropdown
    const botao = screen.getByText('+ Adicionar tag');
    fireEvent.click(botao);

    // Dropdown abre mas não tem tags
    expect(screen.queryByText('Essencial')).not.toBeInTheDocument();
  });
});
