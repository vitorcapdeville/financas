"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  atualizarValorAction,
  restaurarValorOriginalAction,
} from "@/app/transacao/[id]/actions";
import {
  criarRegraAction,
  aplicarRegraRetroativamenteAction,
} from "@/app/regras/actions";
import { CriterioTipo, TipoAcao } from "@/types";
import { formatarMoeda } from "@/utils/format";
import { ModalConfirmacao } from "@/components/ModalConfirmacao";
import SecaoCriarRegra from "@/components/SecaoCriarRegra";

interface FormEditarValorProps {
  transacaoId: number;
  valorAtual: number;
  valorOriginal?: number;
  categoriaAtual: string;
  descricao: string;
  queryString: string;
}

export default function FormEditarValor({
  transacaoId,
  valorAtual,
  valorOriginal,
  categoriaAtual,
  descricao,
  queryString,
}: FormEditarValorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [novoValor, setNovoValor] = useState(valorAtual.toString());
  const [criarRegra, setCriarRegra] = useState(false);
  const [criterio, setCriterio] = useState<CriterioTipo>(
    CriterioTipo.CATEGORIA
  );
  const [nomeRegra, setNomeRegra] = useState("");
  const [criterioValor, setCriterioValor] = useState("");
  const [regraParaAplicar, setRegraParaAplicar] = useState<{
    id: number;
    nome: string;
  } | null>(null);

  const baseValor = valorOriginal ?? valorAtual;
  const valorNumerico = parseFloat(novoValor || "0");
  const percentualAlteracao = (valorNumerico / baseValor) * 100;

  useEffect(() => {
    // Inicializa o campo de descrição quando mudar para critério baseado em descrição
    if (
      criterio === CriterioTipo.DESCRICAO_EXATA ||
      criterio === CriterioTipo.DESCRICAO_CONTEM
    ) {
      setCriterioValor(descricao);
    } else {
      setCriterioValor("");
    }
  }, [criterio, descricao]);
  const foiEditado =
    valorOriginal !== undefined && valorOriginal !== valorAtual;

  const aplicarPercentual = (percentual: number) => {
    const novoVal = (baseValor * percentual) / 100;
    setNovoValor(novoVal.toFixed(2));
  };

  const gerarNomePadraoRegra = () => {
    const percentual = ((valorNumerico / baseValor) * 100).toFixed(1);
    if (criterio === CriterioTipo.CATEGORIA) {
      return `Aplicar ${percentual}% do valor em transações de "${categoriaAtual}"`;
    }
    return `Aplicar ${percentual}% do valor em transações com "${criterioValor}"`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(novoValor);

    if (isNaN(valor) || valor < 0) {
      toast.error("Digite um valor válido (não pode ser negativo)");
      return;
    }

    if (
      criarRegra &&
      (criterio === CriterioTipo.DESCRICAO_EXATA || criterio === CriterioTipo.DESCRICAO_CONTEM) &&
      !criterioValor.trim()
    ) {
      toast.error("Digite o valor do critério");
      return;
    }

    startTransition(async () => {
      try {
        await atualizarValorAction(transacaoId, valor);

        if (criarRegra) {
          const valorCriterio =
            criterio === CriterioTipo.CATEGORIA
              ? categoriaAtual
              : criterioValor;

          const regra = await criarRegraAction({
            nome: nomeRegra.trim() || gerarNomePadraoRegra(),
            tipo_acao: TipoAcao.ALTERAR_VALOR,
            criterio_tipo: criterio,
            criterio_valor: valorCriterio,
            acao_valor: percentualAlteracao.toFixed(2),
          });

          toast.success("Valor atualizado e regra criada!");
          setRegraParaAplicar({ id: regra.id, nome: regra.nome });
        } else {
          toast.success("Valor atualizado!");
          router.push(`/transacao/${transacaoId}?${queryString}`);
        }
      } catch (error) {
        console.error("Erro ao atualizar valor:", error);
        toast.error("Erro ao atualizar valor");
      }
    });
  };

  const handleRestaurar = async () => {
    if (valorOriginal === undefined) return;

    startTransition(async () => {
      try {
        await restaurarValorOriginalAction(transacaoId);
        toast.success("Valor original restaurado!");
        router.push(`/transacao/${transacaoId}?${queryString}`);
      } catch (error) {
        console.error("Erro ao restaurar valor:", error);
        toast.error("Erro ao restaurar valor original");
      }
    });
  };

  const handleAplicarRegraRetroativamente = () => {
    if (!regraParaAplicar) return;

    startTransition(async () => {
      try {
        const resultado = await aplicarRegraRetroativamenteAction(
          regraParaAplicar.id
        );
        toast.success(
          `✅ Regra aplicada! ${resultado.total_modificado} transações atualizadas.`
        );
        setRegraParaAplicar(null);
        router.push(`/transacao/${transacaoId}?${queryString}`);
      } catch (error) {
        console.error("Erro ao aplicar regra:", error);
        toast.error("Erro ao aplicar regra");
        setRegraParaAplicar(null);
      }
    });
  };

  const handleCancelarAplicacao = () => {
    setRegraParaAplicar(null);
    router.push(`/transacao/${transacaoId}?${queryString}`);
  };

  return (
    <>
      <div className="card-premium">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#2d2d2d] mb-6 flex items-center gap-3">
            <span className="text-3xl">💰</span>
            Alterar Valor
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input de Valor */}
            <div>
              <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
                Novo Valor *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8378] font-medium">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  disabled={isPending}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#d4c5b9] bg-white text-[#2d2d2d] font-medium text-lg focus:border-[#156064] focus:outline-none transition-colors disabled:opacity-50"
                  required
                />
              </div>
              <p className="text-sm text-[#8b8378] mt-2">
                Novo valor: {formatarMoeda(valorNumerico)}
              </p>
            </div>

            {/* Botões de Percentual */}
            <div>
              <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
                Ou escolha um percentual do valor{" "}
                {foiEditado ? "original" : "atual"}:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => aplicarPercentual(0)}
                  disabled={isPending}
                  className="bg-gradient-to-br from-red-100 to-red-200 text-red-700 px-4 py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  0%
                  <span className="block text-xs mt-1 font-normal">
                    {formatarMoeda(0)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPercentual(50)}
                  disabled={isPending}
                  className="bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 px-4 py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  50%
                  <span className="block text-xs mt-1 font-normal">
                    {formatarMoeda(baseValor * 0.5)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPercentual(100)}
                  disabled={isPending}
                  className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 px-4 py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  100%
                  <span className="block text-xs mt-1 font-normal">
                    {formatarMoeda(baseValor)}
                  </span>
                </button>
              </div>
              <p className="text-xs text-[#8b8378] mt-3">
                💡 <strong>0%</strong> = Desativar transação |{" "}
                <strong>50%</strong> = Metade do valor | <strong>100%</strong> =
                Valor {foiEditado ? "original" : "atual"}
              </p>
            </div>

            {/* Diferença e Percentual */}
            {valorNumerico !== valorAtual && (
              <div className="bg-[#faf8f5] rounded-xl p-4 border-2 border-[#156064]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#8b8378] mb-1 uppercase tracking-wider">
                      Diferença
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        valorNumerico > valorAtual
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {valorNumerico > valorAtual ? "+" : ""}
                      {formatarMoeda(valorNumerico - valorAtual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#8b8378] mb-1 uppercase tracking-wider">
                      Percentual
                    </p>
                    <p className="text-xl font-bold text-[#156064]">
                      {((valorNumerico / baseValor) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#8b8378] mt-3">
                  {foiEditado ? "Do valor original" : "Do valor atual"}
                </p>
              </div>
            )}

            {/* Botão Restaurar Valor Original */}
            {valorOriginal !== undefined && valorOriginal !== valorAtual && (
              <div className="border-t-2 border-[#d4c5b9] pt-6">
                <button
                  type="button"
                  onClick={handleRestaurar}
                  disabled={isPending}
                  className="w-full px-6 py-3 rounded-xl font-semibold text-[#156064] bg-[#faf8f5] border-2 border-[#156064] hover:bg-[#156064] hover:text-white transition-colors disabled:opacity-50"
                >
                  🔄 Restaurar Valor Original ({formatarMoeda(valorOriginal)})
                </button>
              </div>
            )}

            {/* Seção de Criar Regra */}
            <SecaoCriarRegra
              criarRegra={criarRegra}
              setCriarRegra={setCriarRegra}
              nomeRegra={nomeRegra}
              setNomeRegra={setNomeRegra}
              criterio={criterio}
              setCriterio={setCriterio}
              criterioValor={criterioValor}
              setCriterioValor={setCriterioValor}
              categoriaAtual={categoriaAtual}
              isPending={isPending}
            >
              {/* Info adicional sobre o percentual da regra */}
              {baseValor > 0 && (
                <div className="bg-white rounded-lg p-4 border border-[#d4c5b9]">
                  <p className="text-sm text-[#2d2d2d]">
                    <span className="font-semibold">Percentual da regra: </span>
                    <span className="text-[#156064] font-bold">
                      {percentualAlteracao > 0 ? "+" : ""}
                      {percentualAlteracao.toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-xs text-[#8b8378] mt-1">
                    Este percentual será aplicado automaticamente nas transações
                    futuras
                  </p>
                </div>
              )}
            </SecaoCriarRegra>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: "linear-gradient(135deg, #156064, #0f3d3e)",
                }}
              >
                {isPending ? "Salvando..." : "Salvar Alterações"}
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/transacao/${transacaoId}?${queryString}`)
                }
                disabled={isPending}
                className="px-6 py-4 rounded-xl font-semibold text-[#2d2d2d] bg-[#faf8f5] border-2 border-[#d4c5b9] hover:bg-[#f0ebe5] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Confirmação - Aplicar Regra Retroativamente */}
      {regraParaAplicar && (
        <ModalConfirmacao
          titulo="Aplicar Regra em Transações Existentes?"
          mensagem={`A regra "${regraParaAplicar.nome}" foi criada com sucesso!\n\nDeseja aplicá-la agora em todas as transações existentes que correspondem aos critérios? Isso pode modificar várias transações de uma vez.`}
          onConfirmar={handleAplicarRegraRetroativamente}
          onCancelar={handleCancelarAplicacao}
          textoBotaoConfirmar="Sim, Aplicar Agora"
          textoBotaoCancelar="Não, Aplicar Só nas Futuras"
          isPending={isPending}
        />
      )}
    </>
  );
}
