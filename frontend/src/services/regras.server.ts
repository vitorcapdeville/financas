/**
 * Server-side service para regras automáticas
 * Usado em Server Components para buscar dados da API
 */

import { Regra, TipoAcao } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
      queryParams.set('ativo', params.ativo.toString());
    }
    if (params?.tipo_acao) {
      queryParams.set('tipo_acao', params.tipo_acao);
    }

    const url = `${API_URL}/regras${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Erro ao buscar regras: ${res.statusText}`);
    }
    
    return res.json();
  },

  /**
   * Obtém uma regra específica por ID
   */
  async obter(id: number): Promise<Regra> {
    const res = await fetch(`${API_URL}/regras/${id}`, { cache: 'no-store' });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Regra não encontrada');
      }
      throw new Error(`Erro ao buscar regra: ${res.statusText}`);
    }
    
    return res.json();
  },

  /**
   * Lista tags para exibir nas opções de regras de adicionar tags
   */
  async listarTags(): Promise<Array<{ id: number; nome: string }>> {
    const res = await fetch(`${API_URL}/tags`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Erro ao buscar tags: ${res.statusText}`);
    }
    
    return res.json();
  },
};
