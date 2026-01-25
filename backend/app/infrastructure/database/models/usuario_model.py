"""
SQLModel Models para Usuarios
"""
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from pydantic import model_validator
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.infrastructure.database.models.transacao_model import TransacaoModel


class UsuarioModel(SQLModel, table=True):
    """
    Model SQLModel para persistência de Usuarios.
    
    IMPORTANTE: Model de infraestrutura, NÃO entidade de domínio.
    """
    
    __tablename__ = "usuario"  # type: ignore
    __table_args__ = {'extend_existing': True}  # type: ignore
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str = Field(index=True, unique=True, description="Nome único do usuário")
    cpf: Optional[str] = Field(default=None, description="CPF (usado como senha BTG)")
    criado_em: datetime = Field(default_factory=datetime.now)
    atualizado_em: datetime = Field(default_factory=datetime.now)
    
    # Relacionamentos
    transacoes: List["TransacaoModel"] = Relationship(back_populates="usuario")
    
    @model_validator(mode='after')
    def normalizar_campos(self):
        """Normaliza nome e CPF"""
        if self.nome:
            self.nome = self.nome.strip()
        if self.cpf:
            self.cpf = self.cpf.strip()
        return self
