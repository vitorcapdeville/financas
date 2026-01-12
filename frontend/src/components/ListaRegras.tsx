"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { Regra, CriterioTipo, TipoAcao } from "@/types";
import {
  deletarRegraAction,
  toggleAtivoAction,
  aplicarRegraRetroativamenteAction,
  atualizarPrioridadeAction,
} from "@/app/regras/actions";
import { ModalConfirmacao } from "./ModalConfirmacao";

interface ListaRegrasProps {
  regras: Regra[];
}

export function ListaRegras({ regras }: ListaRegrasProps) {
  const [regraParaDeletar, setRegraParaDeletar] = useState<number | null>(null);
  const [regraParaAplicar, setRegraParaAplicar] = useState<number | null>(null);
  const [editandoPrioridade, setEditandoPrioridade] = useState<number | null>(
    null
  );
  const [novaPrioridade, setNovaPrioridade] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleToggleAtivo = (regraId: number) => {
    startTransition(async () => {
      try {
        await toggleAtivoAction(regraId);
      } catch (error) {
        toast.error(`Erro ao alterar status: ${error}`);
      }
    });
  };

  const handleDeletar = (regraId: number) => {
    startTransition(async () => {
      try {
        await deletarRegraAction(regraId);
        setRegraParaDeletar(null);
      } catch (error) {
        toast.error(`Erro ao deletar: ${error}`);
        setRegraParaDeletar(null);
      }
    });
  };

  const handleAplicarRetroativamente = (regraId: number) => {
    startTransition(async () => {
      try {
        const resultado = await aplicarRegraRetroativamenteAction(regraId);
        toast.success(
          `✅ Regra aplicada! ${resultado.total_modificado} de ${resultado.total_processado} transações modificadas.`
        );
        setRegraParaAplicar(null);
      } catch (error) {
        toast.error(`Erro ao aplicar regra: ${error}`);
        setRegraParaAplicar(null);
      }
    });
  };

  const handleSalvarPrioridade = (regraId: number) => {
    const prioridade = parseInt(novaPrioridade);
    if (isNaN(prioridade) || prioridade < 1) {
      toast.error("Prioridade deve ser um número maior ou igual a 1");
      return;
    }

    startTransition(async () => {
      try {
        await atualizarPrioridadeAction(regraId, prioridade);
        setEditandoPrioridade(null);
        setNovaPrioridade("");
      } catch (error) {
        toast.error(`Erro ao atualizar prioridade: ${error}`);
      }
    });
  };

  const formatarCriterio = (tipo: CriterioTipo, valor: string) => {
    switch (tipo) {
      case CriterioTipo.DESCRICAO_EXATA:
        return `Descrição = "${valor}"`;
      case CriterioTipo.DESCRICAO_CONTEM:
        return `Descrição contém "${valor}"`;
      case CriterioTipo.CATEGORIA:
        return `Categoria = "${valor}"`;
      default:
        return valor;
    }
  };

  const formatarAcao = (regra: Regra) => {
    switch (regra.tipo_acao) {
      case TipoAcao.ALTERAR_CATEGORIA:
        return `→ Categoria: "${regra.acao_valor}"`;
      case TipoAcao.ADICIONAR_TAGS:
        try {
          const tagIds = JSON.parse(regra.acao_valor);
          return `→ Adicionar ${tagIds.length} tag(s)`;
        } catch {
          return `→ Adicionar tags`;
        }
      case TipoAcao.ALTERAR_VALOR:
        return `→ Reduzir ${regra.acao_valor}% do valor original`;
      default:
        return regra.acao_valor;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {regras.map((regra) => (
          <div
            key={regra.id}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
              regra.ativo ? "border-green-500" : "border-gray-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Nome e Status */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {regra.nome}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      regra.ativo
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {regra.ativo ? "✓ Ativa" : "○ Inativa"}
                  </span>
                </div>

                {/* Critério e Ação */}
                <div className="text-gray-700 mb-4">
                  <p className="mb-1">
                    <span className="font-medium">Critério:</span>{" "}
                    {formatarCriterio(
                      regra.criterio_tipo,
                      regra.criterio_valor
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Ação:</span>{" "}
                    {formatarAcao(regra)}
                  </p>
                </div>

                {/* Prioridade */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Prioridade:</span>
                  {editandoPrioridade === regra.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={novaPrioridade}
                        onChange={(e) => setNovaPrioridade(e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        disabled={isPending}
                      />
                      <button
                        onClick={() => handleSalvarPrioridade(regra.id)}
                        className="text-sm text-green-600 hover:text-green-700"
                        disabled={isPending}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditandoPrioridade(null);
                          setNovaPrioridade("");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-700"
                        disabled={isPending}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {regra.prioridade}
                      </span>
                      <button
                        onClick={() => {
                          setEditandoPrioridade(regra.id);
                          setNovaPrioridade(regra.prioridade.toString());
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                        disabled={isPending}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleToggleAtivo(regra.id)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    regra.ativo
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                  disabled={isPending}
                >
                  {regra.ativo ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => setRegraParaAplicar(regra.id)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                  disabled={isPending}
                >
                  Aplicar Agora
                </button>
                <button
                  onClick={() => setRegraParaDeletar(regra.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                  disabled={isPending}
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmação - Deletar */}
      {regraParaDeletar && (
        <ModalConfirmacao
          titulo="Deletar Regra"
          mensagem="Tem certeza que deseja deletar esta regra? ⚠️ As transações que já foram modificadas por ela permanecerão com as alterações aplicadas. Não há rollback automático."
          onConfirmar={() => handleDeletar(regraParaDeletar)}
          onCancelar={() => setRegraParaDeletar(null)}
          textoBotaoConfirmar="Deletar"
          isPending={isPending}
        />
      )}

      {/* Modal de Confirmação - Aplicar */}
      {regraParaAplicar && (
        <ModalConfirmacao
          titulo="Aplicar Regra"
          mensagem="Aplicar esta regra em todas as transações existentes que correspondem aos critérios? Isso pode modificar muitas transações de uma vez."
          onConfirmar={() => handleAplicarRetroativamente(regraParaAplicar)}
          onCancelar={() => setRegraParaAplicar(null)}
          textoBotaoConfirmar="Aplicar"
          isPending={isPending}
        />
      )}
    </>
  );
}
