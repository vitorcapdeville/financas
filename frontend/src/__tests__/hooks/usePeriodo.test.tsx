import { renderHook, act } from '@testing-library/react';
import { usePeriodo } from '@/hooks/usePeriodo';

describe('usePeriodo Hook', () => {
  beforeEach(() => {
    // Limpa localStorage antes de cada teste
    localStorage.clear();
  });

  it('deve inicializar com valores padrão quando localStorage está vazio', () => {
    const { result } = renderHook(() => usePeriodo());

    expect(result.current.diaInicio).toBe(1);
    expect(result.current.periodo).toMatch(/^\d{4}-\d{2}$/);
  });

  it('deve inicializar com valores do localStorage quando existem', () => {
    localStorage.setItem('financas_periodo', '2024-06');
    localStorage.setItem('financas_dia_inicio', '15');

    const { result } = renderHook(() => usePeriodo());

    expect(result.current.periodo).toBe('2024-06');
    expect(result.current.diaInicio).toBe(15);
  });

  it('deve atualizar período e persistir no localStorage', () => {
    const { result } = renderHook(() => usePeriodo());

    act(() => {
      result.current.setPeriodo('2024-07');
    });

    expect(result.current.periodo).toBe('2024-07');
    expect(localStorage.getItem('financas_periodo')).toBe('2024-07');
  });

  it('deve atualizar dia de início e persistir no localStorage', () => {
    const { result } = renderHook(() => usePeriodo());

    act(() => {
      result.current.setDiaInicio(25);
    });

    expect(result.current.diaInicio).toBe(25);
    expect(localStorage.getItem('financas_dia_inicio')).toBe('25');
  });

  it('deve permitir múltiplas atualizações', () => {
    const { result } = renderHook(() => usePeriodo());

    act(() => {
      result.current.setPeriodo('2024-01');
      result.current.setDiaInicio(10);
    });

    expect(result.current.periodo).toBe('2024-01');
    expect(result.current.diaInicio).toBe(10);

    act(() => {
      result.current.setPeriodo('2024-12');
      result.current.setDiaInicio(20);
    });

    expect(result.current.periodo).toBe('2024-12');
    expect(result.current.diaInicio).toBe(20);
    expect(localStorage.getItem('financas_periodo')).toBe('2024-12');
    expect(localStorage.getItem('financas_dia_inicio')).toBe('20');
  });
});
