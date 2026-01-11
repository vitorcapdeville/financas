import { transacoesServerService } from "@/services/api.server";
import { formatarMoeda } from "@/utils/format";
import {
  calcularPeriodoCustomizado,
  extrairPeriodoDaURL,
} from "@/utils/periodo";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import FiltroTags from "@/components/FiltroTags";
import Link from "next/link";

interface HomeProps {
  searchParams: Promise<{
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
    tags?: string;
    sem_tags?: string;
  }>;
}

export default async function Home(props: HomeProps) {
  // Next.js 16: searchParams é uma Promise que precisa ser awaited
  const searchParams = await props.searchParams;
  const { periodo, mes, ano, diaInicio, criterio } =
    extrairPeriodoDaURL(searchParams);
  const { data_inicio, data_fim } = calcularPeriodoCustomizado(
    mes,
    ano,
    diaInicio
  );

  // Constrói query string preservando período, diaInicio, criterio, tags e sem_tags
  const queryParams = new URLSearchParams();
  if (periodo) queryParams.set("periodo", periodo);
  if (diaInicio) queryParams.set("diaInicio", diaInicio.toString());
  if (criterio) queryParams.set("criterio", criterio);
  if (searchParams.tags) queryParams.set("tags", searchParams.tags);
  if (searchParams.sem_tags) queryParams.set("sem_tags", searchParams.sem_tags);
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
      searchParams.sem_tags === "true",
      criterio
    );
  } catch (error) {
    console.error("Erro ao carregar resumo:", error);
  }

  return (
    <>
      {/* Header com animação de entrada */}
      <header className="mb-10 animate-fade-in-up">
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
            Dashboard
          </h1>
          <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
        </div>
        <p className="text-lg text-[#8b8378] max-w-2xl">
          Visão geral das suas finanças no período selecionado
        </p>
      </header>

      {/* Filtros com animação */}
      <div className="animate-fade-in-up delay-100">
        <FiltrosPeriodo />
      </div>

      {/* Filtro de Tags */}
      <div className="animate-fade-in-up delay-200">
        <FiltroTags />
      </div>

      {/* Resumo */}
      {!resumo ? (
        <div className="text-center py-20 animate-fade-in-scale">
          <div className="inline-block p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-[#d4c5b9]/30">
            <p className="text-[#8b8378] text-lg">Nenhum dado disponível</p>
          </div>
        </div>
      ) : (
        <>
          {/* Cards de Resumo com layout assimétrico */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            {/* Card Entradas - Destaque maior */}
            <div className="md:col-span-5 card-premium p-8 animate-fade-in-up delay-300">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-[#8b8378] uppercase tracking-wider mb-2">
                    Total de Entradas
                  </p>
                  <h3
                    className="text-4xl font-bold text-financial"
                    style={{ color: "#2d8659" }}
                  >
                    {formatarMoeda(resumo.total_entradas)}
                  </h3>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white">↗</span>
                </div>
              </div>
              <div
                className="h-2 w-24 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #2d8659, #38a169)",
                }}
              ></div>
            </div>

            {/* Card Saídas */}
            <div className="md:col-span-4 card-premium p-8 animate-fade-in-up delay-400">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-[#8b8378] uppercase tracking-wider mb-2">
                    Total de Saídas
                  </p>
                  <h3
                    className="text-4xl font-bold text-financial"
                    style={{ color: "#c44536" }}
                  >
                    {formatarMoeda(resumo.total_saidas)}
                  </h3>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: "linear-gradient(135deg, #c44536, #e56b5d)",
                  }}
                >
                  <span className="text-white">↘</span>
                </div>
              </div>
              <div
                className="h-2 w-24 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #c44536, #e56b5d)",
                }}
              ></div>
            </div>

            {/* Card Saldo - Destaque especial */}
            <div
              className="md:col-span-3 card-premium p-8 animate-fade-in-up delay-500 relative overflow-hidden"
              style={{
                background:
                  resumo.saldo >= 0
                    ? "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)"
                    : "linear-gradient(135deg, #8b4513 0%, #a0522d 100%)",
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: "white" }}
              ></div>
              <div
                className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
                style={{ background: "white" }}
              ></div>

              <div className="relative z-10">
                <p
                  className="text-sm font-medium uppercase tracking-wider mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Saldo do Mês
                </p>
                <h3 className="text-3xl font-bold text-financial text-white mb-2">
                  {formatarMoeda(resumo.saldo)}
                </h3>
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
                  <span>{resumo.saldo >= 0 ? "Positivo" : "Negativo"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categorias com grid editorial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Entradas por Categoria */}
            <div className="card-premium p-8 animate-fade-in-up delay-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-display text-[#0f3d3e]">
                  Entradas por Categoria
                </h3>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{
                    background: "linear-gradient(135deg, #2d8659, #38a169)",
                  }}
                >
                  <span className="text-white">+</span>
                </div>
              </div>

              {Object.keys(resumo.entradas_por_categoria).length > 0 ? (
                <ul className="space-y-1">
                  {Object.entries(resumo.entradas_por_categoria)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([categoria, valor], idx) => (
                      <li
                        key={categoria}
                        className="group animate-fade-in-up"
                        style={{ animationDelay: `${idx * 50 + 400}ms` }}
                      >
                        <Link
                          href={`/categoria/${encodeURIComponent(
                            categoria
                          )}?tipo=entrada&${queryString}`}
                          className="flex justify-between items-center py-4 px-4 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2d8659]/5 hover:to-transparent border-b border-[#d4c5b9]/30"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-1 h-8 rounded-full bg-[#2d8659] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="font-medium text-[#2d2d2d] group-hover:text-[#2d8659] transition-colors">
                              {categoria}
                            </span>
                          </div>
                          <span className="font-bold text-financial text-[#2d8659] text-lg">
                            {formatarMoeda(valor)}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#2d8659]/10 to-[#38a169]/10 flex items-center justify-center">
                    <span className="text-2xl opacity-30">◇</span>
                  </div>
                  <p className="text-[#8b8378]">Nenhuma entrada registrada</p>
                </div>
              )}
            </div>

            {/* Saídas por Categoria */}
            <div className="card-premium p-8 animate-fade-in-up delay-400">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-display text-[#0f3d3e]">
                  Saídas por Categoria
                </h3>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{
                    background: "linear-gradient(135deg, #c44536, #e56b5d)",
                  }}
                >
                  <span className="text-white">−</span>
                </div>
              </div>

              {Object.keys(resumo.saidas_por_categoria).length > 0 ? (
                <ul className="space-y-1">
                  {Object.entries(resumo.saidas_por_categoria)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([categoria, valor], idx) => (
                      <li
                        key={categoria}
                        className="group animate-fade-in-up"
                        style={{ animationDelay: `${idx * 50 + 500}ms` }}
                      >
                        <Link
                          href={`/categoria/${encodeURIComponent(
                            categoria
                          )}?tipo=saida&${queryString}`}
                          className="flex justify-between items-center py-4 px-4 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#c44536]/5 hover:to-transparent border-b border-[#d4c5b9]/30"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-1 h-8 rounded-full bg-[#c44536] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="font-medium text-[#2d2d2d] group-hover:text-[#c44536] transition-colors">
                              {categoria}
                            </span>
                          </div>
                          <span className="font-bold text-financial text-[#c44536] text-lg">
                            {formatarMoeda(valor)}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#c44536]/10 to-[#e56b5d]/10 flex items-center justify-center">
                    <span className="text-2xl opacity-30">◆</span>
                  </div>
                  <p className="text-[#8b8378]">Nenhuma saída registrada</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
