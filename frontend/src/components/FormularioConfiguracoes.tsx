'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { salvarDiaInicioAction, salvarCriterioAction } from '@/app/configuracoes/actions';
import { CriterioDataTransacao } from '@/types';

interface FormularioConfiguracoesProps {
  diaInicioPeriodo: number;
  criterioDataTransacao: string;
}

export default function FormularioConfiguracoes({ 
  diaInicioPeriodo, 
  criterioDataTransacao 
}: FormularioConfiguracoesProps) {
  const [isPending, startTransition] = useTransition();
  const [diaAtual, setDiaAtual] = useState(diaInicioPeriodo);
  const [criterioAtual, setCriterioAtual] = useState(criterioDataTransacao);

  async function handleSalvarDia(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dia = parseInt(formData.get('diaInicioPeriodo') as string);

    startTransition(async () => {
      try {
        await salvarDiaInicioAction(dia);
        setDiaAtual(dia);
        toast.success('Dia de início salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar dia de início:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao salvar. Tente novamente.');
      }
    });
  }

  async function handleSalvarCriterio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const criterio = formData.get('criterio_data_transacao') as string;

    startTransition(async () => {
      try {
        await salvarCriterioAction(criterio);
        setCriterioAtual(criterio);
        toast.success('Critério de data salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar critério:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao salvar. Tente novamente.');
      }
    });
  }

  // Gera opções de 1 a 28
  const diasOpcoes = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Configuração: Dia de Início do Período */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Dia de Início do Período
        </h2>
        <p className="text-gray-600 mb-6">
          Define o dia de início do período mensal para cálculo de entradas, saídas e saldo.
          Por exemplo, se você escolher o dia 25, o período será de 25 de um mês até 24 do mês seguinte.
        </p>
        
        <form onSubmit={handleSalvarDia} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dia do mês (1-28)
            </label>
            <select
              name="diaInicioPeriodo"
              defaultValue={diaAtual}
              className="w-full max-w-xs border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            >
              {diasOpcoes.map(dia => (
                <option key={dia} value={dia}>
                  Dia {dia}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? 'Salvando...' : 'Salvar Dia de Início'}
          </button>
        </form>
      </div>

      {/* Configuração: Critério de Data para Transações */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Critério de Data para Gastos no Cartão de Crédito
        </h2>
        <p className="text-gray-600 mb-6">
          Define qual data será usada para agrupar gastos do cartão de crédito no dashboard.
          <strong> Data da Transação</strong>: agrupa pela data em que a compra foi realizada.
          <strong> Data da Fatura</strong>: agrupa pela data de fechamento/pagamento da fatura.
        </p>
        
        <form onSubmit={handleSalvarCriterio} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="criterio_data_transacao"
                value={CriterioDataTransacao.DATA_TRANSACAO}
                defaultChecked={criterioAtual === CriterioDataTransacao.DATA_TRANSACAO}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                disabled={isPending}
              />
              <span className="text-gray-900">
                <strong>Data da Transação</strong> - Mostrar gastos no período em que foram realizados
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="criterio_data_transacao"
                value={CriterioDataTransacao.DATA_FATURA}
                defaultChecked={criterioAtual === CriterioDataTransacao.DATA_FATURA}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                disabled={isPending}
              />
              <span className="text-gray-900">
                <strong>Data da Fatura</strong> - Mostrar gastos no período da fatura (fechamento/pagamento)
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? 'Salvando...' : 'Salvar Critério de Data'}
          </button>
        </form>
      </div>
    </div>
  );
}
