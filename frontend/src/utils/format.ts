import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatarData = (data: string | Date): string => {
  const dataObj = typeof data === 'string' ? parseISO(data) : data;
  return format(dataObj, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatarMes = (mes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1] || '';
};

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

export const obterMesAtual = (): number => {
  return new Date().getMonth() + 1;
};

export const obterAnoAtual = (): number => {
  return new Date().getFullYear();
};
