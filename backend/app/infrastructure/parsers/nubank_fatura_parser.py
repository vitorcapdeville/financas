"""
Parser de fatura de cartão de crédito do Nubank
"""
from io import BytesIO
from typing import BinaryIO, Optional

import pandas as pd

from app.application.exceptions import ValidationException
from app.domain.parsers.extrato_parser import IExtratoParser


class NubankFaturaParser(IExtratoParser):
    """
    Parser para faturas de cartão de crédito do Nubank.
    
    Formato esperado:
    - Arquivo CSV (.csv)
    - Nome do arquivo: Nubank_YYYY-MM-DD.csv
    - Colunas: date, title, amount
    - Data da fatura extraída do nome do arquivo
    - Adiciona prefixo "[Nubank] " nas descrições
    """
    
    @property
    def parser_id(self) -> str:
        return "nubank_fatura"
    
    @property
    def banco_id(self) -> str:
        return "nubank"
    
    @property
    def nome_banco(self) -> str:
        return "Nubank - Fatura Cartão"
    
    @property
    def formatos_suportados(self) -> list[str]:
        return ['.csv']
    
    def _extract_data_fatura(self, nome_arquivo: str) -> pd.Timestamp:
        """
        Extrai data da fatura do nome do arquivo.
        
        Formato esperado: Nubank_YYYY-MM-DD.csv
        Exemplo: Nubank_2026-01-06.csv -> 2026-01-06
        
        Args:
            nome_arquivo: Nome do arquivo
            
        Returns:
            Data da fatura
            
        Raises:
            ValidationException: Se nome do arquivo não seguir padrão esperado
        """
        try:
            # Remove extensão e pega segunda parte após split por '_'
            nome_sem_extensao = nome_arquivo.replace('.csv', '')
            partes = nome_sem_extensao.split('_')
            
            if len(partes) != 2 or partes[0].lower() != 'nubank':
                raise ValueError("Formato inválido")
            
            data_str = partes[1]
            return pd.to_datetime(data_str, format="%Y-%m-%d")
            
        except (IndexError, ValueError) as e:
            raise ValidationException(
                f"Nome do arquivo deve seguir o padrão Nubank_YYYY-MM-DD.csv. "
                f"Exemplo: Nubank_2026-01-06.csv. Erro: {str(e)}"
            )
    
    def parse(
        self,
        arquivo: BinaryIO,
        nome_arquivo: str,
        password: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Faz parsing da fatura de cartão Nubank.
        
        Args:
            arquivo: Conteúdo do arquivo CSV
            nome_arquivo: Nome do arquivo (formato: Nubank_YYYY-MM-DD.csv)
            password: Senha (não usada para Nubank)
            
        Returns:
            DataFrame com colunas: data, descricao, valor, data_fatura
            
        Raises:
            ValidationException: Se erro ao processar arquivo
        """
        try:
            # Extrair data da fatura do nome do arquivo
            data_fatura = self._extract_data_fatura(nome_arquivo)
            
            # Ler CSV
            arquivo_bytes = arquivo if isinstance(arquivo, bytes) else arquivo.read()
            df = pd.read_csv(BytesIO(arquivo_bytes))
            
            # Validar colunas esperadas
            colunas_esperadas = ['date', 'title', 'amount']
            colunas_faltando = [col for col in colunas_esperadas if col not in df.columns]
            
            if colunas_faltando:
                raise ValidationException(
                    f"Colunas obrigatórias faltando: {', '.join(colunas_faltando)}. "
                    f"Arquivo de fatura Nubank deve ter: {', '.join(colunas_esperadas)}"
                )
            
            # Selecionar e renomear colunas
            df = df[['date', 'title', 'amount']].copy()
            df = df.rename(columns={
                'date': 'data',
                'title': 'descricao',
                'amount': 'valor'
            })
            
            # Adicionar data da fatura
            df['data_fatura'] = data_fatura
            
            # Converter tipos
            df['data'] = pd.to_datetime(df['data'], errors='coerce')
            df['valor'] = pd.to_numeric(df['valor'], errors='coerce')
            
            # Remover linhas inválidas
            df = df.dropna(subset=['data', 'valor', 'descricao'])
            
            
            # Adicionar colunas de contexto
            df['origem'] = 'fatura_cartao'
            df['banco'] = self.banco_id
            
            # Reordenar colunas
            df = df[['data', 'descricao', 'valor', 'data_fatura', 'origem', 'banco']]
            
            return df
            
        except ValidationException:
            # Re-raise ValidationException
            raise
        except Exception as e:
            raise ValidationException(
                f"Erro ao processar fatura Nubank: {str(e)}"
            )
