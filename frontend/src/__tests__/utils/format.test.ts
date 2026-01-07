import { formatarData, formatarMes, formatarMoeda, obterMesAtual, obterAnoAtual } from '@/utils/format';

describe('Utils - Format', () => {
  describe('formatarData', () => {
    it('deve formatar uma data string ISO no formato DD/MM/YYYY', () => {
      expect(formatarData('2024-01-15')).toBe('15/01/2024');
      expect(formatarData('2024-12-25')).toBe('25/12/2024');
    });

    it('deve formatar um objeto Date no formato DD/MM/YYYY', () => {
      const data = new Date('2024-06-10T12:00:00Z');
      const formatted = formatarData(data);
      expect(formatted).toMatch(/\d{2}\/06\/2024/);
    });
  });

  describe('formatarMes', () => {
    it('deve retornar o nome correto do mês', () => {
      expect(formatarMes(1)).toBe('Janeiro');
      expect(formatarMes(6)).toBe('Junho');
      expect(formatarMes(12)).toBe('Dezembro');
    });

    it('deve retornar string vazia para mês inválido', () => {
      expect(formatarMes(0)).toBe('');
      expect(formatarMes(13)).toBe('');
      expect(formatarMes(-1)).toBe('');
    });
  });

  describe('formatarMoeda', () => {
    it('deve formatar valores positivos corretamente', () => {
      const valor1 = formatarMoeda(1500.50);
      const valor2 = formatarMoeda(100);
      const valor3 = formatarMoeda(0);
      
      expect(valor1).toContain('1.500,50');
      expect(valor2).toContain('100,00');
      expect(valor3).toContain('0,00');
    });

    it('deve formatar valores negativos corretamente', () => {
      const valor = formatarMoeda(-500.75);
      expect(valor).toContain('500,75');
      expect(valor).toContain('-');
    });

    it('deve formatar valores decimais corretamente', () => {
      const valor1 = formatarMoeda(10.99);
      const valor2 = formatarMoeda(0.01);
      
      expect(valor1).toContain('10,99');
      expect(valor2).toContain('0,01');
    });
  });

  describe('obterMesAtual', () => {
    it('deve retornar um número entre 1 e 12', () => {
      const mes = obterMesAtual();
      expect(mes).toBeGreaterThanOrEqual(1);
      expect(mes).toBeLessThanOrEqual(12);
    });
  });

  describe('obterAnoAtual', () => {
    it('deve retornar o ano atual', () => {
      const ano = obterAnoAtual();
      expect(ano).toBeGreaterThan(2020);
      expect(ano).toBeLessThan(2100);
    });
  });
});
