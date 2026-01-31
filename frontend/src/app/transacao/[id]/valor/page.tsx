import { transacoesService } from "@/services/api.service";
import { construirQueryString } from "@/utils/query";
import Link from "next/link";
import FormEditarValor from "@/components/FormEditarValor";
import HeaderEdicao from "@/components/HeaderEdicao";
import ResumoTransacao from "@/components/ResumoTransacao";
import TransacaoNaoEncontrada from "@/components/TransacaoNaoEncontrada";

interface ValorPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
    tags?: string;
    usuario_id?: string;
    sem_tags?: string;
  }>;
}

export default async function ValorPage({
  params,
  searchParams,
}: ValorPageProps) {
  // Next.js 16: params e searchParams são Promises
  const { id: idStr } = await params;
  const search = await searchParams;

  const id = parseInt(idStr);

  const queryString = construirQueryString({ searchParams: search });

  // Busca transação no servidor
  let transacao;
  try {
    transacao = await transacoesService.obter(id);
  } catch (error) {
    console.error("Erro ao carregar transação:", error);
    transacao = null;
  }

  if (!transacao) {
    return <TransacaoNaoEncontrada queryString={queryString} />;
  }

  return (
    <>
      <HeaderEdicao
        titulo="Editar Valor"
        transacaoId={id}
        queryString={queryString}
      />

      <ResumoTransacao
        descricao={transacao.descricao}
        valor={transacao.valor}
        tipo={transacao.tipo}
        data={transacao.data}
        categoria={transacao.categoria}
        valorOriginal={transacao.valor_original}
      />

      {/* Formulário de edição - Client Component */}
      <div className="animate-fade-in-up delay-300">
        <FormEditarValor
          transacaoId={transacao.id}
          valorAtual={transacao.valor}
          valorOriginal={transacao.valor_original}
          categoriaAtual={transacao.categoria || ""}
          descricao={transacao.descricao}
          queryString={queryString}
        />
      </div>
    </>
  );
}
