import {
  Transacao,
  TransacaoCreate,
  TransacaoUpdate,
  ResumoMensal,
  Tag,
  TagCreate,
  TagUpdate,
  Regra,
  RegraCreate,
  Usuario,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper para lidar com erros de fetch
async function handleFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }

  // Verifica se há conteúdo na resposta
  const contentType = res.headers.get("content-type");
  const contentLength = res.headers.get("content-length");

  // Se não há conteúdo ou content-length é 0, retorna objeto vazio
  if (contentLength === "0" || !contentType?.includes("application/json")) {
    return {} as T;
  }

  // Tenta parsear o JSON, mas retorna objeto vazio se falhar
  const text = await res.text();
  if (!text || text.trim() === "") {
    return {} as T;
  }

  return JSON.parse(text);
}

// Serviço de transações
export const transacoesService = {
  async listar(params?: {
    mes?: number;
    ano?: number;
    data_inicio?: string;
    data_fim?: string;
    categoria?: string;
    tipo?: string;
    tags?: string;
    sem_tags?: boolean;
    sem_categoria?: boolean;
    criterio_data_transacao?: string;
    usuario_id?: number;
  }): Promise<Transacao[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_URL}/transacoes?${searchParams.toString()}`;
    return handleFetch<Transacao[]>(url, { cache: "no-store" });
  },

  async obter(id: number): Promise<Transacao> {
    return handleFetch<Transacao>(`${API_URL}/transacoes/${id}`, {
      cache: "no-store",
    });
  },

  async criar(transacao: TransacaoCreate): Promise<Transacao> {
    return handleFetch<Transacao>(`${API_URL}/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transacao),
      cache: "no-store",
    });
  },

  async atualizar(id: number, transacao: TransacaoUpdate): Promise<Transacao> {
    return handleFetch<Transacao>(`${API_URL}/transacoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transacao),
      cache: "no-store",
    });
  },

  async restaurarValorOriginal(id: number): Promise<Transacao> {
    return handleFetch<Transacao>(
      `${API_URL}/transacoes/${id}/restaurar-valor`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
  },

  async listarCategorias(): Promise<string[]> {
    return handleFetch<string[]>(`${API_URL}/transacoes/categorias`, {
      cache: "no-store",
    });
  },

  async resumoMensal(
    mes?: number,
    ano?: number,
    data_inicio?: string,
    data_fim?: string,
    tags?: string,
    sem_tags?: boolean,
    criterio_data_transacao?: string,
    usuario_id?: number,
  ): Promise<ResumoMensal> {
    const searchParams = new URLSearchParams();

    if (data_inicio && data_fim) {
      searchParams.append("data_inicio", data_inicio);
      searchParams.append("data_fim", data_fim);
    } else if (mes && ano) {
      searchParams.append("mes", mes.toString());
      searchParams.append("ano", ano.toString());
    }

    if (tags) {
      searchParams.append("tags", tags);
    }

    if (sem_tags) {
      searchParams.append("sem_tags", "true");
    }

    if (criterio_data_transacao) {
      searchParams.append("criterio_data_transacao", criterio_data_transacao);
    }

    if (usuario_id !== undefined) {
      searchParams.append("usuario_id", usuario_id.toString());
    }

    const url = `${API_URL}/transacoes/resumo/mensal?${searchParams.toString()}`;
    return handleFetch<ResumoMensal>(url, { cache: "no-store" });
  },

  async adicionarTag(transacaoId: number, tagId: number): Promise<void> {
    await handleFetch<void>(
      `${API_URL}/transacoes/${transacaoId}/tags/${tagId}`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
  },

  async removerTag(transacaoId: number, tagId: number): Promise<void> {
    await handleFetch<void>(
      `${API_URL}/transacoes/${transacaoId}/tags/${tagId}`,
      {
        method: "DELETE",
        cache: "no-store",
      },
    );
  },
};

export const importacaoService = {
  async importarArquivos(
    arquivos: File[],
    passwords?: string[],
    usuario_id?: number,
  ): Promise<{
    total_arquivos: number;
    arquivos_sucesso: number;
    arquivos_erro: number;
    total_transacoes_importadas: number;
    resultados: Array<{
      nome_arquivo: string;
      sucesso: boolean;
      total_importado: number;
      transacoes_ids: number[];
      mensagem: string;
      erro?: string;
    }>;
  }> {
    const formData = new FormData();

    // Adicionar todos os arquivos
    arquivos.forEach((arquivo) => {
      formData.append("arquivos", arquivo);
    });

    // Adicionar usuário (padrão: 1 = "Não definido")
    formData.append("usuario_id", (usuario_id || 1).toString());

    // Adicionar senhas (formato: "senha1,senha2,senha3")
    if (passwords && passwords.length > 0) {
      const passwordsStr = passwords.join(",");
      formData.append("passwords", passwordsStr);
    }

    const res = await fetch(`${API_URL}/importacao`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
    }

    return res.json();
  },
};

export const configuracoesService = {
  _obterConfiguracao(
    chave: string,
  ): Promise<{ chave: string; valor: string | null }> {
    return handleFetch<{ chave: string; valor: string | null }>(
      `${API_URL}/configuracoes/${chave}`,
      { cache: "no-store" },
    );
  },

  async listarTodas(): Promise<Record<string, string>> {
    // Busca as configurações conhecidas
    const [diaInicio, criterio] = await Promise.all([
      this._obterConfiguracao("diaInicioPeriodo"),
      this._obterConfiguracao("criterio_data_transacao"),
    ]);

    return {
      diaInicioPeriodo: diaInicio.valor || "1",
      criterio_data_transacao: criterio.valor || "data_transacao",
    };
  },

  async salvar(
    chave: string,
    valor: string,
  ): Promise<{ chave: string; valor: string }> {
    return handleFetch<{ chave: string; valor: string }>(
      `${API_URL}/configuracoes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave, valor }),
        cache: "no-store",
      },
    );
  },
};

