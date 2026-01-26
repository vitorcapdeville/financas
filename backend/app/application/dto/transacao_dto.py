"""
DTOs (Data Transfer Objects) para Transações
Objetos simples para transferir dados entre camadas
"""
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import TYPE_CHECKING, Dict, List, Optional

from app.domain.value_objects.tipo_transacao import TipoTransacao

if TYPE_CHECKING:
    from app.application.dto.tag_dto import TagDTO
    from app.application.dto.usuario_dto import UsuarioDTO


@dataclass
class CriarTransacaoDTO:
    """DTO para criação de transação"""
    data: date
    descricao: str
    valor: float
    tipo: TipoTransacao
    categoria: Optional[str] = None
    origem: str = "manual"
    banco: Optional[str] = None
    observacoes: Optional[str] = None
    data_fatura: Optional[date] = None
    usuario_id: int = 1  # ID do usuário responsável (padrão: "Não definido")


@dataclass
class AtualizarTransacaoDTO:
    """DTO para atualização parcial de transação"""
    descricao: Optional[str] = None
    valor: Optional[float] = None
    categoria: Optional[str] = None
    observacoes: Optional[str] = None
    data_fatura: Optional[date] = None


@dataclass
class TransacaoDTO:
    """DTO completo de transação (output)"""
    id: int
    data: date
    descricao: str
    valor: float
    valor_original: Optional[float]
    tipo: TipoTransacao
    categoria: Optional[str]
    origem: str
    banco: Optional[str] = None
    observacoes: Optional[str] = None
    data_fatura: Optional[date] = None
    criado_em: datetime = field(default_factory=datetime.now)
    atualizado_em: datetime = field(default_factory=datetime.now)
    tag_ids: List[int] = field(default_factory=list)
    tags: List["TagDTO"] = field(default_factory=list)  # Objetos Tag completos
    usuario_id: int = 1  # ID do usuário responsável
    usuario: Optional["UsuarioDTO"] = None  # Objeto Usuario completo


@dataclass
class FiltrosTransacaoDTO:
    """DTO para filtros de listagem"""
    mes: Optional[int] = None
    ano: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    categoria: Optional[str] = None
    tipo: Optional[TipoTransacao] = None
    tag_ids: Optional[List[int]] = None
    sem_tags: bool = False  # Filtrar apenas transações sem tags
    sem_categoria: bool = False  # Filtrar apenas transações sem categoria
    criterio_data: str = "data_transacao"
    usuario_id: Optional[int] = None  # Novo filtro por usuário


@dataclass
class ResumoMensalDTO:
    """DTO para resumo mensal de transações"""
    mes: Optional[int]
    ano: Optional[int]
    total_entradas: float
    total_saidas: float
    saldo: float
    entradas_por_categoria: Dict[str, float]
    saidas_por_categoria: Dict[str, float]
