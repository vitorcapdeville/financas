import { regrasService } from "@/services/api.service";
import { TipoAcao } from "@/types";
import Link from "next/link";
import { ListaRegras } from "@/components/ListaRegras";
import { BotaoAplicarTodasRegras } from "@/components/BotaoAplicarTodasRegras";

export default async function RegrasPage() {
  const regras = await regrasService.listar();

  // Agrupa regras por tipo de ação
  const regrasPorTipo = {
    [TipoAcao.ALTERAR_CATEGORIA]: regras.filter(
      (r) => r.tipo_acao === TipoAcao.ALTERAR_CATEGORIA,
    ),
    [TipoAcao.ADICIONAR_TAGS]: regras.filter(
      (r) => r.tipo_acao === TipoAcao.ADICIONAR_TAGS,
    ),
    [TipoAcao.ALTERAR_VALOR]: regras.filter(
      (r) => r.tipo_acao === TipoAcao.ALTERAR_VALOR,
    ),
  };

  const totalRegras = regras.length;
  const regrasAtivas = regras.filter((r) => r.ativo).length;

  return (
    <>
      {/* Header */}
      <header className="mb-10 animate-fade-in-up delay-100">
        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-6 mb-3">
          <div className="flex items-baseline gap-4">
            <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
              Regras
            </h1>
            <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
          </div>
          <div className="md:ml-auto">
            <BotaoAplicarTodasRegras />
          </div>
        </div>
        <p className="text-lg text-[#8b8378]">
          {totalRegras} {totalRegras === 1 ? "regra" : "regras"} cadastrada
          {totalRegras !== 1 ? "s" : ""} ({regrasAtivas} ativa
          {regrasAtivas !== 1 ? "s" : ""})
        </p>
      </header>

      {/* Informações */}
      <div className="card-premium p-8 mb-8 animate-fade-in-up delay-200 relative overflow-hidden">
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #0f3d3e, #156064)" }}
        ></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-display text-[#0f3d3e] mb-4 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            Como funcionam as regras
          </h2>
          <ul className="text-[#2d2d2d] space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2 flex-shrink-0"></span>
              <span>
                Regras são aplicadas automaticamente em transações importadas
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2 flex-shrink-0"></span>
              <span>
                Você pode aplicar regras retroativamente em transações já
                existentes
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2 flex-shrink-0"></span>
              <span>Regras com maior prioridade são executadas primeiro</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#156064] mt-2 flex-shrink-0"></span>
              <span>
                Regras inativas não são aplicadas automaticamente, mas podem ser
                aplicadas manualmente
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c44536] mt-2 flex-shrink-0"></span>
              <span>
                <strong>Atenção:</strong> Deletar uma regra não desfaz
                alterações já aplicadas nas transações
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Lista de Regras */}
      {totalRegras === 0 ? (
        <div className="card-premium p-16 text-center animate-fade-in-scale delay-300">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#156064]/10 to-[#b8860b]/10 flex items-center justify-center">
              <span className="text-4xl opacity-40">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-display text-[#0f3d3e] mb-3">
              Nenhuma regra cadastrada
            </h2>
            <p className="text-[#8b8378] text-lg mb-6">
              Crie regras ao editar transações para automatizar categorizações,
              adição de tags e ajustes de valor.
            </p>
            <Link
              href="/transacoes"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)",
                boxShadow: "0 4px 12px rgba(15, 61, 62, 0.25)",
              }}
            >
              <span>Ver Transações</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Regras de Alterar Categoria */}
          {regrasPorTipo[TipoAcao.ALTERAR_CATEGORIA].length > 0 && (
            <div className="animate-fade-in-up delay-300">
              <h2 className="text-2xl font-bold text-display text-[#0f3d3e] mb-6 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #156064, #2a7c7f)",
                  }}
                >
                  <span className="text-xl text-white">🏷️</span>
                </div>
                Alterar Categoria (
                {regrasPorTipo[TipoAcao.ALTERAR_CATEGORIA].length})
              </h2>
              <ListaRegras regras={regrasPorTipo[TipoAcao.ALTERAR_CATEGORIA]} />
            </div>
          )}

          {/* Regras de Adicionar Tags */}
          {regrasPorTipo[TipoAcao.ADICIONAR_TAGS].length > 0 && (
            <div className="animate-fade-in-up delay-400">
              <h2 className="text-2xl font-bold text-display text-[#0f3d3e] mb-6 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #b8860b, #d4af37)",
                  }}
                >
                  <span className="text-xl text-white">🏷️</span>
                </div>
                Adicionar Tags ({regrasPorTipo[TipoAcao.ADICIONAR_TAGS].length})
              </h2>
              <ListaRegras regras={regrasPorTipo[TipoAcao.ADICIONAR_TAGS]} />
            </div>
          )}

          {/* Regras de Alterar Valor */}
          {regrasPorTipo[TipoAcao.ALTERAR_VALOR].length > 0 && (
            <div className="animate-fade-in-up delay-500">
              <h2 className="text-2xl font-bold text-display text-[#0f3d3e] mb-6 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-xl text-white">💰</span>
                </div>
                Alterar Valor ({regrasPorTipo[TipoAcao.ALTERAR_VALOR].length})
              </h2>
              <ListaRegras regras={regrasPorTipo[TipoAcao.ALTERAR_VALOR]} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
