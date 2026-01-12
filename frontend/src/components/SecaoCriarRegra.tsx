"use client";

import { CriterioTipo } from "@/types";

interface SecaoCriarRegraProps {
  criarRegra: boolean;
  setCriarRegra: (value: boolean) => void;
  nomeRegra: string;
  setNomeRegra: (value: string) => void;
  criterio: CriterioTipo;
  setCriterio: (value: CriterioTipo) => void;
  criterioValor: string;
  setCriterioValor: (value: string) => void;
  categoriaAtual: string;
  isPending: boolean;
  children?: React.ReactNode;
}

export default function SecaoCriarRegra({
  criarRegra,
  setCriarRegra,
  nomeRegra,
  setNomeRegra,
  criterio,
  setCriterio,
  criterioValor,
  setCriterioValor,
  categoriaAtual,
  isPending,
  children,
}: SecaoCriarRegraProps) {
  return (
    <>
      {/* Opção de Criar Regra */}
      <div className="border-t-2 border-[#d4c5b9] pt-8">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={criarRegra}
            onChange={(e) => setCriarRegra(e.target.checked)}
            disabled={isPending}
            className="mt-1 w-5 h-5 rounded border-2 border-[#d4c5b9] text-[#156064] focus:ring-2 focus:ring-[#156064] focus:ring-offset-2 disabled:opacity-50"
          />
          <div>
            <span className="block text-sm font-semibold text-[#2d2d2d] group-hover:text-[#156064] transition-colors">
              Criar regra automática
            </span>
            <span className="block text-sm text-[#8b8378] mt-1">
              Aplicar automaticamente em transações futuras
            </span>
          </div>
        </label>
      </div>

      {/* Campos da Regra */}
      {criarRegra && (
        <div className="space-y-6 bg-[#faf8f5] rounded-xl p-6 border-2 border-[#d4c5b9]">
          <div>
            <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
              Nome da Regra
            </label>
            <input
              type="text"
              value={nomeRegra}
              onChange={(e) => setNomeRegra(e.target.value)}
              disabled={isPending}
              placeholder="(Opcional - será gerado automaticamente)"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#d4c5b9] bg-white text-[#2d2d2d] placeholder-[#8b8378] focus:border-[#156064] focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
              Aplicar quando *
            </label>
            <select
              value={criterio}
              onChange={(e) => setCriterio(e.target.value as CriterioTipo)}
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#d4c5b9] bg-white text-[#2d2d2d] font-medium focus:border-[#156064] focus:outline-none transition-colors disabled:opacity-50"
            >
              <option value={CriterioTipo.CATEGORIA}>
                Categoria for "{categoriaAtual || "Sem categoria"}"
              </option>
              <option value={CriterioTipo.DESCRICAO_EXATA}>
                Descrição for exatamente...
              </option>
              <option value={CriterioTipo.DESCRICAO_CONTEM}>
                Descrição contiver...
              </option>
            </select>
          </div>

          {(criterio === CriterioTipo.DESCRICAO_CONTEM ||
            criterio === CriterioTipo.DESCRICAO_EXATA) && (
            <div>
              <label className="block text-sm font-semibold text-[#2d2d2d] mb-3">
                Texto da Descrição *
              </label>
              <input
                type="text"
                value={criterioValor}
                onChange={(e) => setCriterioValor(e.target.value)}
                disabled={isPending}
                placeholder="Ex: Uber, Netflix, etc"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#d4c5b9] bg-white text-[#2d2d2d] placeholder-[#8b8378] focus:border-[#156064] focus:outline-none transition-colors disabled:opacity-50"
                required={
                  criarRegra &&
                  (criterio === CriterioTipo.DESCRICAO_CONTEM ||
                    criterio === CriterioTipo.DESCRICAO_EXATA)
                }
              />
              <p className="mt-2 text-sm text-[#8b8378]">
                {criterio === CriterioTipo.DESCRICAO_EXATA
                  ? "A regra será aplicada em transações com descrição exatamente igual"
                  : "A regra será aplicada em transações que contenham esse texto"}
              </p>
            </div>
          )}

          {/* Conteúdo adicional específico */}
          {children}
        </div>
      )}
    </>
  );
}
