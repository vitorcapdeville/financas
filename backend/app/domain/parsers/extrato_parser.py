"""
Interface para parsers de extrato bancário
"""
from abc import ABC, abstractmethod
from typing import BinaryIO

import pandas as pd


class IExtratoParser(ABC):
    """
    Interface para parsers de extrato bancário.
    
    Cada banco tem seu próprio formato de exportação de extrato.
    Implementações concretas desta interface devem:
    - Ler o arquivo bruto do banco
    - Normalizar os dados para formato padrão
    - Retornar DataFrame com colunas: data, descricao, valor, categoria (opcional)
    
    Seguindo Clean Architecture, esta interface está no domínio,
    mas as implementações concretas ficam na infraestrutura.
    """
    
    @property
    @abstractmethod
    def parser_id(self) -> str:
        """
        Identificador único do parser (ex: 'btg_extrato', 'btg_fatura', 'nubank_extrato').
        Usado como chave no registry para diferenciar extrato de fatura do mesmo banco.
        """
        pass
    
    @property
    @abstractmethod
    def banco_id(self) -> str:
        """
        Identificador do banco (ex: 'btg', 'nubank', 'inter').
        Usado para popular a coluna 'banco' no DataFrame.
        """
        pass
    
    @property
    @abstractmethod
    def nome_banco(self) -> str:
        """Nome legível do banco (ex: 'BTG Pactual', 'Nubank', 'Inter')"""
        pass
    
    @property
    @abstractmethod
    def formatos_suportados(self) -> list[str]:
        """Extensões de arquivo suportadas (ex: ['.xls', '.xlsx', '.csv'])"""
        pass
    
    @abstractmethod
    def parse(self, arquivo: BinaryIO, nome_arquivo: str) -> pd.DataFrame:
        """
        Faz parsing do arquivo de extrato bruto do banco.
        
        Args:
            arquivo: Conteúdo do arquivo (bytes)
            nome_arquivo: Nome do arquivo para determinar formato
            
        Returns:
            DataFrame normalizado com colunas:
            - data: datetime
            - descricao: str
            - valor: float (positivo para entrada, negativo para saída)
            - categoria: str (opcional, se o banco fornecer)
            
        Raises:
            ValidationException: Se arquivo inválido ou formato incorreto
        """
        pass
    
    def validar_formato(self, nome_arquivo: str) -> bool:
        """
        Valida se o arquivo tem formato suportado por este parser.
        
        Args:
            nome_arquivo: Nome do arquivo
            
        Returns:
            True se formato suportado, False caso contrário
        """
        return any(nome_arquivo.lower().endswith(fmt) for fmt in self.formatos_suportados)
