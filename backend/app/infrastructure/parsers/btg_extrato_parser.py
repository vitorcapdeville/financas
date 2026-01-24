"""
Parser de extrato bancário do BTG Pactual
"""
from io import BytesIO
from typing import BinaryIO

import pandas as pd

from app.application.exceptions import ValidationException
from app.domain.parsers.extrato_parser import IExtratoParser


class BTGExtratoParser(IExtratoParser):
    """
    Parser para extratos do BTG Pactual.
    
    Formato esperado:
    - Arquivo Excel (.xls ou .xlsx)
    - Colunas: B (data), C (categoria), D (transacao), G (descricao), K (valor)
    - Formato de data: DD/MM/YYYY HH:MM
    - Linhas a ignorar: Saldo Diário, cabeçalhos, vazias
    """
    
    @property
    def parser_id(self) -> str:
        return "btg_extrato"
    
    @property
    def banco_id(self) -> str:
        return "btg"
    
    @property
    def nome_banco(self) -> str:
        return "BTG Pactual"
    
    @property
    def formatos_suportados(self) -> list[str]:
        return ['.xls', '.xlsx']
    
    def parse(self, arquivo: BinaryIO, nome_arquivo: str, password: str | None = None) -> pd.DataFrame:
        """
        Faz parsing do extrato BTG.
        
        Args:
            arquivo: Conteúdo do arquivo Excel
            nome_arquivo: Nome do arquivo
            password: Senha (não usada para extrato BTG)
            
        Returns:
            DataFrame com colunas: data, descricao, valor, categoria
            
        Raises:
            ValidationException: Se erro ao processar arquivo
        """
        try:
            df = pd.read_excel(
                BytesIO(arquivo),
                usecols="B,C,D,G,K",
                names=["data", "categoria", "transacao", "descricao", "valor"]
            )
            
            # Filtrar linhas inválidas
            df = df.query(
                "data.notnull() and "
                "valor.notnull() and "
                "descricao != 'Saldo Diário' and "
                "data != 'Data e hora' and "
                "descricao != ''"
            ).copy()  # .copy() evita SettingWithCopyWarning
            
            # Converter data
            df["data"] = pd.to_datetime(df["data"], format="%d/%m/%Y %H:%M")
            
            # Converter valor para float
            df["valor"] = pd.to_numeric(df["valor"], errors='coerce')
            
            # Remover linhas onde conversão falhou
            df = df.dropna(subset=["data", "valor"])
            
            # Selecionar e ordenar colunas
            df = df[["data", "descricao", "valor", "categoria"]]
            
            # Adicionar colunas de contexto (origem e banco)
            df['origem'] = 'extrato_bancario'
            df['banco'] = self.banco_id
            
            return df
            
        except Exception as e:
            raise ValidationException(
                f"Erro ao processar extrato BTG: {str(e)}"
            )
