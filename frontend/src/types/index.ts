export enum TipoTransacao {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

export interface Tag {
  id: number;
  nome: string;
  cor?: string;
  descricao?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface TagCreate {
  nome: string;
  cor?: string;
  descricao?: string;
}

export interface TagUpdate {
  nome?: string;
  cor?: string;
  descricao?: string;
}

export interface Transacao {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  valor_original?: number; // Valor original antes de edições
  tipo: TipoTransacao;
  categoria?: string;
  origem: string;
  banco?: string;
  observacoes?: string;
  data_fatura?: string; // Data de fechamento/pagamento da fatura
  criado_em: string;
  atualizado_em: string;
  tags: Tag[];
}

export interface TransacaoCreate {
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria?: string;
  origem?: string;
  banco?: string;
  observacoes?: string;
  data_fatura?: string;
}

export interface TransacaoUpdate {
  data?: string;
  descricao?: string;
  valor?: number;
  tipo?: TipoTransacao;
  categoria?: string;
  observacoes?: string;
  data_fatura?: string;
}

export interface ResumoMensal {
  mes: number;
  ano: number;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  entradas_por_categoria: Record<string, number>;
  saidas_por_categoria: Record<string, number>;
}

export enum CriterioDataTransacao {
  DATA_TRANSACAO = 'data_transacao',
  DATA_FATURA = 'data_fatura',
}

export interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  criado_em: string;
  atualizado_em: string;
}

export interface ConfiguracaoCreate {
  chave: string;
  valor: string;
}

export enum TipoAcao {
  ALTERAR_CATEGORIA = 'alterar_categoria',
  ADICIONAR_TAGS = 'adicionar_tags',
  ALTERAR_VALOR = 'alterar_valor',
}

export enum CriterioTipo {
  DESCRICAO_EXATA = 'descricao_exata',
  DESCRICAO_CONTEM = 'descricao_contem',
  CATEGORIA = 'categoria',
}

export interface Regra {
  id: number;
  nome: string;
  tipo_acao: TipoAcao;
  criterio_tipo: CriterioTipo;
  criterio_valor: string;
  acao_valor: string;
  prioridade: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface RegraCreate {
  nome: string;
  tipo_acao: TipoAcao;
  criterio_tipo: CriterioTipo;
  criterio_valor: string;
  acao_valor: string;
}

export interface RegraUpdate {
  nome?: string;
  prioridade?: number;
  ativo?: boolean;
}
