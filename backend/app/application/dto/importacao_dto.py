"""
DTOs para Importação
"""
from dataclasses import dataclass
from datetime import date
from typing import List


@dataclass
class LinhaImportacaoDTO:
    """DTO representando uma linha do arquivo de importação"""
    data: date
    descricao: str
    valor: float
    categoria: str | None = None
    data_fatura: date | None = None


@dataclass
class ResultadoImportacaoDTO:
    """DTO de resposta da importação"""
    total_importado: int
    transacoes_ids: List[int]
    mensagem: str


@dataclass
class ResultadoArquivoDTO:
    """DTO de resposta para um arquivo individual em importação múltipla"""
    nome_arquivo: str
    sucesso: bool
    total_importado: int
    transacoes_ids: List[int]
    mensagem: str
    erro: str | None = None


@dataclass
class ResultadoImportacaoMultiplaDTO:
    """DTO de resposta para importação de múltiplos arquivos"""
    total_arquivos: int
    arquivos_sucesso: int
    arquivos_erro: int
    total_transacoes_importadas: int
    resultados: List[ResultadoArquivoDTO]
