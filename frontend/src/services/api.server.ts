import { Transacao, TransacaoCreate, TransacaoUpdate, ResumoMensal } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Serviços server-side usando fetch nativo (para Server Components)
export const transacoesServerService = {
  async listar(params?: {
    mes?: number;
    ano?: number;
    data_inicio?: string;
    data_fim?: string;
    categoria?: string;
    tipo?: string;
    tags?: string;
    criterio_data_transacao?: string;
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
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    
    return res.json();
  },

  async obter(id: number): Promise<Transacao> {
    const res = await fetch(`${API_URL}/transacoes/${id}`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    
    return res.json();
  },

  async resumoMensal(
    mes?: number,
    ano?: number,
    data_inicio?: string,
    data_fim?: string,
    tags?: string,
    criterio_data_transacao?: string
  ): Promise<ResumoMensal> {
    const searchParams = new URLSearchParams();
    
    if (data_inicio && data_fim) {
      searchParams.append('data_inicio', data_inicio);
      searchParams.append('data_fim', data_fim);
    } else if (mes && ano) {
      searchParams.append('mes', mes.toString());
      searchParams.append('ano', ano.toString());
    }
    
    if (tags) {
      searchParams.append('tags', tags);
    }
    
    if (criterio_data_transacao) {
      searchParams.append('criterio_data_transacao', criterio_data_transacao);
    }
    
    const url = `${API_URL}/transacoes/resumo/mensal?${searchParams.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    
    return res.json();
  },
};
