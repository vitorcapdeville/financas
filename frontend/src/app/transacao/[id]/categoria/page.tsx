import { transacoesService } from "@/services/api.service";
import { construirQueryString } from "@/utils/query";
import Link from "next/link";
import FormEditarCategoria from "@/components/FormEditarCategoria";
import HeaderEdicao from "@/components/HeaderEdicao";
import ResumoTransacao from "@/components/ResumoTransacao";
import TransacaoNaoEncontrada from "@/components/TransacaoNaoEncontrada";

interface CategoriaPageProps {
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

export default async function CategoriaPage({
  params,
  searchParams,
}: CategoriaPageProps) {
  // Next.js 16: params e searchParams são Promises
  const { id: idStr } = await params;
  const search = await searchParams;
  console.log("Search Params:", search);
  const id = parseInt(idStr);

  // Constrói query string preservando filtros (usa utilitário compartilhado)
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
        titulo="Editar Categoria"
        transacaoId={id}
        queryString={queryString}
      />

      <ResumoTransacao
        descricao={transacao.descricao}
        valor={transacao.valor}
        tipo={transacao.tipo}
        data={transacao.data}
        categoria={transacao.categoria}
      />

      {/* Formulário de edição - Client Component */}
      <div className="animate-fade-in-up delay-300">
        <FormEditarCategoria
          transacaoId={transacao.id}
          categoriaAtual={transacao.categoria || ""}
          descricao={transacao.descricao}
          queryString={queryString}
        />
      </div>
    </>
  );
}
