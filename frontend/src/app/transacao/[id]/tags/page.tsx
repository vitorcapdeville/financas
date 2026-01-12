import { transacoesService } from "@/services/api.service";
import { tagsServerService } from "@/services/tags.server";
import { Tag } from "@/types";
import Link from "next/link";
import FormGerenciarTags from "@/components/FormGerenciarTags";
import HeaderEdicao from "@/components/HeaderEdicao";
import ResumoTransacao from "@/components/ResumoTransacao";
import TransacaoNaoEncontrada from "@/components/TransacaoNaoEncontrada";

interface TagsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
  }>;
}

export default async function TagsPage({
  params,
  searchParams,
}: TagsPageProps) {
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
    todasTags = await tagsServerService.listar();
  } catch (error) {
    console.error("Erro ao carregar tags:", error);
    todasTags = [];
  }

  if (!transacao) {
    return <TransacaoNaoEncontrada queryString={queryString} />;
  }

  return (
    <>
      <HeaderEdicao
        titulo="Gerenciar Tags"
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

      {/* Formulário de gerenciamento de tags - Client Component */}
      <div className="animate-fade-in-up delay-300">
        <FormGerenciarTags
          transacaoId={transacao.id}
          tagsAtuais={transacao.tags || []}
          todasTags={todasTags}
          categoriaAtual={transacao.categoria || ""}
          descricao={transacao.descricao}
          queryString={queryString}
        />
      </div>
    </>
  );
}
