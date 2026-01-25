"""
DTOs (Data Transfer Objects) para Usuarios
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class UsuarioDTO:
    """DTO completo de usuário (output)"""
    id: int
    nome: str
    cpf: Optional[str]
    criado_em: datetime
    atualizado_em: datetime
