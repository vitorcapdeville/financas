"use server";

import { revalidatePath } from "next/cache";
import { transacoesService } from "@/services/api.service";

export async function adicionarTagAction(transacaoId: number, tagId: number) {
  try {
    await transacoesService.adicionarTag(transacaoId, tagId);
    revalidatePath(`/transacao/${transacaoId}`);
    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao adicionar tag: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

export async function removerTagAction(transacaoId: number, tagId: number) {
  try {
    await transacoesService.removerTag(transacaoId, tagId);
    revalidatePath(`/transacao/${transacaoId}`);
    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao remover tag: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

export async function atualizarCategoriaAction(
  transacaoId: number,
  categoria: string
) {
  try {
    await transacoesService.atualizar(transacaoId, {
      categoria: categoria.trim(),
    });
    revalidatePath(`/transacao/${transacaoId}`);
    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao atualizar categoria: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

export async function atualizarValorAction(transacaoId: number, valor: number) {
  try {
    await transacoesService.atualizar(transacaoId, { valor });
    revalidatePath(`/transacao/${transacaoId}`);
    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao atualizar valor: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

export async function restaurarValorOriginalAction(transacaoId: number) {
  try {
    await transacoesService.restaurarValorOriginal(transacaoId);
    revalidatePath(`/transacao/${transacaoId}`);
    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao restaurar valor original: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}
