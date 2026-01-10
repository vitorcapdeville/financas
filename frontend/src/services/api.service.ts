import api from "@/lib/api";
import {
  Transacao,
  TransacaoCreate,
  TransacaoUpdate,
  ResumoMensal,
  Tag,
  TagCreate,
  TagUpdate,
} from "@/types";

export const transacoesService = {
  async listar(params?: {
    mes?: number;
    ano?: number;
    data_inicio?: string;
    data_fim?: string;
    categoria?: string;
    tipo?: string;
    tags?: string; // IDs separados por vírgula
  }): Promise<Transacao[]> {
    const { data } = await api.get("/transacoes", { params });
    return data;
  },

  async obter(id: number): Promise<Transacao> {
    const { data } = await api.get(`/transacoes/${id}`);
    return data;
  },

  async criar(transacao: TransacaoCreate): Promise<Transacao> {
    const { data } = await api.post("/transacoes", transacao);
    return data;
  },

  async atualizar(id: number, transacao: TransacaoUpdate): Promise<Transacao> {
    const { data } = await api.patch(`/transacoes/${id}`, transacao);
    return data;
  },

  async restaurarValorOriginal(id: number): Promise<Transacao> {
    const { data } = await api.post(`/transacoes/${id}/restaurar-valor`);
    return data;
  },

  async listarCategorias(): Promise<string[]> {
    const { data } = await api.get("/transacoes/categorias");
    return data;
  },

  async resumoMensal(
    mes?: number,
    ano?: number,
    data_inicio?: string,
    data_fim?: string
  ): Promise<ResumoMensal> {
    const params: any = {};
    if (data_inicio && data_fim) {
      params.data_inicio = data_inicio;
      params.data_fim = data_fim;
    } else if (mes && ano) {
      params.mes = mes;
      params.ano = ano;
    }
    const { data } = await api.get("/transacoes/resumo/mensal", { params });
    return data;
  },

  async listarTags(transacaoId: number): Promise<Tag[]> {
    const { data } = await api.get(`/transacoes/${transacaoId}/tags`);
    return data;
  },

  async adicionarTag(transacaoId: number, tagId: number): Promise<void> {
    await api.post(`/transacoes/${transacaoId}/tags/${tagId}`);
  },

  async removerTag(transacaoId: number, tagId: number): Promise<void> {
    await api.delete(`/transacoes/${transacaoId}/tags/${tagId}`);
  },
};

export const importacaoService = {
  async importarArquivo(
    arquivo: File
  ): Promise<{
    total_importado: number;
    transacoes_ids: number[];
    mensagem: string;
  }> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    const { data } = await api.post("/importacao", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export const configuracoesService = {
  async obter(chave: string): Promise<{ chave: string; valor: string | null }> {
    const { data } = await api.get(`/configuracoes/${chave}`);
    return data;
  },

  async salvar(
    chave: string,
    valor: string
  ): Promise<{ chave: string; valor: string }> {
    const { data } = await api.post("/configuracoes/", { chave, valor });
    return data;
  },
};

export const tagsService = {
  async listar(): Promise<Tag[]> {
    const { data } = await api.get("/tags");
    return data;
  },

  async obter(id: number): Promise<Tag> {
    const { data } = await api.get(`/tags/${id}`);
    return data;
  },

  async criar(tag: TagCreate): Promise<Tag> {
    const { data } = await api.post("/tags", tag);
    return data;
  },

  async atualizar(id: number, tag: TagUpdate): Promise<Tag> {
    const { data } = await api.patch(`/tags/${id}`, tag);
    return data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};
