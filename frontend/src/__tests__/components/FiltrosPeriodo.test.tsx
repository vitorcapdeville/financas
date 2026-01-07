import { render, screen, fireEvent } from '@testing-library/react';
import FiltrosPeriodo from '@/components/FiltrosPeriodo';
import { CriterioDataTransacao } from '@/types';

// Mock do Next.js navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('FiltrosPeriodo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('periodo');
    mockSearchParams.delete('diaInicio');
    mockSearchParams.delete('criterio');
  });

  it('deve renderizar o seletor de período', () => {
    render(<FiltrosPeriodo />);
    
    expect(screen.getByText('Período')).toBeInTheDocument();
    expect(screen.getByText('Período visualizado')).toBeInTheDocument();
    
    const input = screen.getByDisplayValue(/^\d{4}-\d{2}$/);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'month');
  });

  it('deve usar valores padrão quando não há parâmetros na URL', () => {
    render(<FiltrosPeriodo />);
    
    const hoje = new Date();
    const periodoEsperado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    
    const input = screen.getByDisplayValue(periodoEsperado) as HTMLInputElement;
    expect(input.value).toBe(periodoEsperado);
  });

  it('deve exibir período calculado corretamente', () => {
    mockSearchParams.set('periodo', '2024-01');
    mockSearchParams.set('diaInicio', '25');
    
    render(<FiltrosPeriodo />);
    
    // Deve mostrar "25 de dez. até 24 de jan. 2024"
    expect(screen.getByText(/25 de/)).toBeInTheDocument();
    expect(screen.getByText(/até/)).toBeInTheDocument();
  });

  it('deve exibir critério de data da transação', () => {
    mockSearchParams.set('criterio', CriterioDataTransacao.DATA_TRANSACAO);
    
    render(<FiltrosPeriodo />);
    
    expect(screen.getByText(/Gastos do cartão mostrados na data da transação/)).toBeInTheDocument();
  });

  it('deve exibir critério de data da fatura', () => {
    mockSearchParams.set('criterio', CriterioDataTransacao.DATA_FATURA);
    
    render(<FiltrosPeriodo />);
    
    expect(screen.getByText(/Gastos do cartão mostrados na data da fatura/)).toBeInTheDocument();
  });

  it('deve navegar ao alterar o período', () => {
    render(<FiltrosPeriodo />);
    
    const input = screen.getByDisplayValue(/^\d{4}-\d{2}$/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2024-03' } });
    
    expect(mockPush).toHaveBeenCalledWith('?periodo=2024-03');
  });

  it('deve preservar outros parâmetros ao alterar período', () => {
    mockSearchParams.set('diaInicio', '15');
    mockSearchParams.set('tags', '1,2');
    
    render(<FiltrosPeriodo />);
    
    const input = screen.getByDisplayValue(/^\d{4}-\d{2}$/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2024-06' } });
    
    expect(mockPush).toHaveBeenCalledWith('?diaInicio=15&tags=1%2C2&periodo=2024-06');
  });

  it('deve usar dia de início 1 como padrão', () => {
    mockSearchParams.set('periodo', '2024-01');
    
    render(<FiltrosPeriodo />);
    
    // Com dia início 1, deve mostrar "1 de jan. até 31 de jan."
    expect(screen.getByText(/1 de/)).toBeInTheDocument();
  });

  it('deve calcular período corretamente com dia de início diferente', () => {
    mockSearchParams.set('periodo', '2024-02');
    mockSearchParams.set('diaInicio', '10');
    
    render(<FiltrosPeriodo />);
    
    // Dia 10 de fev até 9 de mar
    expect(screen.getByText(/10 de/)).toBeInTheDocument();
  });
});
