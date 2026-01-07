// Utilitários para calcular período baseado em dia de início customizado

export interface PeriodoCalculado {
  data_inicio: string;
  data_fim: string;
}

/**
 * Calcula o período customizado baseado em mês/ano e dia de início
 */
export function calcularPeriodoCustomizado(
  mes: number,
  ano: number,
  diaInicio: number
): PeriodoCalculado {
  const dataInicioCalc = new Date(ano, mes - 1, diaInicio);
  const dataFimCalc = new Date(ano, mes, diaInicio - 1);
  
  return {
    data_inicio: dataInicioCalc.toISOString().split('T')[0],
    data_fim: dataFimCalc.toISOString().split('T')[0]
  };
}

/**
 * Extrai período, diaInicio e criterio dos searchParams com defaults
 * Next.js 16: searchParams deve ser awaited antes de ser passado
 */
export function extrairPeriodoDaURL(searchParams: Record<string, string | undefined>) {
  const periodo = searchParams.periodo || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const diaInicio = parseInt(searchParams.diaInicio || '1');
  const criterio = searchParams.criterio || 'data_transacao';
  
  const mes = parseInt(periodo.split('-')[1]);
  const ano = parseInt(periodo.split('-')[0]);
  
  return { periodo, diaInicio, criterio, mes, ano };
}
