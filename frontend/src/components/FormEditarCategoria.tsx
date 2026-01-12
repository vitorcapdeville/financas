"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { atualizarCategoriaAction } from "@/app/transacao/[id]/actions";
import {
  criarRegraAction,
  aplicarRegraRetroativamenteAction,
} from "@/app/regras/actions";
import { transacoesService } from "@/services/api.service";
import { CriterioTipo, TipoAcao } from "@/types";
import { ModalConfirmacao } from "@/components/ModalConfirmacao";
import SecaoCriarRegra from "@/components/SecaoCriarRegra";

const CATEGORIAS_SUGESTAO = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Saúde",
  "Moradia",
  "Educação",
  "Salário",
  "Investimentos",
];

interface FormEditarCategoriaProps {
  transacaoId: number;
  categoriaAtual: string;
  descricao: string;
  queryString: string;
}

export default function FormEditarCategoria({
  transacaoId,
  categoriaAtual,
  descricao,
  queryString,
}: FormEditarCategoriaProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [novaCategoria, setNovaCategoria] = useState(categoriaAtual);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [modoCustom, setModoCustom] = useState(false);
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

  useEffect(() => {
    carregarCategorias();
  }, []);

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

  const carregarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const data = await transacoesService.listarCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const gerarNomePadraoRegra = () => {
    if (criterio === CriterioTipo.CATEGORIA) {
      return `Aplicar categoria "${novaCategoria}" quando categoria for "${categoriaAtual}"`;
    }
    return `Aplicar categoria "${novaCategoria}" em transações com "${criterioValor}"`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaCategoria || !novaCategoria.trim()) {
      toast.error("Selecione ou digite uma categoria");
      return;
    }

    if (
      criarRegra &&
      criterio === CriterioTipo.DESCRICAO_CONTEM &&
      !criterioValor.trim()
    ) {
      toast.error("Digite o valor do critério");
      return;
    }

    startTransition(async () => {
      try {
        await atualizarCategoriaAction(transacaoId, novaCategoria.trim());

        if (criarRegra) {
          const valorCriterio =
            criterio === CriterioTipo.CATEGORIA
              ? categoriaAtual
              : criterioValor;

          const regra = await criarRegraAction({
            nome: nomeRegra.trim() || gerarNomePadraoRegra(),
            tipo_acao: TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo: criterio,
            criterio_valor: valorCriterio,
            acao_valor: novaCategoria.trim(),
          });

          toast.success("Categoria atualizada e regra criada!");
          setRegraParaAplicar({ id: regra.id, nome: regra.nome });
        } else {
          toast.success("Categoria atualizada!");
          router.push(`/transacao/${transacaoId}?${queryString}`);
        }
      } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        toast.error("Erro ao atualizar categoria");
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
            <span className="text-3xl">🏷️</span>
            Alterar Categoria
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Toggle entre lista e custom */}
            <div>
              <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
                Como deseja alterar?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModoCustom(false)}
                  disabled={isPending}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    !modoCustom
                      ? "bg-gradient-to-r from-[#156064] to-[#0f3d3e] text-white shadow-md"
                      : "bg-[#faf8f5] text-[#2d2d2d] border-2 border-[#d4c5b9] hover:bg-[#f0ebe5]"
                  }`}
                >
                  Selecionar Existente
                </button>
                <button
                  type="button"
                  onClick={() => setModoCustom(true)}
                  disabled={isPending}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    modoCustom
                      ? "bg-gradient-to-r from-[#156064] to-[#0f3d3e] text-white shadow-md"
                      : "bg-[#faf8f5] text-[#2d2d2d] border-2 border-[#d4c5b9] hover:bg-[#f0ebe5]"
                  }`}
                >
                  Nova Categoria
                </button>
              </div>
            </div>

            {/* Modo: Selecionar da lista */}
            {!modoCustom && (
              <div>
                <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
                  Categorias Existentes
                </label>
                {loadingCategorias ? (
                  <div className="text-center py-8 bg-[#faf8f5] rounded-xl border-2 border-[#d4c5b9]">
                    <p className="text-[#8b8378]">Carregando categorias...</p>
                  </div>
                ) : categorias.length === 0 ? (
                  <div className="bg-[#faf8f5] rounded-xl border-2 border-[#d4c5b9] p-6">
                    <p className="text-[#8b8378] text-center mb-4">
                      Nenhuma categoria cadastrada. Crie uma nova!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {CATEGORIAS_SUGESTAO.map((sugestao) => (
                        <button
                          key={sugestao}
                          type="button"
                          onClick={() => {
                            setModoCustom(true);
                            setNovaCategoria(sugestao);
                          }}
                          disabled={isPending}
                          className="px-3 py-1 bg-white border-2 border-[#d4c5b9] rounded-full text-sm text-[#2d2d2d] hover:bg-[#156064] hover:text-white hover:border-[#156064] transition-colors"
                        >
                          {sugestao}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {categorias.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNovaCategoria(cat)}
                        disabled={isPending}
                        className={`w-full text-left px-5 py-3 rounded-xl font-medium transition-all ${
                          novaCategoria === cat
                            ? "bg-gradient-to-r from-[#156064] to-[#0f3d3e] text-white shadow-md"
                            : "bg-[#faf8f5] text-[#2d2d2d] border-2 border-[#d4c5b9] hover:bg-[#f0ebe5]"
                        }`}
                      >
                        <span>{cat}</span>
                        {cat === categoriaAtual && (
                          <span className="ml-2 text-xs opacity-75">
                            (atual)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modo: Nova categoria (custom) */}
            {modoCustom && (
              <div>
                <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
                  Digite a Nova Categoria *
                </label>
                <input
                  type="text"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  disabled={isPending}
                  placeholder="Ex: Alimentação, Transporte, Lazer..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#d4c5b9] bg-white text-[#2d2d2d] placeholder-[#8b8378] focus:border-[#156064] focus:outline-none transition-colors disabled:opacity-50"
                  autoFocus
                  required
                />

                {/* Sugestões rápidas */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                    Sugestões:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS_SUGESTAO.map((sugestao) => (
                      <button
                        key={sugestao}
                        type="button"
                        onClick={() => setNovaCategoria(sugestao)}
                        disabled={isPending}
                        className="px-3 py-1 bg-white border-2 border-[#d4c5b9] rounded-full text-sm text-[#2d2d2d] hover:bg-[#156064] hover:text-white hover:border-[#156064] transition-colors disabled:opacity-50"
                      >
                        {sugestao}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preview da nova categoria */}
            {novaCategoria && novaCategoria !== categoriaAtual && (
              <div className="bg-[#faf8f5] rounded-xl p-4 border-2 border-[#156064]">
                <p className="text-xs font-semibold text-[#8b8378] mb-1 uppercase tracking-wider">
                  Nova Categoria:
                </p>
                <p className="text-xl font-bold text-[#156064]">
                  {novaCategoria}
                </p>
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
            />

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
