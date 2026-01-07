'use server';

import { revalidatePath } from 'next/cache';
import { CriterioDataTransacao } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function salvarDiaInicioAction(dia: number) {
  // Validação client-side
  if (!Number.isInteger(dia) || dia < 1 || dia > 28) {
    throw new Error('O dia de início deve estar entre 1 e 28');
  }

  const res = await fetch(`${API_URL}/configuracoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chave: 'diaInicioPeriodo',
      valor: dia.toString(),
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao salvar dia de início: ${error}`);
  }

  // Revalida todas as páginas que usam período/diaInicio
  revalidatePath('/configuracoes');
  revalidatePath('/');
  revalidatePath('/transacoes');
  
  return { success: true };
}

export async function salvarCriterioAction(criterio: string) {
  // Validação client-side
  const criteriosValidos = Object.values(CriterioDataTransacao);
  if (!criteriosValidos.includes(criterio as CriterioDataTransacao)) {
    throw new Error('Critério de data inválido');
  }

  const res = await fetch(`${API_URL}/configuracoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chave: 'criterio_data_transacao',
      valor: criterio,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao salvar critério de data: ${error}`);
  }

  // Revalida todas as páginas que usam critério de data
  revalidatePath('/configuracoes');
  revalidatePath('/');
  revalidatePath('/transacoes');
  
  return { success: true };
}
