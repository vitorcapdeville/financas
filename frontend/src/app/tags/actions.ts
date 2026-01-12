"use server";

import { revalidatePath } from "next/cache";
import { tagsService } from "@/services/api.service";

export async function criarTagAction(formData: FormData) {
  const nome = formData.get("nome") as string;
  const cor = formData.get("cor") as string;
  const descricao = formData.get("descricao") as string;

  if (!nome || !cor) {
    throw new Error("Nome e cor são obrigatórios");
  }

  try {
    await tagsService.criar({
      nome: nome.trim(),
      cor: cor,
      descricao: descricao?.trim() || undefined,
    });

    revalidatePath("/tags");
    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao criar tag: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

export async function deletarTagAction(tagId: number, tagNome: string) {
  try {
    await tagsService.deletar(tagId);
    revalidatePath("/tags");
    return { success: true };
  } catch (error) {
    throw new Error(
      `Erro ao deletar tag "${tagNome}": ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}
