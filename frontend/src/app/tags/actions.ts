'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function criarTagAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const cor = formData.get('cor') as string;
  const descricao = formData.get('descricao') as string;

  if (!nome || !cor) {
    throw new Error('Nome e cor são obrigatórios');
  }

  const res = await fetch(`${API_URL}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: nome.trim(),
      cor: cor,
      descricao: descricao?.trim() || undefined,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao criar tag: ${error}`);
  }

  revalidatePath('/tags');
  return { success: true };
}

export async function deletarTagAction(tagId: number, tagNome: string) {
  const res = await fetch(`${API_URL}/tags/${tagId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao deletar tag "${tagNome}": ${error}`);
  }

  revalidatePath('/tags');
  return { success: true };
}
