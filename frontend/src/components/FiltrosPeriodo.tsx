'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CriterioDataTransacao } from '@/types';

export default function FiltrosPeriodo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtém valores da URL ou usa defaults
  const periodoAtual = searchParams.get('periodo') || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const diaInicioAtual = parseInt(searchParams.get('diaInicio') || '1');
  const criterioData = (searchParams.get('criterio') || 'data_transacao') as CriterioDataTransacao;

  const mes = parseInt(periodoAtual.split('-')[1]);
  const ano = parseInt(periodoAtual.split('-')[0]);

  const handlePeriodoChange = (novoPeriodo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('periodo', novoPeriodo);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex gap-6 items-start flex-wrap">
        {/* Seletor de Período */}
        <div className="flex-1 min-w-[200px] max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <input
            type="month"
            value={periodoAtual}
            onChange={(e) => handlePeriodoChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Visualização do Período */}
        <div className="flex-1 min-w-[250px]">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Período visualizado
          </p>
          <p className="text-sm text-gray-900">
            <span className="font-semibold">
              {new Date(ano, mes - 1, diaInicioAtual).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} até {' '}
              {new Date(ano, mes, diaInicioAtual - 1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {criterioData === CriterioDataTransacao.DATA_TRANSACAO 
              ? '📅 Gastos do cartão mostrados na data da transação'
              : '💳 Gastos do cartão mostrados na data da fatura'}
          </p>
        </div>
      </div>
    </div>
  );
}
