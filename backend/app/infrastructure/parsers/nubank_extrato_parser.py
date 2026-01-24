"""
Parser de extrato bancário do Nubank
"""
from io import BytesIO
from typing import BinaryIO, Optional

import pandas as pd

from app.application.exceptions import ValidationException
from app.domain.parsers.extrato_parser import IExtratoParser


class NubankExtratoParser(IExtratoParser):
    """
    Parser para extratos bancários do Nubank.
    
    Formato esperado:
    - Arquivo CSV (.csv)
    - Nome do arquivo: NU_NNNNNN_DDMMMYYYY_DDMMMYYYY.csv
      Exemplo: NU_454757980_01NOV2025_30NOV2025.csv
    - Colunas: Data, Valor, Descrição
    - Encoding: UTF-8
    """
    
    @property
    def parser_id(self) -> str:
        return "nubank_extrato"
    
    @property
    def banco_id(self) -> str:
        return "nubank"
    
    @property
    def nome_banco(self) -> str:
        return "Nubank - Extrato Bancário"
    
    @property
    def formatos_suportados(self) -> list[str]:
        return ['.csv']
    
    def validar_formato(self, arquivo: BinaryIO, nome_arquivo: str) -> bool:
        """
        Valida se o arquivo é um extrato Nubank válido.
        
        Critérios:
        - Extensão .csv
        - Nome no padrão NU_NNNNNN_DDMMMYYYY_DDMMMYYYY.csv
        """
        import re
        
        # Validar extensão
        extensao = self._obter_extensao(nome_arquivo)
        if extensao not in self.formatos_suportados:
            return False
        
        # Validar padrão do nome
        # NU_454757980_01NOV2025_30NOV2025.csv
        padrao = r'^NU_\d+_\d{2}[A-Z]{3}\d{4}_\d{2}[A-Z]{3}\d{4}\.csv$'
        if not re.match(padrao, nome_arquivo, re.IGNORECASE):
            return False
        
        return True
    
    def parse(self, arquivo: BinaryIO, nome_arquivo: str, password: Optional[str] = None) -> pd.DataFrame:
        """
        Faz parsing do extrato Nubank.
        
        Args:
            arquivo: Arquivo CSV em bytes
            nome_arquivo: Nome do arquivo (para validação)
            password: Não utilizado (extrato Nubank não tem senha)
            
        Returns:
            DataFrame com colunas: data, descricao, valor, origem, banco
            
        Raises:
            ValidationException: Se o arquivo for inválido
        """
        if not self.validar_formato(arquivo, nome_arquivo):
            raise ValidationException(
                f"Arquivo '{nome_arquivo}' não é um extrato Nubank válido. "
                f"Formato esperado: NU_NNNNNN_DDMMMYYYY_DDMMMYYYY.csv"
            )
        
        try:
            # Ler CSV
            df = pd.read_csv(BytesIO(arquivo), encoding='utf-8')
            
            # Validar colunas obrigatórias
            colunas_esperadas = ['Data', 'Valor', 'Descrição']
            colunas_faltando = [col for col in colunas_esperadas if col not in df.columns]
            
            if colunas_faltando:
                raise ValidationException(
                    f"Colunas faltando no extrato Nubank: {', '.join(colunas_faltando)}. "
                    f"Esperado: {', '.join(colunas_esperadas)}"
                )
            
            # Selecionar e renomear colunas
            df = df[['Data', 'Descrição', 'Valor']].copy()
            df = df.rename(columns={
                'Data': 'data',
                'Descrição': 'descricao',
                'Valor': 'valor'
            })
            
            # Converter tipos
            df['data'] = pd.to_datetime(df['data'], format='%d/%m/%Y', errors='coerce')
            df['valor'] = pd.to_numeric(df['valor'], errors='coerce')
            
            # Remover linhas inválidas
            df = df.dropna(subset=['data', 'valor', 'descricao'])
            
            # Adicionar colunas de contexto
            df['origem'] = 'extrato_bancario'
            df['banco'] = self.banco_id
            
            return df
            
        except ValidationException:
            # Re-raise ValidationException
            raise
        except Exception as e:
            raise ValidationException(
                f"Erro ao processar extrato Nubank: {str(e)}"
            )
    
    def _obter_extensao(self, nome_arquivo: str) -> str:
        """Retorna extensão do arquivo em lowercase"""
        for ext in self.formatos_suportados:
            if nome_arquivo.lower().endswith(ext):
                return ext
        return ''
