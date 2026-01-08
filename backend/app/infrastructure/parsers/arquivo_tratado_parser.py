"""
Parser para arquivos já normalizados (CSV/Excel tratado)

Este parser lê arquivos que já estão no formato esperado,
sem necessidade de transformações complexas.
"""
from io import BytesIO
from typing import BinaryIO

import pandas as pd

from app.application.exceptions import ValidationException
from app.domain.parsers.extrato_parser import IExtratoParser


class ArquivoTratadoParser(IExtratoParser):
    """
    Parser para arquivos já normalizados.
    
    Formato esperado:
    - CSV ou Excel com colunas obrigatórias: data, descricao, valor, origem
    - Colunas opcionais: categoria, banco, data_fatura
    - Valores já no formato correto (datas, números)
    """
    
    @property
    def parser_id(self) -> str:
        return "arquivo_tratado"
    
    @property
    def banco_id(self) -> str:
        return "arquivo_tratado"
    
    @property
    def nome_banco(self) -> str:
        return "Arquivo Tratado"
    
    @property
    def formatos_suportados(self) -> list[str]:
        return ['.csv', '.xlsx', '.xls']
    
    def parse(self, arquivo: BinaryIO, nome_arquivo: str) -> pd.DataFrame:
        """
        Lê arquivo já normalizado.
        
        Args:
            arquivo: Conteúdo do arquivo
            nome_arquivo: Nome do arquivo
            
        Returns:
            DataFrame com colunas normalizadas
            
        Raises:
            ValidationException: Se faltarem colunas obrigatórias
        """
        try:
            # Detectar formato
            extensao = self._obter_extensao(nome_arquivo)
            arquivo_bytes = arquivo if isinstance(arquivo, bytes) else arquivo.read()
            
            # Ler arquivo
            if extensao == '.csv':
                df = pd.read_csv(BytesIO(arquivo_bytes))
            elif extensao in ['.xlsx', '.xls']:
                df = pd.read_excel(BytesIO(arquivo_bytes))
            else:
                raise ValidationException(
                    f"Formato não suportado: {extensao}. "
                    f"Use {', '.join(self.formatos_suportados)}"
                )
            
            # Normalizar nomes de colunas
            df.columns = df.columns.str.lower().str.strip()
            
            # Validar colunas obrigatórias
            colunas_obrigatorias = ['data', 'descricao', 'valor', 'origem']
            colunas_faltando = [col for col in colunas_obrigatorias if col not in df.columns]
            
            if colunas_faltando:
                raise ValidationException(
                    f"Colunas obrigatórias faltando: {', '.join(colunas_faltando)}. "
                    f"Arquivo tratado deve ter: {', '.join(colunas_obrigatorias)}"
                )
            
            # Converter tipos
            # Para datas, tentar múltiplos formatos (brasileiro e ISO)
            df['data'] = pd.to_datetime(df['data'], dayfirst=True, errors='coerce')
            df['valor'] = pd.to_numeric(df['valor'], errors='coerce')
            
            # Converter data_fatura se existir
            if 'data_fatura' in df.columns:
                df['data_fatura'] = pd.to_datetime(df['data_fatura'], dayfirst=True, errors='coerce')
            
            # Remover linhas inválidas
            df = df.dropna(subset=['data', 'valor', 'descricao'])
            
            # Garantir que origem está em formato correto
            df['origem'] = df['origem'].str.lower().str.strip()
            valores_validos = ['fatura_cartao', 'extrato_bancario']
            df = df[df['origem'].isin(valores_validos)]
            
            if df.empty:
                raise ValidationException(
                    "Nenhuma linha válida encontrada. "
                    "Verifique se 'origem' é 'fatura_cartao' ou 'extrato_bancario'"
                )
            
            return df
            
        except ValidationException:
            raise
        except Exception as e:
            raise ValidationException(
                f"Erro ao processar arquivo tratado: {str(e)}"
            )
    
    def _obter_extensao(self, nome_arquivo: str) -> str:
        """Retorna extensão do arquivo em lowercase"""
        for ext in self.formatos_suportados:
            if nome_arquivo.lower().endswith(ext):
                return ext
        return ''
