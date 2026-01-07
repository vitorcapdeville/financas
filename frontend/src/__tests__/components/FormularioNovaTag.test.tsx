import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormularioNovaTag from '@/components/FormularioNovaTag';
import { toast } from 'react-hot-toast';

// Mock das actions
jest.mock('@/app/tags/actions', () => ({
  criarTagAction: jest.fn(),
}));

jest.mock('react-hot-toast');

describe('FormularioNovaTag Component', () => {
  const mockToast = toast as jest.Mocked<typeof toast>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar botão Nova Tag inicialmente', () => {
    render(<FormularioNovaTag />);
    expect(screen.getByText('Nova Tag')).toBeInTheDocument();
  });

  it('não deve mostrar formulário inicialmente', () => {
    render(<FormularioNovaTag />);
    expect(screen.queryByText('Criar Nova Tag')).not.toBeInTheDocument();
  });

  it('deve mostrar formulário ao clicar em Nova Tag', () => {
    render(<FormularioNovaTag />);
    
    fireEvent.click(screen.getByText('Nova Tag'));
    
    expect(screen.getByText('Criar Nova Tag')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Assinaturas, Esporádico, Essencial')).toBeInTheDocument();
  });

  it('deve mudar texto do botão para Cancelar quando formulário está aberto', () => {
    render(<FormularioNovaTag />);
    
    fireEvent.click(screen.getByText('Nova Tag'));
    
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve fechar formulário ao clicar em Cancelar', () => {
    render(<FormularioNovaTag />);
    
    fireEvent.click(screen.getByText('Nova Tag'));
    expect(screen.getByText('Criar Nova Tag')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Criar Nova Tag')).not.toBeInTheDocument();
  });

  it('deve renderizar todos os campos do formulário', () => {
    render(<FormularioNovaTag />);
    fireEvent.click(screen.getByText('Nova Tag'));
    
    expect(screen.getByPlaceholderText('Ex: Assinaturas, Esporádico, Essencial')).toBeInTheDocument();
    expect(screen.getByText('Cor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descrição opcional da tag')).toBeInTheDocument();
    expect(screen.getByText('Criar Tag')).toBeInTheDocument();
  });

  it('deve validar campo obrigatório nome', () => {
    render(<FormularioNovaTag />);
    fireEvent.click(screen.getByText('Nova Tag'));
    
    const nomeInput = screen.getByPlaceholderText('Ex: Assinaturas, Esporádico, Essencial');
    expect(nomeInput).toBeRequired();
  });

  it('deve ter campo de cor do tipo color', () => {
    render(<FormularioNovaTag />);
    fireEvent.click(screen.getByText('Nova Tag'));
    
    const corInputs = document.querySelectorAll('input[type="color"]');
    expect(corInputs).toHaveLength(1);
    expect(corInputs[0]).toHaveAttribute('name', 'cor');
  });

  it('deve exibir toast de erro ao falhar criação', async () => {
    const { criarTagAction } = require('@/app/tags/actions');
    criarTagAction.mockRejectedValue(new Error('Erro'));

    render(<FormularioNovaTag />);
    fireEvent.click(screen.getByText('Nova Tag'));

    const nomeInput = screen.getByPlaceholderText('Ex: Assinaturas, Esporádico, Essencial');
    fireEvent.change(nomeInput, { target: { value: 'Tag Teste' } });

    const form = screen.getByText('Criar Tag').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Erro ao criar tag. Tente novamente.');
    });
  });

  it('deve manter formulário aberto após erro', async () => {
    const { criarTagAction } = require('@/app/tags/actions');
    criarTagAction.mockRejectedValue(new Error('Erro'));

    render(<FormularioNovaTag />);
    fireEvent.click(screen.getByText('Nova Tag'));

    const nomeInput = screen.getByPlaceholderText('Ex: Assinaturas, Esporádico, Essencial');
    fireEvent.change(nomeInput, { target: { value: 'Tag Teste' } });

    const form = screen.getByText('Criar Tag').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });

    expect(screen.getByText('Criar Nova Tag')).toBeInTheDocument();
  });
});
