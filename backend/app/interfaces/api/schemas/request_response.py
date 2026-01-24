"""
Schemas Pydantic para API - Camada de Apresentação
Modelos de request/response para FastAPI
"""
from datetime import date, datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field

# ===== TRANSAÇÃO =====

class TransacaoCreateRequest(BaseModel):
    """Schema para request de criação de transação"""
    data: date
    descricao: str = Field(min_length=1)
    valor: float = Field(ge=0)
    tipo: str = Field(pattern="^(entrada|saida)$")
    categoria: Optional[str] = None
    origem: str = "manual"
    banco: Optional[str] = None
    observacoes: Optional[str] = None
    data_fatura: Optional[date] = None


class TransacaoUpdateRequest(BaseModel):
    """Schema para request de atualização parcial"""
    descricao: Optional[str] = Field(None, min_length=1)
    valor: Optional[float] = Field(None, ge=0)
    categoria: Optional[str] = None
    observacoes: Optional[str] = None
    data_fatura: Optional[date] = None


class TransacaoResponse(BaseModel):
    """Schema para response de transação"""
    id: int
    data: date
    descricao: str
    valor: float
    valor_original: Optional[float]
    tipo: str
    categoria: Optional[str]
    origem: str
    banco: Optional[str] = None
    observacoes: Optional[str]
    data_fatura: Optional[date]
    criado_em: datetime
    atualizado_em: datetime
    tag_ids: List[int] = []
    tags: List["TagResponse"] = []  # Objetos Tag completos
    
    class Config:
        from_attributes = True


class ResumoMensalResponse(BaseModel):
    """Schema para response de resumo mensal"""
    mes: Optional[int]
    ano: Optional[int]
    total_entradas: float
    total_saidas: float
    saldo: float
    entradas_por_categoria: Dict[str, float]
    saidas_por_categoria: Dict[str, float]
    
    class Config:
        from_attributes = True


# ===== TAG =====

class TagCreateRequest(BaseModel):
    """Schema para request de criação de tag"""
    nome: str = Field(min_length=1)
    cor: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    descricao: Optional[str] = None


class TagUpdateRequest(BaseModel):
    """Schema para request de atualização de tag"""
    nome: Optional[str] = Field(None, min_length=1)
    cor: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    descricao: Optional[str] = None


class TagResponse(BaseModel):
    """Schema para response de tag"""
    id: int
    nome: str
    cor: Optional[str]
    descricao: Optional[str]
    criado_em: datetime
    atualizado_em: datetime
    
    class Config:
        from_attributes = True


# ===== CONFIGURAÇÃO =====

class ConfiguracaoRequest(BaseModel):
    """Schema para request de configuração"""
    chave: str
    valor: str


class ConfiguracaoResponse(BaseModel):
    """Schema para response de configuração"""
    chave: str
    valor: str


# ===== REGRA =====

class RegraCreateRequest(BaseModel):
    """Schema para request de criação de regra"""
    nome: str = Field(min_length=1, max_length=100)
    tipo_acao: str = Field(pattern="^(alterar_categoria|adicionar_tags|alterar_valor)$")
    criterio_tipo: str = Field(pattern="^(descricao_exata|descricao_contem|categoria)$")
    criterio_valor: str = Field(min_length=1)
    acao_valor: str = Field(min_length=1)
    prioridade: Optional[int] = Field(None, ge=0)
    ativo: bool = True
    tag_ids: Optional[List[int]] = None


class RegraUpdateRequest(BaseModel):
    """Schema para request de atualização de regra"""
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    tipo_acao: Optional[str] = Field(None, pattern="^(alterar_categoria|adicionar_tags|alterar_valor)$")
    criterio_tipo: Optional[str] = Field(None, pattern="^(descricao_exata|descricao_contem|categoria)$")
    criterio_valor: Optional[str] = Field(None, min_length=1)
    acao_valor: Optional[str] = Field(None, min_length=1)
    prioridade: Optional[int] = Field(None, ge=0)
    ativo: Optional[bool] = None
    tag_ids: Optional[List[int]] = None


class RegraResponse(BaseModel):
    """Schema para response de regra"""
    id: int
    nome: str
    tipo_acao: str
    criterio_tipo: str
    criterio_valor: str
    acao_valor: str
    prioridade: int
    ativo: bool
    tag_ids: List[int]
    
    class Config:
        from_attributes = True





# ===== IMPORTAÇÃO =====

class ResultadoArquivoResponse(BaseModel):
    """Schema para response de um arquivo individual em importação múltipla"""
    nome_arquivo: str
    sucesso: bool
    total_importado: int
    transacoes_ids: List[int]
    mensagem: str
    erro: Optional[str] = None


class ResultadoImportacaoMultiplaResponse(BaseModel):
    """Schema para response de importação de múltiplos arquivos"""
    total_arquivos: int
    arquivos_sucesso: int
    arquivos_erro: int
    total_transacoes_importadas: int
    resultados: List[ResultadoArquivoResponse]


# Rebuild models para resolver forward references
TransacaoResponse.model_rebuild()
