import { transacoesServerService } from '@/services/api.server';
import { formatarData, formatarMoeda } from '@/utils/format';
import { calcularPeriodoCustomizado, extrairPeriodoDaURL } from '@/utils/periodo';
import FiltrosPeriodo from '@/components/FiltrosPeriodo';
import FiltroTags from '@/components/FiltroTags';
import Link from 'next/link';
import BotaoVoltar from '@/components/BotaoVoltar';

interface CategoriaPageProps {
  params: Promise<{
    nome: string;
  }>;
  searchParams: Promise<{
    tipo?: 'entrada' | 'saida';
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
    tags?: string;
  }>;
}

export default async function CategoriaPage(props: CategoriaPageProps) {
  // Next.js 16: params e searchParams são Promises que precisam ser awaited
  const params = await props.params;
  const searchParams = await props.searchParams;
  const categoria = decodeURIComponent(params.nome);
  const tipo = searchParams.tipo;
  const { periodo, mes, ano, diaInicio, criterio } = extrairPeriodoDaURL(searchParams);
  const { data_inicio, data_fim } = calcularPeriodoCustomizado(mes, ano, diaInicio);
  
  // Constrói query string preservando período, diaInicio, criterio, tags e origem
  const queryParams = new URLSearchParams();
  if (periodo) queryParams.set('periodo', periodo);
  if (diaInicio) queryParams.set('diaInicio', diaInicio.toString());
  if (criterio) queryParams.set('criterio', criterio);
  if (searchParams.tags) queryParams.set('tags', searchParams.tags);
  queryParams.set('origem', `categoria:${categoria}`);
  const queryString = queryParams.toString();
  
  // Busca transações do período atual
  let transacoes: import('@/types').Transacao[];
  try {
    transacoes = await transacoesServerService.listar({
      data_inicio,
      data_fim,
      categoria: categoria === 'Sem categoria' ? undefined : categoria,
      tipo: tipo || undefined,
      tags: searchParams.tags,
      criterio_data_transacao: criterio
    });
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    transacoes = [];
  }

  // Calcula comparativo dos 3 meses anteriores
  const comparativoMeses = [];
  for (let i = 1; i <= 3; i++) {
    let mesCalc = mes - i;
    let anoCalc = ano;
    if (mesCalc < 1) {
      mesCalc += 12;
      anoCalc -= 1;
    }

    const periodoAnterior = calcularPeriodoCustomizado(mesCalc, anoCalc, diaInicio);
    try {
      const transacoesMes = await transacoesServerService.listar({
        data_inicio: periodoAnterior.data_inicio,
        data_fim: periodoAnterior.data_fim,
        categoria: categoria === 'Sem categoria' ? undefined : categoria,
        tipo: tipo || undefined,
        tags: searchParams.tags,
        criterio_data_transacao: criterio
      });

      const total = transacoesMes.reduce((sum, t) => sum + t.valor, 0);
      comparativoMeses.push({
        mes: `${String(mesCalc).padStart(2, '0')}/${anoCalc}`,
        total,
      });
    } catch (error) {
      console.error('Erro ao carregar comparativo:', error);
      comparativoMeses.push({
        mes: `${String(mesCalc).padStart(2, '0')}/${anoCalc}`,
        total: 0,
      });
    }
  }
  comparativoMeses.reverse();

  const totalAtual = transacoes.reduce((sum, t) => sum + t.valor, 0);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-4">
          <BotaoVoltar />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {categoria}
          </h1>
          <p className="text-gray-600">
            {tipo === 'entrada' ? 'Entradas' : tipo === 'saida' ? 'Saídas' : 'Transações'} desta categoria
          </p>
        </div>

        {/* Filtro de Período */}
        <FiltrosPeriodo />

        {/* Filtro de Tags */}
        <FiltroTags />

        {/* Comparativo Mensal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1 border-2 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Mês Atual
            </h3>
            <p className={`text-2xl font-bold ${tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
              {formatarMoeda(totalAtual)}
            </p>
          </div>
          {comparativoMeses.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {item.mes}
              </h3>
              <p className="text-2xl font-bold text-gray-700">
                {formatarMoeda(item.total)}
              </p>
              {item.total > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {totalAtual > item.total ? (
                    <span className="text-red-600">
                      +{formatarMoeda(totalAtual - item.total)}
                    </span>
                  ) : totalAtual < item.total ? (
                    <span className="text-green-600">
                      {formatarMoeda(totalAtual - item.total)}
                    </span>
                  ) : (
                    'Sem mudança'
                  )}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Lista de Transações */}
        {transacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              Nenhuma transação encontrada nesta categoria
            </p>
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
                      <h3 className="font-medium text-gray-900 mb-1">
                        {transacao.descricao}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatarData(transacao.data)}
                      </p>
                    </div>
                    <div className="text-right">
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
                      <p className="text-xs text-gray-400 mt-1">
                        {transacao.origem === 'manual'
                          ? 'Manual'
                          : transacao.origem === 'extrato_bancario'
                          ? 'Extrato'
                          : 'Fatura'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
