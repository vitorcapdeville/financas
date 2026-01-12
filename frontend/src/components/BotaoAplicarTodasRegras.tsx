"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { aplicarTodasRegrasAction } from "@/app/regras/actions";
import { ModalConfirmacao } from "./ModalConfirmacao";

export function BotaoAplicarTodasRegras() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAplicarTodas = () => {
    startTransition(async () => {
      try {
        const resultado = await aplicarTodasRegrasAction();
        toast.success(
          `✅ Regras aplicadas! ${resultado.total_modificado} de ${resultado.total_processado} transações modificadas.`
        );
        setMostrarModal(false);
      } catch (error) {
        toast.error(`Erro ao aplicar regras: ${error}`);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setMostrarModal(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        🔄 Aplicar Todas as Regras
      </button>

      {mostrarModal && (
        <ModalConfirmacao
          titulo="Aplicar Todas as Regras"
          mensagem="⚠️ Isso aplicará TODAS as regras ativas em TODAS as transações existentes. Essa operação pode modificar muitas transações de uma vez. Deseja continuar?"
          onConfirmar={handleAplicarTodas}
          onCancelar={() => setMostrarModal(false)}
          textoBotaoConfirmar="Aplicar Todas"
          isPending={isPending}
        />
      )}
    </>
  );
}
