import { transacoesServerService } from '@/services/api.server';
import { formatarData, formatarMoeda } from '@/utils/format';
import { calcularPeriodoCustomizado, extrairPeriodoDaURL } from '@/utils/periodo';
import FiltrosPeriodo from '@/components/FiltrosPeriodo';
import FiltroTags from '@/components/FiltroTags';
import Link from 'next/link';
import BotaoVoltar from '@/components/BotaoVoltar';

interface TransacoesPageProps {
  searchParams: Promise<{
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
    tags?: string;
  }>;
}

export default async function TransacoesPage(props: TransacoesPageProps) {
  // Next.js 16: searchParams é uma Promise que precisa ser awaited
  const searchParams = await props.searchParams;
  const { periodo, mes, ano, diaInicio, criterio } = extrairPeriodoDaURL(searchParams);
  const { data_inicio, data_fim } = calcularPeriodoCustomizado(mes, ano, diaInicio);
  
  // Constrói query string preservando período, diaInicio, criterio, tags e origem
  const queryParams = new URLSearchParams();
  if (periodo) queryParams.set('periodo', periodo);
  if (diaInicio) queryParams.set('diaInicio', diaInicio.toString());
  if (criterio) queryParams.set('criterio', criterio);
  if (searchParams.tags) queryParams.set('tags', searchParams.tags);
  queryParams.set('origem', 'transacoes');
  const queryString = queryParams.toString();
  
  // Busca transações no servidor
  let transacoes: import('@/types').Transacao[];
  try {
    transacoes = await transacoesServerService.listar({ 
      data_inicio, 
      data_fim,
      tags: searchParams.tags,
      criterio_data_transacao: criterio
    });
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    transacoes = [];
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-4">
          <BotaoVoltar />
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Todas as Transações
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie suas transações financeiras
          </p>
        </header>

        {/* Filtros */}
        <div className="mb-4">
          <FiltrosPeriodo />
        </div>

        {/* Filtro de Tags */}
        <FiltroTags />

        {/* Lista de Transações */}
        {transacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              Nenhuma transação encontrada
            </p>
            <Link
              href="/importar"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Importar Dados
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Transações ({transacoes.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {transacoes.map((transacao) => (
                <Link
                  key={transacao.id}
                  href={`/transacao/${transacao.id}?${queryString}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {transacao.descricao}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transacao.tipo === 'entrada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <span className="font-medium text-xs text-gray-400">
                            {transacao.data_fatura ? 'Transação:' : ''}
                          </span>{' '}
                          {formatarData(transacao.data)}
                        </span>
                        {transacao.data_fatura && (
                          <>
                            <span>•</span>
                            <span>
                              <span className="font-medium text-xs text-gray-400">Fatura:</span>{' '}
                              {formatarData(transacao.data_fatura)}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                          {transacao.categoria || 'Sem categoria'}
                        </span>
                        <span>•</span>
                        <span className="text-xs">
                          {transacao.origem === 'manual'
                            ? 'Manual'
                            : transacao.origem === 'extrato_bancario'
                            ? 'Extrato'
                            : 'Fatura'}
                        </span>
                      </div>
                      {/* Tags */}
                      {transacao.tags && transacao.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {transacao.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: tag.cor || '#3B82F6' }}
                            >
                              {tag.nome}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`text-lg font-bold ${
                          transacao.tipo === 'entrada'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transacao.tipo === 'entrada' ? '+' : '-'}
                        {formatarMoeda(transacao.valor)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Total de {transacoes.length} transaç
                  {transacoes.length === 1 ? 'ão' : 'ões'}
                </span>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Entradas</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatarMoeda(
                        transacoes
                          .filter((t) => t.tipo === 'entrada')
                          .reduce((sum, t) => sum + t.valor, 0)
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Saídas</p>
                    <p className="text-sm font-semibold text-red-600">
                      {formatarMoeda(
                        transacoes
                          .filter((t) => t.tipo === 'saida')
                          .reduce((sum, t) => sum + t.valor, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
