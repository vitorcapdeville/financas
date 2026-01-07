import { regrasServerService } from '@/services/regras.server';
import { TipoAcao } from '@/types';
import Link from 'next/link';
import { ListaRegras } from '@/components/ListaRegras';
import { BotaoAplicarTodasRegras } from '@/components/BotaoAplicarTodasRegras';
import BotaoVoltar from '@/components/BotaoVoltar';

export default async function RegrasPage() {
  const regras = await regrasServerService.listar();

  // Agrupa regras por tipo de ação
  const regrasPorTipo = {
    [TipoAcao.ALTERAR_CATEGORIA]: regras.filter(r => r.tipo_acao === TipoAcao.ALTERAR_CATEGORIA),
    [TipoAcao.ADICIONAR_TAGS]: regras.filter(r => r.tipo_acao === TipoAcao.ADICIONAR_TAGS),
    [TipoAcao.ALTERAR_VALOR]: regras.filter(r => r.tipo_acao === TipoAcao.ALTERAR_VALOR),
  };

  const totalRegras = regras.length;
  const regrasAtivas = regras.filter(r => r.ativo).length;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-4">
          <BotaoVoltar />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Regras Automáticas</h1>
            <p className="text-gray-600 mt-2">
              {totalRegras} {totalRegras === 1 ? 'regra' : 'regras'} cadastrada{totalRegras !== 1 ? 's' : ''} 
              {' '}({regrasAtivas} ativa{regrasAtivas !== 1 ? 's' : ''})
            </p>
          </div>
          <div>
            <BotaoAplicarTodasRegras />
          </div>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">💡 Como funcionam as regras</h2>
          <ul className="text-blue-800 space-y-2">
            <li>• Regras são aplicadas automaticamente em transações importadas</li>
            <li>• Você pode aplicar regras retroativamente em transações já existentes</li>
            <li>• Regras com maior prioridade são executadas primeiro</li>
            <li>• Regras inativas não são aplicadas automaticamente, mas podem ser aplicadas manualmente</li>
            <li>• ⚠️ Deletar uma regra não desfaz alterações já aplicadas nas transações</li>
          </ul>
        </div>

        {/* Lista de Regras */}
        {totalRegras === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Nenhuma regra cadastrada</h2>
            <p className="text-gray-600 mb-6">
              Crie regras ao editar transações para automatizar categorizações, adição de tags e ajustes de valor.
            </p>
            <Link
              href="/transacoes"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Ver Transações
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Regras de Alterar Categoria */}
            {regrasPorTipo[TipoAcao.ALTERAR_CATEGORIA].length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  Alterar Categoria ({regrasPorTipo[TipoAcao.ALTERAR_CATEGORIA].length})
                </h2>
                <ListaRegras regras={regrasPorTipo[TipoAcao.ALTERAR_CATEGORIA]} />
              </div>
            )}

            {/* Regras de Adicionar Tags */}
            {regrasPorTipo[TipoAcao.ADICIONAR_TAGS].length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  Adicionar Tags ({regrasPorTipo[TipoAcao.ADICIONAR_TAGS].length})
                </h2>
                <ListaRegras regras={regrasPorTipo[TipoAcao.ADICIONAR_TAGS]} />
              </div>
            )}

            {/* Regras de Alterar Valor */}
            {regrasPorTipo[TipoAcao.ALTERAR_VALOR].length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Alterar Valor ({regrasPorTipo[TipoAcao.ALTERAR_VALOR].length})
                </h2>
                <ListaRegras regras={regrasPorTipo[TipoAcao.ALTERAR_VALOR]} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
