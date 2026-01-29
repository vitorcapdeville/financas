"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  adicionarTagAction,
  removerTagAction,
} from "@/app/transacao/[id]/actions";
import {
  criarRegraAction,
  aplicarRegraRetroativamenteAction,
} from "@/app/regras/actions";
import { CriterioTipo, TipoAcao, Tag } from "@/types";
import { ModalConfirmacao } from "@/components/ModalConfirmacao";
import SecaoCriarRegra from "@/components/SecaoCriarRegra";

interface FormGerenciarTagsProps {
  transacaoId: number;
  tagsAtuais: Tag[];
  todasTags: Tag[];
  categoriaAtual: string;
  descricao: string;
  queryString: string;
}

export default function FormGerenciarTags({
  transacaoId,
  tagsAtuais,
  todasTags,
  categoriaAtual,
  descricao,
  queryString,
}: FormGerenciarTagsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tagsSelecionadas, setTagsSelecionadas] = useState<number[]>([]);
  const [criarRegra, setCriarRegra] = useState(false);
  const [criterio, setCriterio] = useState<CriterioTipo>(
    CriterioTipo.CATEGORIA,
  );
  const [nomeRegra, setNomeRegra] = useState("");
  const [criterioValor, setCriterioValor] = useState("");
  const [regraParaAplicar, setRegraParaAplicar] = useState<{
    id: number;
    nome: string;
  } | null>(null);

  const tagsDisponiveis = todasTags.filter(
    (tag) => !tagsAtuais.some((t) => t.id === tag.id),
  );

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

  const handleToggleTag = (tagId: number) => {
    setTagsSelecionadas((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleRemoverTag = async (tagId: number) => {
    startTransition(async () => {
      try {
        await removerTagAction(transacaoId, tagId);
        toast.success("Tag removida!");
        // Força o recarregamento da página para atualizar a lista de tags
        router.push(`/transacao/${transacaoId}/tags?${queryString}`);
        router.refresh();
      } catch (error) {
        console.error("Erro ao remover tag:", error);
        toast.error("Erro ao remover tag");
      }
    });
  };

  const gerarNomePadraoRegra = () => {
    const nomesTags = tagsSelecionadas
      .map((id) => todasTags.find((t) => t.id === id)?.nome)
      .filter(Boolean)
      .join(", ");
    if (criterio === CriterioTipo.CATEGORIA) {
      return `Adicionar tags [${nomesTags}] em transações de "${categoriaAtual}"`;
    }
    return `Adicionar tags [${nomesTags}] em transações com "${criterioValor}"`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tagsSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma tag");
      return;
    }

    if (
      criarRegra &&
      (criterio === CriterioTipo.DESCRICAO_EXATA ||
        criterio === CriterioTipo.DESCRICAO_CONTEM) &&
      !criterioValor.trim()
    ) {
      toast.error("Digite o valor do critério");
      return;
    }

    startTransition(async () => {
      try {
        // Adicionar todas as tags selecionadas
        for (const tagId of tagsSelecionadas) {
          await adicionarTagAction(transacaoId, tagId);
        }

        if (criarRegra) {
          const valorCriterio =
            criterio === CriterioTipo.CATEGORIA
              ? categoriaAtual
              : criterioValor;

          const regra = await criarRegraAction({
            nome: nomeRegra.trim() || gerarNomePadraoRegra(),
            tipo_acao: TipoAcao.ADICIONAR_TAGS,
            criterio_tipo: criterio,
            criterio_valor: valorCriterio,
            acao_valor: "placeholder", // Backend vai substituir
            tag_ids: tagsSelecionadas,
          });

          toast.success(
            `${tagsSelecionadas.length} tag(s) adicionada(s) e regra criada!`,
          );
          setRegraParaAplicar({ id: regra.id, nome: regra.nome });
        } else {
          toast.success(`${tagsSelecionadas.length} tag(s) adicionada(s)!`);
          router.push(`/transacao/${transacaoId}?${queryString}`);
        }
      } catch (error) {
        console.error("Erro ao adicionar tags:", error);
        toast.error("Erro ao adicionar tags");
      }
    });
  };

  const handleAplicarRegraRetroativamente = () => {
    if (!regraParaAplicar) return;

    startTransition(async () => {
      try {
        const resultado = await aplicarRegraRetroativamenteAction(
          regraParaAplicar.id,
        );
        toast.success(
          `✅ Regra aplicada! ${resultado.total_modificado} transações atualizadas.`,
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tags Atuais */}
        <div className="card-premium">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#2d2d2d] mb-6 flex items-center gap-3">
              <span className="text-3xl">🏷️</span>
              Tags Atuais
            </h2>

            {tagsAtuais.length > 0 ? (
              <div className="space-y-3">
                {tagsAtuais.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-[#d4c5b9] bg-[#faf8f5] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.cor || "#156064" }}
                      ></div>
                      <span className="text-base text-[#2d2d2d] font-medium">
                        {tag.nome}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoverTag(tag.id)}
                      disabled={isPending}
                      className="px-3 py-1 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#8b8378] text-base italic">
                  Nenhuma tag associada
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Adicionar Tags */}
        <div className="card-premium">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#2d2d2d] mb-6 flex items-center gap-3">
              <span className="text-3xl">➕</span>
              Adicionar Tags
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Lista de Tags Disponíveis */}
              <div>
                <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
                  Selecione as Tags
                </label>
                {tagsDisponiveis.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {tagsDisponiveis.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-[#d4c5b9] bg-white hover:bg-[#faf8f5] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={tagsSelecionadas.includes(tag.id)}
                          onChange={() => handleToggleTag(tag.id)}
                          disabled={isPending}
                          className="w-5 h-5 rounded border-2 border-[#d4c5b9] text-[#156064] focus:ring-2 focus:ring-[#156064] focus:ring-offset-2 disabled:opacity-50"
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.cor || "#156064" }}
                        ></div>
                        <span className="text-base text-[#2d2d2d] font-medium">
                          {tag.nome}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#faf8f5] rounded-xl border-2 border-[#d4c5b9]">
                    <p className="text-[#8b8378] text-sm">
                      Todas as tags disponíveis já estão associadas
                    </p>
                  </div>
                )}
              </div>

              {/* Opção de Criar Regra */}
              {tagsSelecionadas.length > 0 && (
                <>
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
                    {/* Preview das tags que serão aplicadas pela regra */}
                    <div className="bg-white rounded-lg p-4 border border-[#d4c5b9]">
                      <p className="text-sm text-[#2d2d2d] font-semibold mb-2">
                        Tags que serão aplicadas pela regra:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tagsSelecionadas.map((tagId) => {
                          const tag = todasTags.find((t) => t.id === tagId);
                          return tag ? (
                            <span
                              key={tag.id}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-white text-sm font-medium"
                              style={{
                                backgroundColor: tag.cor || "#156064",
                              }}
                            >
                              {tag.nome}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </SecaoCriarRegra>

                  {/* Botões de Ação */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={isPending || tagsSelecionadas.length === 0}
                      className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                      style={{
                        background: "linear-gradient(135deg, #156064, #0f3d3e)",
                      }}
                    >
                      {isPending
                        ? "Adicionando..."
                        : `Adicionar ${tagsSelecionadas.length} Tag(s)`}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/transacao/${transacaoId}?${queryString}`)
                      }
                      disabled={isPending}
                      className="px-6 py-4 rounded-xl font-semibold text-[#2d2d2d] bg-[#faf8f5] border-2 border-[#d4c5b9] hover:bg-[#f0ebe5] transition-colors disabled:opacity-50"
                    >
                      Voltar
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
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
