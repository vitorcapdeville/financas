import { formatarData, formatarMoeda } from "@/utils/format";

interface ResumoTransacaoProps {
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string;
  categoria?: string;
  valorOriginal?: number;
}

export default function ResumoTransacao({
  descricao,
  valor,
  tipo,
  data,
  categoria,
  valorOriginal,
}: ResumoTransacaoProps) {
  return (
    <div className="card-premium mb-8 animate-fade-in-up delay-200">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-[#2d2d2d] mb-6 flex items-center gap-3">
          <span className="text-3xl">📝</span>
          Informações da Transação
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
              Descrição
            </label>
            <p className="text-lg text-[#2d2d2d] font-medium">{descricao}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
              Valor {valorOriginal !== undefined ? "Atual" : ""}
            </label>
            <p className="text-lg font-medium">
              <span
                className={
                  tipo === "entrada" ? "text-green-600" : "text-red-600"
                }
              >
                {tipo === "entrada" ? "+" : "-"}
                {formatarMoeda(valor)}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
              Data
            </label>
            <p className="text-lg text-[#2d2d2d] font-medium">
              {formatarData(data)}
            </p>
          </div>

          {valorOriginal !== undefined && (
            <div>
              <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                Valor Original
              </label>
              <p className="text-lg text-[#2d2d2d] font-medium">
                {formatarMoeda(valorOriginal)}
              </p>
            </div>
          )}

          {categoria !== undefined && (
            <div>
              <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                Categoria {valorOriginal === undefined && "Atual"}
              </label>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#d4c5b9] bg-[#faf8f5]">
                <div className="w-2 h-2 rounded-full bg-[#156064]"></div>
                <span className="text-base text-[#2d2d2d] font-medium">
                  {categoria || "Sem categoria"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
