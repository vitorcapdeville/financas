"""
Entidade de domínio - Usuario
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Usuario:
    """
    Entidade de domínio representando um usuário do sistema.
    
    Regras de Negócio:
    - Nome é obrigatório e único
    - CPF é opcional mas usado como senha para faturas BTG
    - Nome deve ser normalizado (strip)
    """
    
    id: Optional[int] = None
    nome: str = ""
    cpf: Optional[str] = None
    criado_em: datetime = field(default_factory=datetime.now)
    atualizado_em: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        """Normaliza e valida após inicialização"""
        self._normalizar_nome()
        self._normalizar_cpf()
    
    def _normalizar_nome(self):
        """Regra: nome deve ser normalizado (strip)"""
        if self.nome:
            self.nome = self.nome.strip()
    
    def _normalizar_cpf(self):
        """Regra: CPF deve ser normalizado (strip e sem formatação)"""
        if self.cpf:
            self.cpf = self.cpf.strip()
    
    def atualizar_nome(self, novo_nome: str):
        """Atualiza o nome do usuário"""
        self.nome = novo_nome.strip()
        self.atualizar()
    
    def atualizar_cpf(self, novo_cpf: Optional[str]):
        """Atualiza o CPF do usuário"""
        self.cpf = novo_cpf.strip() if novo_cpf else None
        self.atualizar()
    
    def atualizar(self):
        """Atualiza timestamp de modificação"""
        self.atualizado_em = datetime.now()
