import { Configuracao } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper privado para buscar uma configuração
async function obterConfiguracao(
  chave: string
): Promise<{ chave: string; valor: string | null }> {
  const res = await fetch(`${API_URL}/configuracoes/${chave}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch configuracao: ${res.statusText}`);
  }

  return res.json();
}

// Serviço server-side para configurações (Server Components)
export const configuracoesServerService = {
  async listarTodas(): Promise<Record<string, string>> {
    // Busca as configurações conhecidas
    const [diaInicio, criterio] = await Promise.all([
      obterConfiguracao("diaInicioPeriodo"),
      obterConfiguracao("criterio_data_transacao"),
    ]);

    return {
      diaInicioPeriodo: diaInicio.valor || "1",
      criterio_data_transacao: criterio.valor || "data_transacao",
    };
  },
};
