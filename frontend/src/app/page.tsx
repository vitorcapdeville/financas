import { transacoesServerService } from '@/services/api.server';
import { formatarMoeda } from '@/utils/format';
import { calcularPeriodoCustomizado, extrairPeriodoDaURL } from '@/utils/periodo';
import FiltrosPeriodo from '@/components/FiltrosPeriodo';
import FiltroTags from '@/components/FiltroTags';
import { NavegacaoPrincipal } from '@/components/NavegacaoPrincipal';
import Link from 'next/link';

interface HomeProps {
  searchParams: Promise<{
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
    tags?: string;
  }>;
}

export default async function Home(props: HomeProps) {
  // Next.js 16: searchParams é uma Promise que precisa ser awaited
  const searchParams = await props.searchParams;
  const { periodo, mes, ano, diaInicio, criterio } = extrairPeriodoDaURL(searchParams);
  const { data_inicio, data_fim } = calcularPeriodoCustomizado(mes, ano, diaInicio);
  
  // Constrói query string preservando período, diaInicio, criterio e tags
  const queryParams = new URLSearchParams();
  if (periodo) queryParams.set('periodo', periodo);
  if (diaInicio) queryParams.set('diaInicio', diaInicio.toString());
  if (criterio) queryParams.set('criterio', criterio);
  if (searchParams.tags) queryParams.set('tags', searchParams.tags);
  const queryString = queryParams.toString();
  
  // Busca dados no servidor
  let resumo = null;
  try {
    resumo = await transacoesServerService.resumoMensal(
      undefined, 
      undefined, 
      data_inicio, 
      data_fim,
      searchParams.tags,
      criterio
    );
  } catch (error) {
    console.error('Erro ao carregar resumo:', error);
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Finanças Pessoais
          </h1>
          <p className="text-gray-600">
            Gerencie suas entradas e saídas de forma inteligente
          </p>
        </header>

        {/* Navegação */}
        <NavegacaoPrincipal />

        {/* Seletor de Período - Client Component */}
        <FiltrosPeriodo />

        {/* Filtro de Tags */}
        <FiltroTags />

        {/* Resumo */}
        {!resumo ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum dado disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card Entradas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total de Entradas
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {formatarMoeda(resumo.total_entradas)}
              </p>
            </div>

            {/* Card Saídas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total de Saídas
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {formatarMoeda(resumo.total_saidas)}
              </p>
            </div>

            {/* Card Saldo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Saldo do Mês
              </h3>
              <p
                className={`text-3xl font-bold ${
                  resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatarMoeda(resumo.saldo)}
              </p>
            </div>
          </div>
        )}

        {/* Categorias */}
        {resumo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entradas por Categoria */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Entradas por Categoria
              </h3>
              {Object.keys(resumo.entradas_por_categoria).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(resumo.entradas_por_categoria).map(
                    ([categoria, valor]) => (
                      <li
                        key={categoria}
                        className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                      >
                        <Link
                          href={`/categoria/${encodeURIComponent(categoria)}?tipo=entrada&${queryString}`}
                          className="text-gray-700 hover:text-green-600 font-medium flex items-center gap-2 flex-1"
                        >
                          {categoria}
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </Link>
                        <span className="font-semibold text-green-600">
                          {formatarMoeda(valor)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma entrada registrada
                </p>
              )}
            </div>

            {/* Saídas por Categoria */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Saídas por Categoria
              </h3>
              {Object.keys(resumo.saidas_por_categoria).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(resumo.saidas_por_categoria).map(
                    ([categoria, valor]) => (
                      <li
                        key={categoria}
                        className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                      >
                        <Link
                          href={`/categoria/${encodeURIComponent(categoria)}?tipo=saida&${queryString}`}
                          className="text-gray-700 hover:text-red-600 font-medium flex items-center gap-2 flex-1"
                        >
                          {categoria}
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </Link>
                        <span className="font-semibold text-red-600">
                          {formatarMoeda(valor)}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma saída registrada
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
