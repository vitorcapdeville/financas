import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListaTags from '@/components/ListaTags';
import { Tag } from '@/types';

// Mock do toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock das Server Actions
const mockDeletarTagAction = jest.fn();
jest.mock('@/app/tags/actions', () => ({
  deletarTagAction: (id: number, nome: string) => mockDeletarTagAction(id, nome),
}));

describe('ListaTags', () => {
  const tagsMock: Tag[] = [
    { id: 1, nome: 'Urgente', descricao: 'Despesas urgentes', cor: '#FF0000' },
    { id: 2, nome: 'Parcelado', descricao: 'Compras parceladas', cor: '#00FF00' },
    { id: 3, nome: 'Recorrente', cor: '#0000FF' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título', () => {
    render(<ListaTags tags={tagsMock} />);
    expect(screen.getByText('Tags Cadastradas')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há tags', () => {
    render(<ListaTags tags={[]} />);
    expect(screen.getByText('Nenhuma tag cadastrada. Crie uma tag para começar.')).toBeInTheDocument();
  });

  it('deve renderizar todas as tags', () => {
    render(<ListaTags tags={tagsMock} />);
    
    expect(screen.getByText('Urgente')).toBeInTheDocument();
    expect(screen.getByText('Parcelado')).toBeInTheDocument();
    expect(screen.getByText('Recorrente')).toBeInTheDocument();
  });

  it('deve exibir descrição quando disponível', () => {
    render(<ListaTags tags={tagsMock} />);
    
    expect(screen.getByText('Despesas urgentes')).toBeInTheDocument();
    expect(screen.getByText('Compras parceladas')).toBeInTheDocument();
  });

  it('deve renderizar cor da tag corretamente', () => {
    render(<ListaTags tags={tagsMock} />);
    
    const cores = screen.getAllByRole('generic').filter(el => 
      el.className.includes('w-8 h-8 rounded-full')
    );
    
    expect(cores[0]).toHaveStyle({ backgroundColor: '#FF0000' });
    expect(cores[1]).toHaveStyle({ backgroundColor: '#00FF00' });
    expect(cores[2]).toHaveStyle({ backgroundColor: '#0000FF' });
  });

  it('deve renderizar botão excluir para cada tag', () => {
    render(<ListaTags tags={tagsMock} />);
    
    const botoesExcluir = screen.getAllByText('Excluir');
    expect(botoesExcluir).toHaveLength(3);
  });

  it('deve abrir modal de confirmação ao clicar em excluir', () => {
    render(<ListaTags tags={tagsMock} />);
    
    const botoesExcluir = screen.getAllByText('Excluir');
    fireEvent.click(botoesExcluir[0]);
    
    expect(screen.getByText('Deletar Tag')).toBeInTheDocument();
    expect(screen.getByText(/Deseja realmente excluir a tag "Urgente"/)).toBeInTheDocument();
  });

  it('deve fechar modal ao clicar em cancelar', () => {
    render(<ListaTags tags={tagsMock} />);
    
    const botoesExcluir = screen.getAllByText('Excluir');
    fireEvent.click(botoesExcluir[0]);
    
    const botaoCancelar = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(botaoCancelar);
    
    expect(screen.queryByText('Deletar Tag')).not.toBeInTheDocument();
  });

  it('deve chamar deletarTagAction ao confirmar exclusão', async () => {
    mockDeletarTagAction.mockResolvedValue({ success: true });
    
    render(<ListaTags tags={tagsMock} />);
    
    const botoesExcluir = screen.getAllByText('Excluir');
    fireEvent.click(botoesExcluir[1]); // Tag "Parcelado"
    
    const botaoConfirmar = screen.getByRole('button', { name: /deletar/i });
    fireEvent.click(botaoConfirmar);
    
    await waitFor(() => {
      expect(mockDeletarTagAction).toHaveBeenCalledWith(2, 'Parcelado');
    });
  });

  it('deve mostrar modal do tipo danger', () => {
    render(<ListaTags tags={tagsMock} />);
    
    const botoesExcluir = screen.getAllByText('Excluir');
    fireEvent.click(botoesExcluir[0]);
    
    const botaoConfirmar = screen.getByRole('button', { name: /deletar/i });
    expect(botaoConfirmar).toHaveClass('bg-red-600');
  });

  it('deve exibir informação sobre remoção de transações no modal', () => {
    render(<ListaTags tags={tagsMock} />);
    
    const botoesExcluir = screen.getAllByText('Excluir');
    fireEvent.click(botoesExcluir[0]);
    
    expect(screen.getByText(/Ela será removida de todas as transações/)).toBeInTheDocument();
  });
});
