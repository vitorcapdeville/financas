"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CriterioDataTransacao } from "@/types";

export default function FiltrosPeriodo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtém valores da URL ou usa defaults
  const periodoAtual =
    searchParams.get("periodo") ||
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  const diaInicioAtual = parseInt(searchParams.get("diaInicio") || "1");
  const criterioData = (searchParams.get("criterio") ||
    "data_transacao") as CriterioDataTransacao;

  const mes = parseInt(periodoAtual.split("-")[1]);
  const ano = parseInt(periodoAtual.split("-")[0]);

  const handlePeriodoChange = (novoPeriodo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", novoPeriodo);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="card-premium p-8 mb-8 relative overflow-hidden">
      {/* Decorative gradient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#156064]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seletor de Período */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0f3d3e] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#b8860b]"></span>
              Período
            </label>
            <div className="relative group">
              <input
                type="month"
                value={periodoAtual}
                onChange={(e) => handlePeriodoChange(e.target.value)}
                className="w-full border-2 border-[#d4c5b9] rounded-xl px-5 py-3.5 text-[#2d2d2d] bg-[#faf8f5] focus:outline-none focus:border-[#156064] focus:bg-white transition-all duration-300 font-medium text-lg hover:border-[#156064]/50"
                style={{ fontVariantNumeric: "tabular-nums" }}
              />
              {/* Subtle hover indicator */}
              <div className="absolute inset-0 rounded-xl border-2 border-[#b8860b] opacity-0 group-focus-within:opacity-20 pointer-events-none transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Visualização do Período */}
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#0f3d3e] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#b8860b]"></span>
              Período Visualizado
            </p>
            <div className="bg-gradient-to-br from-[#0f3d3e] to-[#156064] rounded-xl p-5 text-white">
              <p className="text-lg font-bold mb-2 text-financial">
                {new Date(ano, mes - 1, diaInicioAtual).toLocaleDateString(
                  "pt-BR",
                  { day: "2-digit", month: "short" }
                )}{" "}
                até{" "}
                {new Date(ano, mes, diaInicioAtual - 1).toLocaleDateString(
                  "pt-BR",
                  { day: "2-digit", month: "short", year: "numeric" }
                )}
              </p>
              <div
                className="flex items-start gap-2 text-xs"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                <span className="mt-0.5">
                  {criterioData === CriterioDataTransacao.DATA_TRANSACAO
                    ? "📅"
                    : "💳"}
                </span>
                <span className="leading-relaxed">
                  {criterioData === CriterioDataTransacao.DATA_TRANSACAO
                    ? "Gastos do cartão mostrados na data da transação"
                    : "Gastos do cartão mostrados na data da fatura"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
