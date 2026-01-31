import { transacoesService, usuariosService } from "@/services/api.service";
import FiltroUsuario from "@/components/FiltroUsuario";
import { formatarData, formatarMoeda } from "@/utils/format";
import {
  calcularPeriodoCustomizado,
  extrairPeriodoDaURL,
} from "@/utils/periodo";
import { construirQueryString } from "@/utils/query";
import FiltrosPeriodo from "@/components/FiltrosPeriodo";
import FiltroTags from "@/components/FiltroTags";
import Link from "next/link";
import ListaTransacoes from "@/components/ListaTransacoes";

interface CategoriaPageProps {
  params: Promise<{
    nome: string;
  }>;
  searchParams: Promise<{
    tipo?: "entrada" | "saida";
    periodo?: string;
    diaInicio?: string;
    criterio?: string;
    tags?: string;
    sem_tags?: string;
    usuario_id?: string;
  }>;
}

export default async function CategoriaPage(props: CategoriaPageProps) {
  // Next.js 16: params e searchParams são Promises que precisam ser awaited
  const params = await props.params;
  const searchParams = await props.searchParams;
  const usuarios = await usuariosService.listar();
  const usuarioIdSelecionado = searchParams.usuario_id
    ? Number(searchParams.usuario_id)
    : undefined;
  const categoria = decodeURIComponent(params.nome);
  const tipo = searchParams.tipo;
  const { periodo, mes, ano, diaInicio, criterio } =
    extrairPeriodoDaURL(searchParams);
  const { data_inicio, data_fim } = calcularPeriodoCustomizado(
    mes,
    ano,
    diaInicio,
  );

  // Constrói query string preservando filtros (usa utilitário compartilhado)
  const queryString = construirQueryString({
    searchParams,
    periodo,
    diaInicio,
    criterio,
    usuarioIdSelecionado,
    origem: `categoria:${categoria}`,
  });

  // Busca transações do período atual
  let transacoes: import("@/types").Transacao[];
  try {
    transacoes = await transacoesService.listar({
      data_inicio,
      data_fim,
      categoria: categoria === "Sem categoria" ? undefined : categoria,
      tipo: tipo || undefined,
      tags: searchParams.tags,
      sem_tags: searchParams.sem_tags === "true",
      criterio_data_transacao: criterio,
      usuario_id: usuarioIdSelecionado,
      sem_categoria: categoria === "Sem categoria",
    });
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
    transacoes = [];
  }

  // Calcula comparativo dos 3 meses anteriores
  const comparativoMeses = [];
  for (let i = 1; i <= 3; i++) {
    let mesCalc = mes - i;
    let anoCalc = ano;
    if (mesCalc < 1) {
      mesCalc += 12;
      anoCalc -= 1;
    }

    const periodoAnterior = calcularPeriodoCustomizado(
      mesCalc,
      anoCalc,
      diaInicio,
    );
    try {
      const transacoesMes = await transacoesService.listar({
        data_inicio: periodoAnterior.data_inicio,
        data_fim: periodoAnterior.data_fim,
        categoria: categoria === "Sem categoria" ? undefined : categoria,
        tipo: tipo || undefined,
        tags: searchParams.tags,
        criterio_data_transacao: criterio,
        sem_tags: searchParams.sem_tags === "true",
        sem_categoria: categoria === "Sem categoria",
        usuario_id: usuarioIdSelecionado,
      });

      const total = transacoesMes.reduce((sum, t) => sum + t.valor, 0);
      comparativoMeses.push({
        mes: `${String(mesCalc).padStart(2, "0")}/${anoCalc}`,
        total,
      });
    } catch (error) {
      console.error("Erro ao carregar comparativo:", error);
      comparativoMeses.push({
        mes: `${String(mesCalc).padStart(2, "0")}/${anoCalc}`,
        total: 0,
      });
    }
  }
  comparativoMeses.reverse();

  const totalAtual = transacoes.reduce((sum, t) => sum + t.valor, 0);

  return (
    <>
      {/* Header */}
      <div className="mb-10 animate-fade-in-up delay-100">
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
            {categoria}
          </h1>
          <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
        </div>
        <p className="text-lg text-[#8b8378]">
          {tipo === "entrada"
            ? "Entradas"
            : tipo === "saida"
              ? "Saídas"
              : "Transações"}{" "}
          desta categoria
        </p>
      </div>

      {/* Filtro de Período */}
      <div className="animate-fade-in-up delay-200">
        <FiltrosPeriodo />
      </div>

      <div className="animate-fade-in-up delay-200">
        <FiltroUsuario
          usuarios={usuarios}
          usuarioIdSelecionado={usuarioIdSelecionado}
        />
      </div>

      {/* Filtro de Tags */}
      <div className="animate-fade-in-up delay-300">
        <FiltroTags />
      </div>

      {/* Comparativo Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up delay-[400ms]">
        <div
          className="card-premium p-6 md:col-span-1 border-2 relative overflow-hidden"
          style={{ borderColor: tipo === "entrada" ? "#2d8659" : "#c44536" }}
        >
          <div
            className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5"
            style={{ background: tipo === "entrada" ? "#2d8659" : "#c44536" }}
          ></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-[#8b8378] mb-2">
              Mês Atual
            </h3>
            <p
              className="text-3xl font-bold text-financial"
              style={{ color: tipo === "entrada" ? "#2d8659" : "#c44536" }}
            >
              {formatarMoeda(totalAtual)}
            </p>
          </div>
        </div>
        {comparativoMeses.map((item, index) => (
          <div
            key={index}
            className="card-premium p-6 relative overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#156064] opacity-5"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-medium text-[#8b8378] mb-2">
                {item.mes}
              </h3>
              <p className="text-2xl font-bold text-[#2d2d2d]">
                {formatarMoeda(item.total)}
              </p>
              {item.total > 0 && (
                <p className="text-xs text-[#8b8378] mt-2 flex items-center gap-1">
                  {totalAtual > item.total ? (
                    <>
                      <span className="text-[#c44536] font-semibold">↗</span>
                      <span className="text-[#c44536]">
                        +{formatarMoeda(totalAtual - item.total)}
                      </span>
                    </>
                  ) : totalAtual < item.total ? (
                    <>
                      <span className="text-[#2d8659] font-semibold">↘</span>
                      <span className="text-[#2d8659]">
                        {formatarMoeda(totalAtual - item.total)}
                      </span>
                    </>
                  ) : (
                    "Sem mudança"
                  )}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Transações */}
      {transacoes.length === 0 ? (
        <div className="card-premium p-12 text-center animate-fade-in-up delay-500">
          <div
            className="inline-flex items-center justify-center p-6 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, #8b8378, #a09589)",
            }}
          >
            <span className="text-4xl">📊</span>
          </div>
          <p className="text-[#8b8378] text-lg">
            Nenhuma transação encontrada nesta categoria
          </p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden animate-fade-in-up delay-500">
          <div className="p-6 border-b border-[#d4c5b9]">
            <h2 className="text-2xl font-bold text-display text-[#0f3d3e]">
              Transações ({transacoes.length})
            </h2>
          </div>
          <ListaTransacoes transacoes={transacoes} queryString={queryString} />
        </div>
      )}
    </>
  );
}
