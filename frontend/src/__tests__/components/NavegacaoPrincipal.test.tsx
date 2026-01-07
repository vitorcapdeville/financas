import { render, screen } from '@testing-library/react';
import { NavegacaoPrincipal } from '@/components/NavegacaoPrincipal';

// Mock do Next.js navigation
const mockSearchParams = new URLSearchParams();
let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('NavegacaoPrincipal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('periodo');
    mockSearchParams.delete('diaInicio');
    mockSearchParams.delete('criterio');
    mockSearchParams.delete('tags');
    mockPathname = '/';
  });

  it('deve renderizar todos os links de navegação', () => {
    render(<NavegacaoPrincipal />);
    
    expect(screen.getByText('🏠 Dashboard')).toBeInTheDocument();
    expect(screen.getByText('💳 Transações')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Tags')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Regras')).toBeInTheDocument();
    expect(screen.getByText('📤 Importar')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Configurações')).toBeInTheDocument();
  });

  it('deve destacar o link ativo (Dashboard)', () => {
    mockPathname = '/';
    render(<NavegacaoPrincipal />);
    
    const dashboardLink = screen.getByText('🏠 Dashboard');
    expect(dashboardLink).toHaveClass('bg-blue-600', 'text-white');
  });

  it('deve destacar o link ativo (Transações)', () => {
    mockPathname = '/transacoes';
    render(<NavegacaoPrincipal />);
    
    const transacoesLink = screen.getByText('💳 Transações');
    expect(transacoesLink).toHaveClass('bg-blue-600', 'text-white');
  });

  it('deve preservar parâmetros de período nos links', () => {
    mockSearchParams.set('periodo', '2024-01');
    mockSearchParams.set('diaInicio', '25');
    
    render(<NavegacaoPrincipal />);
    
    const dashboardLink = screen.getByText('🏠 Dashboard').closest('a');
    expect(dashboardLink?.href).toContain('periodo=2024-01');
    expect(dashboardLink?.href).toContain('diaInicio=25');
  });

  it('deve preservar parâmetros de tags nos links', () => {
    mockSearchParams.set('tags', '1,2,3');
    
    render(<NavegacaoPrincipal />);
    
    const transacoesLink = screen.getByText('💳 Transações').closest('a');
    expect(transacoesLink?.href).toContain('tags=1%2C2%2C3');
  });

  it('deve preservar parâmetro de critério nos links', () => {
    mockSearchParams.set('criterio', 'data_fatura');
    
    render(<NavegacaoPrincipal />);
    
    const tagsLink = screen.getByText('🏷️ Tags').closest('a');
    expect(tagsLink?.href).toContain('criterio=data_fatura');
  });

  it('deve preservar todos os parâmetros combinados', () => {
    mockSearchParams.set('periodo', '2024-03');
    mockSearchParams.set('diaInicio', '15');
    mockSearchParams.set('criterio', 'data_transacao');
    mockSearchParams.set('tags', '5,6');
    
    render(<NavegacaoPrincipal />);
    
    const regrasLink = screen.getByText('⚙️ Regras').closest('a');
    expect(regrasLink?.href).toContain('periodo=2024-03');
    expect(regrasLink?.href).toContain('diaInicio=15');
    expect(regrasLink?.href).toContain('criterio=data_transacao');
    expect(regrasLink?.href).toContain('tags=5%2C6');
  });

  it('deve usar href sem query string quando não há parâmetros', () => {
    render(<NavegacaoPrincipal />);
    
    const dashboardLink = screen.getByText('🏠 Dashboard').closest('a');
    expect(dashboardLink?.href).toBe('http://localhost/');
  });

  it('deve aplicar estilos corretos para links inativos', () => {
    mockPathname = '/';
    render(<NavegacaoPrincipal />);
    
    const transacoesLink = screen.getByText('💳 Transações');
    expect(transacoesLink).toHaveClass('text-gray-600', 'hover:bg-gray-100');
    expect(transacoesLink).not.toHaveClass('bg-blue-600', 'text-white');
  });

  it('deve usar detecção de rota exata para Dashboard', () => {
    mockPathname = '/transacoes';
    render(<NavegacaoPrincipal />);
    
    const dashboardLink = screen.getByText('🏠 Dashboard');
    expect(dashboardLink).not.toHaveClass('bg-blue-600');
  });

  it('deve usar detecção de rota com prefixo para outras páginas', () => {
    mockPathname = '/transacoes/123';
    render(<NavegacaoPrincipal />);
    
    const transacoesLink = screen.getByText('💳 Transações');
    expect(transacoesLink).toHaveClass('bg-blue-600', 'text-white');
  });
});