export const tagsService = {
  async listar(): Promise<Tag[]> {
    return handleFetch<Tag[]>(`${API_URL}/tags`, { cache: "no-store" });
  },

  async criar(tag: TagCreate): Promise<Tag> {
    return handleFetch<Tag>(`${API_URL}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tag),
      cache: "no-store",
    });
  },

  async deletar(id: number): Promise<void> {
    await handleFetch<void>(`${API_URL}/tags/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
  },
};

export const regrasService = {
  async listar(params?: {
    ativo?: boolean;
    tipo_acao?: string;
  }): Promise<Regra[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_URL}/regras?${searchParams.toString()}`;
    return handleFetch<Regra[]>(url, { cache: "no-store" });
  },
  async criar(regra: RegraCreate): Promise<Regra> {
    const url = `${API_URL}/regras`;
    return handleFetch<Regra>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regra),
      cache: "no-store",
    });
  },

  async atualizarPrioridade(
    id: number,
    novaPrioridade: number,
  ): Promise<Regra> {
    return handleFetch<Regra>(`${API_URL}/regras/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prioridade: novaPrioridade }),
      cache: "no-store",
    });
  },

  async toggleAtivo(id: number): Promise<Regra> {
    // Primeiro busca a regra atual
    const regraAtual = await handleFetch<Regra>(`${API_URL}/regras/${id}`, {
      cache: "no-store",
    });

    // Inverte o estado ativo
    return handleFetch<Regra>(`${API_URL}/regras/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !regraAtual.ativo }),
      cache: "no-store",
    });
  },

  async deletar(id: number): Promise<void> {
    await handleFetch<void>(`${API_URL}/regras/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
  },

  async aplicarRetroativamente(
    id: number,
  ): Promise<{ total_processado: number; total_modificado: number }> {
    return handleFetch<{ total_processado: number; total_modificado: number }>(
      `${API_URL}/regras/${id}/aplicar`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );
  },

  async aplicarTodas(): Promise<{
    total_processado: number;
    total_modificado: number;
  }> {
    return handleFetch<{ total_processado: number; total_modificado: number }>(
      `${API_URL}/regras/aplicar-todas`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );
  },
};

// Serviço de usuários
export const usuariosService = {
  async listar(): Promise<Usuario[]> {
    return handleFetch<Usuario[]>(`${API_URL}/usuarios`, {
      cache: "no-store",
    });
  },
};
