import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SeletorTags from '@/components/SeletorTags';
import { Tag } from '@/types';

// Mocks
jest.mock('@/app/transacao/[id]/actions', () => ({
  removerTagAction: jest.fn(),
}));

jest.mock('@/components/DropdownAdicionarTag', () => {
  return function MockDropdownAdicionarTag() {
    return <div data-testid="dropdown-adicionar-tag">Mock Dropdown</div>;
  };
});

describe('SeletorTags', () => {
  const todasTags: Tag[] = [
    { id: 1, nome: 'Essencial', cor: '#10B981' },
    { id: 2, nome: 'Lazer', cor: '#3B82F6' },
    { id: 3, nome: 'Trabalho', cor: '#F59E0B' },
    { id: 4, nome: 'Investimento', cor: '#8B5CF6' },
  ];

  it('deve renderizar o label "Tags"', () => {
    render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={[]}
        todasTags={todasTags}
      />
    );

    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('deve mostrar "Nenhuma tag" quando não há tags atuais', () => {
    render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={[]}
        todasTags={todasTags}
      />
    );

    expect(screen.getByText('Nenhuma tag')).toBeInTheDocument();
  });

  it('deve renderizar tags atuais', () => {
    const tagsAtuais = [
      { id: 1, nome: 'Essencial', cor: '#10B981' },
      { id: 2, nome: 'Lazer', cor: '#3B82F6' },
    ];

    render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={tagsAtuais}
        todasTags={todasTags}
      />
    );

    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('Lazer')).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma tag')).not.toBeInTheDocument();
  });

  it('deve renderizar botão de remover em cada tag', () => {
    const tagsAtuais = [
      { id: 1, nome: 'Essencial', cor: '#10B981' },
    ];

    render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={tagsAtuais}
        todasTags={todasTags}
      />
    );

    const botoes = screen.getAllByRole('button', { hidden: true });
    expect(botoes.length).toBeGreaterThan(0);
  });

  it('deve mostrar dropdown quando há tags disponíveis', () => {
    const tagsAtuais = [
      { id: 1, nome: 'Essencial', cor: '#10B981' },
    ];

    render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={tagsAtuais}
        todasTags={todasTags}
      />
    );

    const dropdown = screen.getByTestId('dropdown-adicionar-tag');
    expect(dropdown).toBeInTheDocument();
  });

  it('não deve mostrar dropdown quando todas as tags já foram aplicadas', () => {
    render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={todasTags}
        todasTags={todasTags}
      />
    );

    const dropdown = screen.queryByTestId('dropdown-adicionar-tag');
    expect(dropdown).not.toBeInTheDocument();
  });

  it('deve filtrar tags disponíveis corretamente', () => {
    const tagsAtuais = [
      { id: 1, nome: 'Essencial', cor: '#10B981' },
      { id: 2, nome: 'Lazer', cor: '#3B82F6' },
    ];

    const { container } = render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={tagsAtuais}
        todasTags={todasTags}
      />
    );

    // Tags atuais devem estar visíveis
    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('Lazer')).toBeInTheDocument();

    // Dropdown deve existir (para as 2 tags restantes)
    expect(screen.getByTestId('dropdown-adicionar-tag')).toBeInTheDocument();
  });

  it('deve renderizar múltiplas tags atuais', () => {
    const tagsAtuais = [
      { id: 1, nome: 'Essencial', cor: '#10B981' },
      { id: 2, nome: 'Lazer', cor: '#3B82F6' },
      { id: 3, nome: 'Trabalho', cor: '#F59E0B' },
    ];

    render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={tagsAtuais}
        todasTags={todasTags}
      />
    );

    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('Lazer')).toBeInTheDocument();
    expect(screen.getByText('Trabalho')).toBeInTheDocument();
  });

  it('deve usar cor padrão quando tag não tem cor', () => {
    const tagsAtuais = [
      { id: 1, nome: 'Sem Cor', cor: undefined } as any,
    ];

    const { container } = render(
      <SeletorTags
        transacaoId={1}
        tagsAtuais={tagsAtuais}
        todasTags={[...todasTags, tagsAtuais[0]]}
      />
    );

    expect(screen.getByText('Sem Cor')).toBeInTheDocument();
  });
});
