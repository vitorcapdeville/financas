import { transacoesService, usuariosService } from "@/services/api.service";
import FiltroUsuario from "@/components/FiltroUsuario";
import { formatarData, formatarMoeda } from "@/utils/format";
import {
  calcularPeriodoCustomizado,
  extrairPeriodoDaURL,
} from "@/utils/periodo";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import FiltroTags from "@/components/FiltroTags";
import Link from "next/link";

interface TransacoesPageProps {
  searchParams: Promise<{
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
    tags?: string;
    sem_tags?: string;
    usuario_id?: string;
  }>;
}

export default async function TransacoesPage(props: TransacoesPageProps) {
  // Next.js 16: searchParams é uma Promise que precisa ser awaited
  const searchParams = await props.searchParams;
  const usuarios = await usuariosService.listar();
  const usuarioIdSelecionado = searchParams.usuario_id
    ? Number(searchParams.usuario_id)
    : undefined;
  const { periodo, mes, ano, diaInicio, criterio } =
    extrairPeriodoDaURL(searchParams);
  const { data_inicio, data_fim } = calcularPeriodoCustomizado(
    mes,
    ano,
    diaInicio,
  );

  // Constrói query string preservando período, diaInicio, criterio, tags, sem_tags e origem
  const queryParams = new URLSearchParams();
  if (periodo) queryParams.set("periodo", periodo);
  if (diaInicio) queryParams.set("diaInicio", diaInicio.toString());
  if (criterio) queryParams.set("criterio", criterio);
  if (searchParams.tags) queryParams.set("tags", searchParams.tags);
  if (searchParams.sem_tags) queryParams.set("sem_tags", searchParams.sem_tags);
  if (usuarioIdSelecionado)
    queryParams.set("usuario_id", usuarioIdSelecionado.toString());
  queryParams.set("origem", "transacoes");
  const queryString = queryParams.toString();

  // Busca transações no servidor
  let transacoes: import("@/types").Transacao[];
  try {
    transacoes = await transacoesService.listar({
      data_inicio,
      data_fim,
      tags: searchParams.tags,
      sem_tags: searchParams.sem_tags === "true",
      criterio_data_transacao: criterio,
      usuario_id: usuarioIdSelecionado,
    });
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
    transacoes = [];
  }

  // Cálculos de resumo
  const totalEntradas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((sum, t) => sum + t.valor, 0);
  const totalSaidas = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((sum, t) => sum + t.valor, 0);

  return (
    <>
      <header className="mb-10 animate-fade-in-up">
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
            Transações
          </h1>
          <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
        </div>
        <p className="text-lg text-[#8b8378]">
          Visualize e gerencie suas transações financeiras
        </p>
      </header>

      {/* Filtro de Período */}
      <div className="animate-fade-in-up delay-200">
        <FiltrosPeriodo />
      </div>

      {/* Filtros */}
      <div className="animate-fade-in-up delay-200">
        <FiltroUsuario
          usuarios={usuarios}
          usuarioIdSelecionado={usuarioIdSelecionado}
        />
      </div>

      {/* Filtro de Tags */}
      <div className="animate-fade-in-up delay-300">
        <FiltroTags />
      </div>

      {/* Lista de Transações */}
      {transacoes.length === 0 ? (
        <div className="card-premium p-16 text-center animate-fade-in-scale delay-400">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#156064]/10 to-[#b8860b]/10 flex items-center justify-center">
              <span className="text-4xl opacity-40">◇</span>
            </div>
            <p className="text-[#8b8378] text-lg mb-6">
              Nenhuma transação encontrada
            </p>
            <Link
              href="/importar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)",
                boxShadow: "0 4px 12px rgba(15, 61, 62, 0.25)",
              }}
            >
              <span>📤</span>
              <span>Importar Dados</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header com contador e resumo */}
          <div className="card-premium p-6 mb-6 animate-fade-in-up delay-400">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-display text-[#0f3d3e]">
                  {transacoes.length}{" "}
                  {transacoes.length === 1 ? "Transação" : "Transações"}
                </h2>
                <p className="text-sm text-[#8b8378] mt-1">
                  Período selecionado
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center md:text-right">
                  <p className="text-xs text-[#8b8378] uppercase tracking-wider mb-1">
                    Entradas
                  </p>
                  <p className="text-xl font-bold text-financial text-[#2d8659]">
                    {formatarMoeda(totalEntradas)}
                  </p>
                </div>
                <div className="w-px bg-[#d4c5b9]"></div>
                <div className="text-center md:text-right">
                  <p className="text-xs text-[#8b8378] uppercase tracking-wider mb-1">
                    Saídas
                  </p>
                  <p className="text-xl font-bold text-financial text-[#c44536]">
                    {formatarMoeda(totalSaidas)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de transações */}
          <div className="card-premium overflow-hidden animate-fade-in-up delay-500">
            <div className="divide-y divide-[#d4c5b9]/30">
              {transacoes.map((transacao, idx) => (
                <Link
                  key={transacao.id}
                  href={`/transacao/${transacao.id}?${queryString}`}
                  className="group block p-6 hover:bg-gradient-to-r hover:from-[#156064]/3 hover:to-transparent transition-all duration-300"
                  style={{
                    animationDelay: `${idx * 30 + 600}ms`,
                  }}
                >
                  <div className="flex justify-between items-start gap-6">
                    {/* Conteúdo principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Indicador de tipo com animação */}
                        <div
                          className="w-1 h-12 rounded-full transition-all duration-300 group-hover:h-14"
                          style={{
                            background:
                              transacao.tipo === "entrada"
                                ? "linear-gradient(180deg, #2d8659, #38a169)"
                                : "linear-gradient(180deg, #c44536, #e56b5d)",
                          }}
                        ></div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-[#2d2d2d] text-lg mb-1 group-hover:text-[#0f3d3e] transition-colors">
                            {transacao.descricao}
                          </h3>

                          <div className="flex items-center gap-3 text-sm text-[#8b8378] flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-[#b8860b]"></span>
                              {formatarData(transacao.data)}
                            </span>

                            {transacao.usuario && (
                              <>
                                <span className="text-[#d4c5b9]">•</span>
                                <span className="flex items-center gap-1.5">
                                  <span className="text-xs">👤</span>
                                  {transacao.usuario.nome}
                                </span>
                              </>
                            )}

                            {transacao.data_fatura && (
                              <>
                                <span className="text-[#d4c5b9]">•</span>
                                <span className="flex items-center gap-1.5">
                                  <span className="text-xs">💳</span>
                                  {formatarData(transacao.data_fatura)}
                                </span>
                              </>
                            )}

                            <span className="text-[#d4c5b9]">•</span>
                            <span className="px-2.5 py-1 bg-gradient-to-r from-[#faf8f5] to-[#f5f0ea] rounded-lg text-xs font-medium text-[#0f3d3e] border border-[#d4c5b9]/30">
                              {transacao.categoria || "Sem categoria"}
                            </span>

                            <span className="text-[#d4c5b9]">•</span>
                            <span className="text-xs capitalize">
                              {transacao.origem === "manual"
                                ? "✍️ Manual"
                                : transacao.origem === "extrato_bancario"
                                  ? "🏦 Extrato"
                                  : "💳 Fatura"}
                            </span>
                          </div>

                          {/* Tags */}
                          {transacao.tags && transacao.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {transacao.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                                  style={{
                                    backgroundColor: tag.cor || "#156064",
                                    boxShadow: `0 2px 8px ${
                                      tag.cor || "#156064"
                                    }20`,
                                  }}
                                >
                                  {tag.nome}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Valor */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                          style={{
                            background:
                              transacao.tipo === "entrada"
                                ? "linear-gradient(135deg, #2d8659, #38a169)"
                                : "linear-gradient(135deg, #c44536, #e56b5d)",
                          }}
                        >
                          {transacao.tipo === "entrada" ? "↗" : "↘"}
                        </div>
                        <p
                          className="text-2xl font-bold text-financial"
                          style={{
                            color:
                              transacao.tipo === "entrada"
                                ? "#2d8659"
                                : "#c44536",
                          }}
                        >
                          {transacao.tipo === "entrada" ? "+" : "−"}
                          {formatarMoeda(transacao.valor)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
