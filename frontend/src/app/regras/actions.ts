'use server';

import { revalidatePath } from 'next/cache';
import { TipoAcao, CriterioTipo } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Cria uma nova regra
 */
export async function criarRegraAction(params: {
  nome: string;
  tipo_acao: TipoAcao;
  criterio_tipo: CriterioTipo;
  criterio_valor: string;
  acao_valor: string;
  tag_ids?: number[];
}) {
  const { tag_ids, ...regra_data } = params;

  // Monta query string com tag_ids se necessário
  const queryParams = new URLSearchParams();
  if (tag_ids && tag_ids.length > 0) {
    tag_ids.forEach(id => queryParams.append('tag_ids', id.toString()));
  }

  const url = `${API_URL}/regras${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regra_data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao criar regra: ${error}`);
  }

  revalidatePath('/regras');
  revalidatePath('/'); // Revalida dashboard caso regras afetem resumo
  return res.json();
}

/**
 * Atualiza a prioridade de uma regra
 */
export async function atualizarPrioridadeAction(regraId: number, novaPrioridade: number) {
  const res = await fetch(`${API_URL}/regras/${regraId}/prioridade?nova_prioridade=${novaPrioridade}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao atualizar prioridade: ${error}`);
  }

  revalidatePath('/regras');
  return res.json();
}

/**
 * Ativa ou desativa uma regra (toggle)
 */
export async function toggleAtivoAction(regraId: number) {
  const res = await fetch(`${API_URL}/regras/${regraId}/ativar-desativar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao alterar status da regra: ${error}`);
  }

  revalidatePath('/regras');
  return res.json();
}

/**
 * Deleta uma regra permanentemente
 */
export async function deletarRegraAction(regraId: number) {
  const res = await fetch(`${API_URL}/regras/${regraId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao deletar regra: ${error}`);
  }

  revalidatePath('/regras');
  revalidatePath('/'); // Revalida dashboard
  return { success: true };
}

/**
 * Aplica uma regra específica retroativamente em todas as transações
 */
export async function aplicarRegraRetroativamenteAction(regraId: number) {
  const res = await fetch(`${API_URL}/regras/${regraId}/aplicar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao aplicar regra: ${error}`);
  }

  revalidatePath('/'); // Revalida dashboard
  revalidatePath('/transacoes'); // Revalida lista de transações
  return res.json();
}

/**
 * Aplica todas as regras ativas retroativamente em todas as transações
 */
export async function aplicarTodasRegrasAction() {
  const res = await fetch(`${API_URL}/regras/aplicar-todas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao aplicar todas as regras: ${error}`);
  }

  revalidatePath('/'); // Revalida dashboard
  revalidatePath('/transacoes'); // Revalida lista de transações
  return res.json();
}
