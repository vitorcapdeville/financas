'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Tag, CriterioTipo } from '@/types';

interface ModalEditarTagsProps {
  isOpen: boolean;
  onClose: () => void;
  transacaoId: number;
  tagsAtuais: Tag[];
  todasTags: Tag[];
  descricaoTransacao: string;
  categoriaAtual?: string;
  onAdicionarTags: (
    tagsIds: number[],
    dadosRegra?: { criterio: CriterioTipo; nomeRegra: string; tags: number[]; criterio_valor: string }
  ) => Promise<void>;
  onRemoverTag: (tagId: number) => Promise<void>;
  isPending: boolean;
}

export default function ModalEditarTags({
  isOpen,
  onClose,
  transacaoId,
  tagsAtuais,
  todasTags,
  descricaoTransacao,
  categoriaAtual,
  onAdicionarTags,
  onRemoverTag,
  isPending,
}: ModalEditarTagsProps) {
  const [tagsParaAdicionar, setTagsParaAdicionar] = useState<number[]>([]);
  const [criarRegra, setCriarRegra] = useState(false);
  const [criterioRegra, setCriterioRegra] = useState<CriterioTipo>(CriterioTipo.DESCRICAO_EXATA);
  const [nomeRegra, setNomeRegra] = useState('');
  const [valorCriterio, setValorCriterio] = useState(descricaoTransacao);

  if (!isOpen) return null;

  const tagsDisponiveis = todasTags.filter(
    (tag) => !tagsAtuais.some((t) => t.id === tag.id)
  );

  const toggleTag = (tagId: number) => {
    setTagsParaAdicionar((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const gerarNomePadraoRegra = () => {
    const tagsNomes = tagsParaAdicionar
      .map(tagId => todasTags.find(t => t.id === tagId)?.nome)
      .filter(Boolean)
      .join(', ');
    
    let descricaoCriterio = '';
    if (criterioRegra === CriterioTipo.DESCRICAO_CONTEM) {
      descricaoCriterio = `contém "${valorCriterio}"`;
    } else if (criterioRegra === CriterioTipo.DESCRICAO_EXATA) {
      descricaoCriterio = `exata "${valorCriterio}"`;
    } else if (criterioRegra === CriterioTipo.CATEGORIA && categoriaAtual) {
      descricaoCriterio = `categoria "${categoriaAtual}"`;
    }
    
    return `Adicionar ${tagsNomes} em transações com ${descricaoCriterio}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tagsParaAdicionar.length === 0) {
      toast.error('Selecione ao menos uma tag');
      return;
    }

    if (criarRegra && !valorCriterio.trim()) {
      toast.error('Digite o valor do critério');
      return;
    }

    const dadosRegra = criarRegra
      ? {
          criterio: criterioRegra,
          nomeRegra: nomeRegra.trim() || gerarNomePadraoRegra(),
          tags: tagsParaAdicionar,
          criterio_valor: valorCriterio.trim(),
        }
      : undefined;

    await onAdicionarTags(tagsParaAdicionar, dadosRegra);
    
    // Limpar seleção após adicionar
    setTagsParaAdicionar([]);
    setCriarRegra(false);
    setNomeRegra('');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Tags</h2>
          <p className="text-sm text-gray-500 mt-1">
            {tagsAtuais.length} tag(s) atual(is)
          </p>
        </div>

        <div className="p-6">
          {/* SEÇÃO 1: Tags Atuais (Remover) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Tags Atuais
            </h3>
            {tagsAtuais.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma tag associada</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tagsAtuais.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white"
                    style={{ backgroundColor: tag.cor || '#3B82F6' }}
                  >
                    {tag.nome}
                    <button
                      type="button"
                      onClick={() => onRemoverTag(tag.id)}
                      disabled={isPending}
                      className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEÇÃO 2: Adicionar Novas Tags */}
          {tagsDisponiveis.length > 0 ? (
            <form onSubmit={handleSubmit}>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Adicionar Tags
                </h3>

                {/* Grid de tags disponíveis */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {tagsDisponiveis.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        tagsParaAdicionar.includes(tag.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      disabled={isPending}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.cor || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {tag.nome}
                      </span>
                      {tagsParaAdicionar.includes(tag.id) && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                {tagsParaAdicionar.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Tags selecionadas ({tagsParaAdicionar.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tagsParaAdicionar.map((tagId) => {
                        const tag = todasTags.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tag.id}
                            className="px-3 py-1 rounded-full text-white text-sm"
                            style={{ backgroundColor: tag.cor || '#3B82F6' }}
                          >
                            {tag.nome}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* SEÇÃO 3: Opção de Criar Regra */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criarRegra}
                      onChange={(e) => setCriarRegra(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                      disabled={isPending}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      🔁 Criar regra para adicionar estas tags automaticamente
                    </span>
                  </label>

                  {criarRegra && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          Nome da regra:
                        </label>
                        <input
                          type="text"
                          value={nomeRegra}
                          onChange={(e) => setNomeRegra(e.target.value)}
                          className="w-full border border-blue-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(Opcional - será gerado automaticamente)"
                          disabled={isPending}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          Aplicar em transações que:
                        </label>
                        <select
                          value={criterioRegra}
                          onChange={(e) =>
                            setCriterioRegra(e.target.value as CriterioTipo)
                          }
                          className="w-full border border-blue-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isPending}
                        >
                          <option value={CriterioTipo.DESCRICAO_CONTEM}>
                            Descrição contém
                          </option>
                          <option value={CriterioTipo.DESCRICAO_EXATA}>
                            Descrição exata = "{descricaoTransacao}"
                          </option>
                          {categoriaAtual && (
                            <option value={CriterioTipo.CATEGORIA}>
                              Categoria = "{categoriaAtual}"
                            </option>
                          )}
                        </select>
                      </div>

                      {/* Input do valor do critério apenas para 'descrição contém' */}
                      {criterioRegra === CriterioTipo.DESCRICAO_CONTEM && (
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Texto que a descrição deve conter:
                          </label>
                          <input
                            type="text"
                            value={valorCriterio}
                            onChange={(e) => setValorCriterio(e.target.value)}
                            className="w-full border border-blue-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Digite o texto do critério..."
                            disabled={isPending}
                          />
                        </div>
                      )}

                      <div className="text-sm text-blue-800 bg-blue-100 rounded p-3">
                        <p className="font-medium mb-1">ℹ️ A regra será:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>
                            Aplicada em transações futuras automaticamente
                          </li>
                          <li>
                            Pode ser aplicada retroativamente nas transações
                            existentes
                          </li>
                          <li>Gerenciada na página de Regras</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  disabled={isPending}
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  disabled={isPending || tagsParaAdicionar.length === 0}
                >
                  {isPending
                    ? 'Salvando...'
                    : `Adicionar ${tagsParaAdicionar.length} Tag(s)${criarRegra ? ' e Criar Regra' : ''}`}
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-500 text-sm text-center">
                Todas as tags disponíveis já foram adicionadas
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-4 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                disabled={isPending}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
