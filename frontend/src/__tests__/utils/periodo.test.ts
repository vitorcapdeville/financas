import { calcularPeriodoCustomizado, extrairPeriodoDaURL } from '@/utils/periodo';

describe('Utils - Periodo', () => {
  describe('calcularPeriodoCustomizado', () => {
    it('deve calcular período com dia de início 1', () => {
      const resultado = calcularPeriodoCustomizado(1, 2024, 1);
      expect(resultado.data_inicio).toBe('2024-01-01');
      expect(resultado.data_fim).toBe('2024-01-31');
    });

    it('deve calcular período com dia de início 15', () => {
      const resultado = calcularPeriodoCustomizado(1, 2024, 15);
      expect(resultado.data_inicio).toBe('2024-01-15');
      expect(resultado.data_fim).toBe('2024-02-14');
    });

    it('deve calcular período com dia de início 25', () => {
      const resultado = calcularPeriodoCustomizado(11, 2024, 25);
      expect(resultado.data_inicio).toBe('2024-11-25');
      expect(resultado.data_fim).toBe('2024-12-24');
    });

    it('deve tratar corretamente virada de ano', () => {
      const resultado = calcularPeriodoCustomizado(12, 2024, 25);
      expect(resultado.data_inicio).toBe('2024-12-25');
      expect(resultado.data_fim).toBe('2025-01-24');
    });
  });

  describe('extrairPeriodoDaURL', () => {
    it('deve extrair período e diaInicio dos searchParams', () => {
      const searchParams = {
        periodo: '2024-06',
        diaInicio: '15',
        criterio: 'data_fatura'
      };
      
      const resultado = extrairPeriodoDaURL(searchParams);
      
      expect(resultado.periodo).toBe('2024-06');
      expect(resultado.diaInicio).toBe(15);
      expect(resultado.criterio).toBe('data_fatura');
      expect(resultado.mes).toBe(6);
      expect(resultado.ano).toBe(2024);
    });

    it('deve usar valores padrão quando searchParams está vazio', () => {
      const resultado = extrairPeriodoDaURL({});
      
      expect(resultado.diaInicio).toBe(1);
      expect(resultado.criterio).toBe('data_transacao');
      expect(resultado.mes).toBeGreaterThanOrEqual(1);
      expect(resultado.mes).toBeLessThanOrEqual(12);
      expect(resultado.ano).toBeGreaterThan(2020);
    });

    it('deve usar valor padrão para diaInicio se não fornecido', () => {
      const searchParams = {
        periodo: '2024-03'
      };
      
      const resultado = extrairPeriodoDaURL(searchParams);
      
      expect(resultado.periodo).toBe('2024-03');
      expect(resultado.diaInicio).toBe(1);
      expect(resultado.mes).toBe(3);
      expect(resultado.ano).toBe(2024);
    });
  });
});
