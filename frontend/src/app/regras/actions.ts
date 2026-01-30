"use server";

import { revalidatePath } from "next/cache";
import { TipoAcao, CriterioTipo } from "@/types";
import { regrasService } from "@/services/api.service";

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
  try {
    const result = await regrasService.criar(params);

    revalidatePath("/regras");
    revalidatePath("/"); // Revalida dashboard caso regras afetem resumo

    return result;
  } catch (error) {
    throw new Error(
      `Erro ao criar regra: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    );
  }
}

/**
 * Atualiza a prioridade de uma regra
 */
export async function atualizarPrioridadeAction(
  regraId: number,
  novaPrioridade: number,
) {
  try {
    const result = await regrasService.atualizarPrioridade(
      regraId,
      novaPrioridade,
    );

    revalidatePath("/regras");

    return result;
  } catch (error) {
    throw new Error(
      `Erro ao atualizar prioridade: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    );
  }
}

/**
 * Ativa ou desativa uma regra (toggle)
 */
export async function toggleAtivoAction(regraId: number) {
  try {
    const result = await regrasService.toggleAtivo(regraId);

    revalidatePath("/regras");

    return result;
  } catch (error) {
    throw new Error(
      `Erro ao alterar status da regra: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    );
  }
}

/**
 * Deleta uma regra permanentemente
 */
export async function deletarRegraAction(regraId: number) {
  try {
    await regrasService.deletar(regraId);

    revalidatePath("/regras");
    revalidatePath("/"); // Revalida dashboard

    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao deletar regra: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    );
  }
}

/**
 * Aplica uma regra específica retroativamente em todas as transações
 */
export async function aplicarRegraRetroativamenteAction(regraId: number) {
  try {
    const result = await regrasService.aplicarRetroativamente(regraId);

    revalidatePath("/"); // Revalida dashboard
    revalidatePath("/transacoes"); // Revalida lista de transações

    return result;
  } catch (error) {
    throw new Error(
      `Erro ao aplicar regra: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    );
  }
}

/**
 * Aplica todas as regras ativas retroativamente em todas as transações
 */
export async function aplicarTodasRegrasAction() {
  try {
    const result = await regrasService.aplicarTodas();

    revalidatePath("/"); // Revalida dashboard
    revalidatePath("/transacoes"); // Revalida lista de transações

    return result;
  } catch (error) {
    throw new Error(
      `Erro ao aplicar todas as regras: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    );
  }
}
