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

  const avancarPeriodo = () => {
    const data = new Date(ano, mes); // Próximo mês
    const novoMes = data.getMonth() + 1;
    const novoAno = data.getFullYear();
    handlePeriodoChange(`${novoAno}-${String(novoMes).padStart(2, "0")}`);
  };

  const retrocederPeriodo = () => {
    const data = new Date(ano, mes - 2); // Mês anterior
    const novoMes = data.getMonth() + 1;
    const novoAno = data.getFullYear();
    handlePeriodoChange(`${novoAno}-${String(novoMes).padStart(2, "0")}`);
  };

  // Gera a label do período formatado
  const dataInicio = new Date(ano, mes - 1, diaInicioAtual);
  const dataFim = new Date(ano, mes, diaInicioAtual - 1);

  const inicio = dataInicio.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const fim = dataFim.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mb-8">
      {/* Seletor de Período Fluido */}
      <div className="flex items-center justify-between gap-6 bg-gradient-to-r from-[#0f3d3e] via-[#156064] to-[#0f3d3e] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        {/* Pattern decorativo de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        {/* Brilho sutil ao hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Botão Período Anterior */}
        <button
          onClick={retrocederPeriodo}
          className="relative z-10 flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
          aria-label="Período anterior"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white group-hover/btn:-translate-x-0.5 transition-transform duration-300"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Display do Período Atual */}
        <div className="relative z-10 flex-1 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="hidden sm:flex w-9 h-9 rounded-lg bg-[#b8860b]/20 border border-[#b8860b]/30 items-center justify-center backdrop-blur-sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#b8860b]"
              >
                <rect
                  x="3"
                  y="4"
                  width="14"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M7 2V6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M13 2V6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white text-financial leading-tight">
                {inicio} até {fim}
              </h3>

              {/* Info sobre critério - compacta */}
              <p
                className="text-xs mt-1 flex items-center justify-center gap-1.5"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                <span className="text-[10px]">
                  {criterioData === CriterioDataTransacao.DATA_TRANSACAO
                    ? "📅"
                    : "💳"}
                </span>
                <span className="hidden sm:inline">
                  {criterioData === CriterioDataTransacao.DATA_TRANSACAO
                    ? "Data da transação"
                    : "Data da fatura"}
                </span>
                <span className="sm:hidden">
                  {criterioData === CriterioDataTransacao.DATA_TRANSACAO
                    ? "Transação"
                    : "Fatura"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Botão Próximo Período */}
        <button
          onClick={avancarPeriodo}
          className="relative z-10 flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
          aria-label="Próximo período"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white group-hover/btn:translate-x-0.5 transition-transform duration-300"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
