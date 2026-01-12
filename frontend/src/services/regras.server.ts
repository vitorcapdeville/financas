/**
 * Server-side service para regras automáticas
 * Usado em Server Components para buscar dados da API
 */

import { Regra, TipoAcao } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const regrasServerService = {
  /**
   * Lista todas as regras ordenadas por prioridade (maior primeiro)
   */
  async listar(params?: {
    ativo?: boolean;
    tipo_acao?: TipoAcao;
  }): Promise<Regra[]> {
    const queryParams = new URLSearchParams();
    if (params?.ativo !== undefined) {
      queryParams.set("ativo", params.ativo.toString());
    }
    if (params?.tipo_acao) {
      queryParams.set("tipo_acao", params.tipo_acao);
    }

    const url = `${API_URL}/regras${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Erro ao buscar regras: ${res.statusText}`);
    }

    return res.json();
  },
};
