"""
Interface (Port) de Repositório de Configurações
"""
from abc import ABC, abstractmethod
from typing import Optional


class IConfiguracaoRepository(ABC):
    """
    Interface abstrata para operações de persistência de Configurações.
    
    Sistema de configurações key-value para preferências da aplicação.
    """
    
    @abstractmethod
    def obter(self, chave: str) -> Optional[str]:
        """
        Obtém o valor de uma configuração.
        
        Args:
            chave: Chave da configuração
            
        Returns:
            Valor da configuração ou None se não existe
        """
        pass
    
    @abstractmethod
    def salvar(self, chave: str, valor: str) -> None:
        """
        Salva ou atualiza uma configuração.
        
        Args:
            chave: Chave da configuração
            valor: Valor a salvar
        """
        pass
