'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CriterioTipo } from '@/types';

interface ModalEditarValorProps {
  isOpen: boolean;
  onClose: () => void;
  valorAtual: number;
  valorOriginal?: number; // Valor original antes de edições
  descricaoTransacao: string; // Para criar regras
  categoriaAtual?: string; // Para critério de categoria
  onSalvar: (
    novoValor: number,
    dadosRegra?: { criterio: CriterioTipo; nomeRegra: string; percentual: number; criterio_valor: string }
  ) => Promise<void>;
  onRestaurar?: () => Promise<void>; // Callback para restaurar valor original
  isPending: boolean;
}

export default function ModalEditarValor({
  isOpen,
  onClose,
  valorAtual,
  valorOriginal,
  descricaoTransacao,
  categoriaAtual,
  onSalvar,
  onRestaurar,
  isPending,
}: ModalEditarValorProps) {
  const [valor, setValor] = useState(valorAtual);
  const [criarRegra, setCriarRegra] = useState(false);
  const [criterioRegra, setCriterioRegra] = useState<CriterioTipo>(CriterioTipo.DESCRICAO_EXATA);
  const [nomeRegra, setNomeRegra] = useState('');
  const [valorCriterio, setValorCriterio] = useState(descricaoTransacao);

  if (!isOpen) return null;

  const aplicarPercentual = (percentual: number) => {
    // Usa valor original se disponível, senão usa valor atual
    const baseValor = valorOriginal ?? valorAtual;
    const novoValor = (baseValor * percentual) / 100;
    setValor(Number(novoValor.toFixed(2)));
  };

  const gerarNomePadraoRegra = () => {
    const baseValor = valorOriginal ?? valorAtual;
    const percentualAtual = ((valor / baseValor) * 100).toFixed(1);
    
    let descricaoCriterio = '';
    if (criterioRegra === CriterioTipo.DESCRICAO_CONTEM) {
      descricaoCriterio = `contém "${valorCriterio}"`;
    } else if (criterioRegra === CriterioTipo.DESCRICAO_EXATA) {
      descricaoCriterio = `exata "${valorCriterio}"`;
    } else if (criterioRegra === CriterioTipo.CATEGORIA && categoriaAtual) {
      descricaoCriterio = `categoria "${categoriaAtual}"`;
    }
    
    return `Reduzir ${percentualAtual}% em transações com ${descricaoCriterio}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (criarRegra && !valorCriterio.trim()) {
      toast.error('Digite o valor do critério');
      return;
    }
    
    const baseValor = valorOriginal ?? valorAtual;
    const percentual = (valor / baseValor) * 100;
    
    const dadosRegra = criarRegra
      ? { 
          criterio: criterioRegra, 
          nomeRegra: nomeRegra.trim() || gerarNomePadraoRegra(), 
          percentual,
          criterio_valor: valorCriterio.trim()
        }
      : undefined;
    
    await onSalvar(valor, dadosRegra);
  };

  const handleRestaurar = async () => {
    if (!onRestaurar) return;
    await onRestaurar();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const baseValor = valorOriginal ?? valorAtual;
  const foiEditado = valorOriginal !== undefined && valorOriginal !== valorAtual;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Alterar Valor</h2>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-500">
              Valor atual: {formatarMoeda(valorAtual)}
            </p>
            {foiEditado && valorOriginal && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-amber-600">
                  Valor original: {formatarMoeda(valorOriginal)}
                </p>
                {onRestaurar && (
                  <button
                    type="button"
                    onClick={handleRestaurar}
                    className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition-colors"
                    disabled={isPending}
                  >
                    Restaurar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Input de Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isPending}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Novo valor: {formatarMoeda(valor)}
              </p>
            </div>

            {/* Botões de Percentual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ou escolha um percentual:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => aplicarPercentual(0)}
                  className="bg-red-100 text-red-700 px-4 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  disabled={isPending}
                >
                  0%
                  <span className="block text-xs mt-1">
                    {formatarMoeda(0)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPercentual(50)}
                  className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
                  disabled={isPending}
                >
                  50%
                  <span className="block text-xs mt-1">
                    {formatarMoeda(valorAtual * 0.5)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPercentual(100)}
                  className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                  disabled={isPending}
                >
                  100%
                  <span className="block text-xs mt-1">
                    {formatarMoeda(baseValor)}
                  </span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                0% = Desativar transação (valor zerado) | 50% = Metade | 100% = Valor {foiEditado ? 'original' : 'atual'}
              </p>
            </div>

            {/* Diferença */}
            {valor !== valorAtual && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Diferença
                </p>
                <p
                  className={`text-lg font-bold ${
                    valor > valorAtual ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {valor > valorAtual ? '+' : ''}
                  {formatarMoeda(valor - valorAtual)}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Percentual: {((valor / baseValor) * 100).toFixed(1)}% do valor {foiEditado ? 'original' : 'atual'}
                </p>
              </div>
            )}

            {/* Opção de Criar Regra */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criarRegra}
                  onChange={(e) => setCriarRegra(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                  disabled={isPending}
                />
                <span className="text-sm font-medium text-gray-900">
                  🔁 Criar regra para aplicar automaticamente
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
                      onChange={(e) => setCriterioRegra(e.target.value as CriterioTipo)}
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
                    <p className="font-medium mb-1">ℹ️ Como funciona:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>A regra aplicará <strong>{((valor / baseValor) * 100).toFixed(1)}%</strong> do valor original</li>
                      <li>Valor original é preservado e usado como base de cálculo</li>
                      <li>Aplicada automaticamente em transações futuras</li>
                      <li>Pode ser aplicada retroativamente</li>
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
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-green-400"
              disabled={isPending || valor === valorAtual}
            >
              {isPending ? 'Salvando...' : criarRegra ? 'Salvar e Criar Regra' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
