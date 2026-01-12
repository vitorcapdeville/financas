"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Transacao, Tag } from "@/types";

interface BotoesAcaoTransacaoProps {
  transacao: Transacao;
  todasTags: Tag[];
}

export default function BotoesAcaoTransacao({
  transacao,
}: BotoesAcaoTransacaoProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Constrói query string preservando parâmetros
  const queryString = searchParams.toString();

  const handleEditarCategoria = () => {
    router.push(`/transacao/${transacao.id}/categoria?${queryString}`);
  };

  const handleEditarValor = () => {
    router.push(`/transacao/${transacao.id}/valor?${queryString}`);
  };

  const handleGerenciarTags = () => {
    router.push(`/transacao/${transacao.id}/tags?${queryString}`);
  };

  return (
    <div className="card-premium">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-[#2d2d2d] mb-6 flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleEditarCategoria}
            className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">✏️</span>
              <span>Editar Categoria</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>

          <button
            onClick={handleEditarValor}
            className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #10b981, #14b8a6)",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">💰</span>
              <span>Editar Valor</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>

          <button
            onClick={handleGerenciarTags}
            className="group relative overflow-hidden px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🏷️</span>
              <span>Gerenciar Tags</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
