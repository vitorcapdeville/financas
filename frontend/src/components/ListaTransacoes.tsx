import { Transacao } from "@/types";
import Link from "next/link";
import { formatarData, formatarMoeda } from "@/utils/format";

interface ListaTransacoesProps {
  transacoes: Transacao[];
  queryString: string;
}

export default function ListaTransacoes({
  transacoes,
  queryString,
}: ListaTransacoesProps) {
  return (
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
                              boxShadow: `0 2px 8px ${tag.cor || "#156064"}20`,
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
                        transacao.tipo === "entrada" ? "#2d8659" : "#c44536",
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
  );
}
