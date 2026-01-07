'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function adicionarTagAction(transacaoId: number, tagId: number) {
  const res = await fetch(`${API_URL}/transacoes/${transacaoId}/tags/${tagId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao adicionar tag: ${error}`);
  }
  
  revalidatePath(`/transacao/${transacaoId}`);
  return { success: true };
}

export async function removerTagAction(transacaoId: number, tagId: number) {
  const res = await fetch(`${API_URL}/transacoes/${transacaoId}/tags/${tagId}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao remover tag: ${error}`);
  }
  
  revalidatePath(`/transacao/${transacaoId}`);
  return { success: true };
}

export async function atualizarCategoriaAction(transacaoId: number, categoria: string) {
  const res = await fetch(`${API_URL}/transacoes/${transacaoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categoria: categoria.trim() }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao atualizar categoria: ${error}`);
  }
  
  revalidatePath(`/transacao/${transacaoId}`);
  return { success: true };
}

export async function atualizarValorAction(transacaoId: number, valor: number) {
  const res = await fetch(`${API_URL}/transacoes/${transacaoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ valor }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao atualizar valor: ${error}`);
  }
  
  revalidatePath(`/transacao/${transacaoId}`);
  return { success: true };
}

export async function restaurarValorOriginalAction(transacaoId: number) {
  const res = await fetch(`${API_URL}/transacoes/${transacaoId}/restaurar-valor`, {
    method: 'POST',
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao restaurar valor original: ${error}`);
  }
  
  revalidatePath(`/transacao/${transacaoId}`);
  return { success: true };
}
