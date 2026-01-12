"use server";

import { revalidatePath } from "next/cache";
import { CriterioDataTransacao } from "@/types";
import { configuracoesService } from "@/services/api.service";

export async function salvarDiaInicioAction(dia: number) {
  // Validação client-side
  if (!Number.isInteger(dia) || dia < 1 || dia > 28) {
    throw new Error("O dia de início deve estar entre 1 e 28");
  }

  try {
    await configuracoesService.salvar("diaInicioPeriodo", dia.toString());

    // Revalida todas as páginas que usam período/diaInicio
    revalidatePath("/configuracoes");
    revalidatePath("/");
    revalidatePath("/transacoes");

    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao salvar dia de início: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

export async function salvarCriterioAction(criterio: string) {
  // Validação client-side
  const criteriosValidos = Object.values(CriterioDataTransacao);
  if (!criteriosValidos.includes(criterio as CriterioDataTransacao)) {
    throw new Error("Critério de data inválido");
  }

  try {
    await configuracoesService.salvar("criterio_data_transacao", criterio);

    // Revalida todas as páginas que usam critério de data
    revalidatePath("/configuracoes");
    revalidatePath("/");
    revalidatePath("/transacoes");

    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao salvar critério de data: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}
