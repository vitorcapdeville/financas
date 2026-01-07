import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FiltroTags from '@/components/FiltroTags';
import { tagsService } from '@/services/api.service';
import { Tag } from '@/types';

// Mock do service
jest.mock('@/services/api.service', () => ({
  tagsService: {
    listar: jest.fn(),
  },
}));

// Mock do Next.js navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('FiltroTags', () => {
  const tagsMock: Tag[] = [
    { id: 1, nome: 'Urgente', descricao: 'Despesas urgentes', cor: '#FF0000' },
    { id: 2, nome: 'Parcelado', descricao: 'Compras parceladas', cor: '#00FF00' },
    { id: 3, nome: 'Recorrente', cor: '#0000FF' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('tags');
    (tagsService.listar as jest.Mock).mockResolvedValue(tagsMock);
  });

  it('deve carregar e exibir tags', async () => {
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Urgente')).toBeInTheDocument();
      expect(screen.getByText('Parcelado')).toBeInTheDocument();
      expect(screen.getByText('Recorrente')).toBeInTheDocument();
    });
    
    expect(tagsService.listar).toHaveBeenCalled();
  });

  it('não deve renderizar nada quando não há tags', async () => {
    (tagsService.listar as jest.Mock).mockResolvedValue([]);
    
    const { container } = render(<FiltroTags />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('deve renderizar título do filtro', async () => {
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Filtrar por Tags')).toBeInTheDocument();
    });
  });

  it('deve selecionar tag ao clicar', async () => {
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Urgente')).toBeInTheDocument();
    });
    
    const tagButton = screen.getByText('Urgente');
    fireEvent.click(tagButton);
    
    expect(mockPush).toHaveBeenCalledWith('?tags=1');
  });

  it('deve permitir selecionar múltiplas tags', async () => {
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Urgente')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Urgente'));
    fireEvent.click(screen.getByText('Parcelado'));
    
    // A segunda chamada deve incluir ambas as tags
    expect(mockPush).toHaveBeenLastCalledWith('?tags=1%2C2');
  });

  it('deve desselecionar tag ao clicar novamente', async () => {
    mockSearchParams.set('tags', '1,2');
    
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Urgente')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Urgente'));
    
    expect(mockPush).toHaveBeenCalledWith('?tags=2');
  });

  it('deve exibir botão limpar filtros quando há tags selecionadas', async () => {
    mockSearchParams.set('tags', '1');
    
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
    });
  });

  it('não deve exibir botão limpar quando não há seleção', async () => {
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Urgente')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument();
  });

  it('deve limpar todas as seleções ao clicar em limpar filtros', async () => {
    mockSearchParams.set('tags', '1,2,3');
    
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Limpar filtros'));
    
    expect(mockPush).toHaveBeenCalledWith('?');
  });

  it('deve exibir contador de tags selecionadas (singular)', async () => {
    mockSearchParams.set('tags', '1');
    
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('1 tag selecionada')).toBeInTheDocument();
    });
  });

  it('deve exibir contador de tags selecionadas (plural)', async () => {
    mockSearchParams.set('tags', '1,2');
    
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('2 tags selecionadas')).toBeInTheDocument();
    });
  });

  it('deve aplicar estilo de tag selecionada', async () => {
    mockSearchParams.set('tags', '1');
    
    render(<FiltroTags />);
    
    await waitFor(() => {
      const tagButton = screen.getByText('Urgente');
      expect(tagButton).toHaveClass('text-white', 'ring-2', 'ring-offset-2');
      expect(tagButton).toHaveStyle({ backgroundColor: '#FF0000' });
    });
  });

  it('deve aplicar estilo de tag não selecionada', async () => {
    render(<FiltroTags />);
    
    await waitFor(() => {
      const tagButton = screen.getByText('Parcelado');
      expect(tagButton).toHaveClass('text-gray-700', 'bg-gray-100', 'hover:bg-gray-200');
    });
  });

  it('deve preservar outros parâmetros da URL ao filtrar', async () => {
    mockSearchParams.set('periodo', '2024-01');
    mockSearchParams.set('diaInicio', '25');
    
    render(<FiltroTags />);
    
    await waitFor(() => {
      expect(screen.getByText('Urgente')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Urgente'));
    
    expect(mockPush).toHaveBeenCalledWith('?periodo=2024-01&diaInicio=25&tags=1');
  });
});
