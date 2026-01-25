"""
Interface (Port) de Repositório de Usuarios
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.usuario import Usuario


class IUsuarioRepository(ABC):
    """
    Interface abstrata para operações de persistência de Usuarios.
    
    Princípio DIP: O domínio define a interface, a infraestrutura implementa.
    """
    
    @abstractmethod
    def criar(self, usuario: Usuario) -> Usuario:
        """
        Cria um novo usuário.
        
        Args:
            usuario: Entidade de domínio
            
        Returns:
            Usuario criado com ID gerado
            
        Raises:
            ValueError: Se já existe usuário com mesmo nome
        """
        pass
    
    @abstractmethod
    def buscar_por_id(self, id: int) -> Optional[Usuario]:
        """Busca usuário por ID"""
        pass
    
    @abstractmethod
    def buscar_por_nome(self, nome: str) -> Optional[Usuario]:
        """Busca usuário por nome (case-insensitive)"""
        pass
    
    @abstractmethod
    def listar_todos(self) -> List[Usuario]:
        """
        Lista todos os usuários.
        
        Returns:
            Lista de todos os usuários ordenados por nome
        """
        pass
    
    @abstractmethod
    def atualizar(self, usuario: Usuario) -> Usuario:
        """
        Atualiza um usuário existente.
        
        Args:
            usuario: Entidade com dados atualizados
            
        Returns:
            Usuario atualizado
            
        Raises:
            ValueError: Se usuário não existe ou nome duplicado
        """
        pass
    
    @abstractmethod
    def deletar(self, id: int) -> bool:
        """
        Deleta um usuário.
        
        Args:
            id: ID do usuário
            
        Returns:
            True se deletado com sucesso
            
        Raises:
            ValueError: Se usuário não existe ou tem transações associadas
        """
        pass
