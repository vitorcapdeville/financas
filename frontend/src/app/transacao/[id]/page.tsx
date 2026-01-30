import { transacoesService } from "@/services/api.service";
import { tagsService } from "@/services/api.service";
import { formatarData, formatarMoeda } from "@/utils/format";
import { Tag } from "@/types";
import Link from "next/link";
import BotoesAcaoTransacao from "@/components/BotoesAcaoTransacao";

interface TransacaoPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
  }>;
}

export default async function TransacaoPage({
  params,
  searchParams,
}: TransacaoPageProps) {
  // Next.js 16: params e searchParams são Promises
  const { id: idStr } = await params;
  const search = await searchParams;

  const id = parseInt(idStr);

  // Constrói query string preservando período, diaInicio e criterio
  const queryParams = new URLSearchParams();
  if (search.periodo) queryParams.set("periodo", search.periodo);
  if (search.diaInicio) queryParams.set("diaInicio", search.diaInicio);
  if (search.criterio) queryParams.set("criterio", search.criterio);
  const queryString = queryParams.toString();

  // Busca transação no servidor
  let transacao;
  try {
    transacao = await transacoesService.obter(id);
  } catch (error) {
    console.error("Erro ao carregar transação:", error);
    transacao = null;
  }

  // Busca todas as tags no servidor
  let todasTags: Tag[];
  try {
    todasTags = await tagsService.listar();
  } catch (error) {
    console.error("Erro ao carregar tags:", error);
    todasTags = [];
  }

  if (!transacao) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="card-premium p-12 text-center max-w-md animate-fade-in-scale">
          <div
            className="inline-flex items-center justify-center p-6 rounded-2xl mb-6"
            style={{ background: "linear-gradient(135deg, #c44536, #e67e22)" }}
          >
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-[#8b8378] text-lg mb-6">
            Transação não encontrada
          </p>
          <Link
            href={`/transacoes?${queryString}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #0f3d3e, #156064)" }}
          >
            <span>←</span>
            <span>Voltar para transações</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-10 max-w-3xl">
        <div className="animate-fade-in-up delay-100">
          <div className="flex items-baseline gap-4">
            <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
              Detalhes
            </h1>
            <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
          </div>
        </div>
      </div>

      {/* Card Principal */}
      <div className="card-premium overflow-hidden mb-8 animate-fade-in-up delay-200">
        {/* Valor Destaque */}
        <div
          className="p-8 text-white relative overflow-hidden"
          style={{
            background:
              transacao.tipo === "entrada"
                ? "linear-gradient(135deg, #2d8659 0%, #38a169 100%)"
                : "linear-gradient(135deg, #c44536 0%, #e67e22 100%)",
          }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white opacity-5"></div>
          <div className="relative z-10">
            <p className="text-sm font-medium mb-2 opacity-90">
              Valor da Transação
            </p>
            <p className="text-6xl font-bold mb-4 text-financial">
              {transacao.tipo === "entrada" ? "+" : "-"}
              {formatarMoeda(transacao.valor)}
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/20 backdrop-blur-sm">
              <span className="text-lg">
                {transacao.tipo === "entrada" ? "↗" : "↘"}
              </span>
              {transacao.tipo === "entrada" ? "Entrada" : "Saída"}
            </span>
          </div>
        </div>

        {/* Informações */}
        <div className="p-8 space-y-8">
          <div>
            <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
              Descrição
            </label>
            <p className="text-xl text-[#2d2d2d] font-medium">
              {transacao.descricao}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                Data da Transação
              </label>
              <p className="text-lg text-[#2d2d2d] font-medium">
                {formatarData(transacao.data)}
              </p>
            </div>

            {transacao.data_fatura ? (
              <div>
                <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                  Data da Fatura
                </label>
                <p className="text-lg text-[#2d2d2d] font-medium">
                  {formatarData(transacao.data_fatura)}
                </p>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                Responsável
              </label>
              <div className="inline-flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, #b8860b, #d4af37)",
                  }}
                >
                  {transacao.usuario?.nome?.charAt(0).toUpperCase() || "?"}
                </div>
                <p className="text-lg text-[#2d2d2d] font-medium">
                  {transacao.usuario?.nome || "Não definido"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                Origem
              </label>
              <p className="text-lg text-[#2d2d2d] font-medium">
                {transacao.origem === "manual"
                  ? "✍️ Manual"
                  : transacao.origem === "extrato_bancario"
                    ? "📊 Extrato Bancário"
                    : "💳 Fatura de Cartão"}
              </p>
            </div>

            {transacao.banco && (
              <div>
                <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                  Banco
                </label>
                <p className="text-lg text-[#2d2d2d] font-medium">
                  🏦 {transacao.banco.toUpperCase()}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b8378] mb-3 uppercase tracking-wider">
              Categoria
            </label>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#d4c5b9] bg-[#faf8f5]">
              <div className="w-2 h-2 rounded-full bg-[#156064]"></div>
              <span className="text-lg text-[#2d2d2d] font-medium">
                {transacao.categoria || "Sem categoria"}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#8b8378] mb-3 uppercase tracking-wider">
              Tags
            </label>
            {transacao.tags && transacao.tags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {transacao.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md"
                    style={{ backgroundColor: tag.cor || "#156064" }}
                  >
                    {tag.nome}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#8b8378] text-sm italic">
                Nenhuma tag associada
              </p>
            )}
          </div>

          {transacao.observacoes && (
            <div>
              <label className="block text-xs font-semibold text-[#8b8378] mb-2 uppercase tracking-wider">
                Observações
              </label>
              <div className="bg-[#faf8f5] border border-[#d4c5b9] rounded-xl p-4">
                <p className="text-[#2d2d2d]">{transacao.observacoes}</p>
              </div>
            </div>
          )}

          <div className="pt-6 border-t-2 border-[#d4c5b9]">
            <p className="text-sm text-[#8b8378] flex items-center gap-2">
              <span className="text-xs">🕒</span>
              Criado em: {new Date(transacao.criado_em).toLocaleString("pt-BR")}
            </p>
            {transacao.atualizado_em !== transacao.criado_em && (
              <p className="text-sm text-[#8b8378] mt-2 flex items-center gap-2">
                <span className="text-xs">🔄</span>
                Atualizado em:{" "}
                {new Date(transacao.atualizado_em).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ações - Client Component */}
      <div className="animate-fade-in-up delay-300">
        <BotoesAcaoTransacao transacao={transacao} todasTags={todasTags} />
      </div>
    </>
  );
}
