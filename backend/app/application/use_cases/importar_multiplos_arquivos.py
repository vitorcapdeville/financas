"""
Use Case: Importar Múltiplos Arquivos

Processa múltiplos arquivos em uma única requisição.
Cada arquivo é processado independentemente com seu próprio parser.

Fluxo:
1. Itera sobre cada arquivo
2. Para cada arquivo, usa ImportarArquivoUseCase
3. Captura erros individuais sem interromper processamento
4. Retorna relatório consolidado
"""
from typing import BinaryIO, List, Tuple

from app.application.dto.importacao_dto import (
    ResultadoArquivoDTO,
    ResultadoImportacaoMultiplaDTO,
)
from app.application.use_cases.importar_arquivo import ImportarArquivoUseCase
from app.domain.repositories.regra_repository import IRegraRepository
from app.domain.repositories.tag_repository import ITagRepository
from app.domain.repositories.transacao_repository import ITransacaoRepository
from app.domain.repositories.usuario_repository import IUsuarioRepository


class ImportarMultiplosArquivosUseCase:
    """
    Orquestra a importação de múltiplos arquivos.
    
    Responsabilidades (Single Responsibility):
    - Processar múltiplos arquivos em sequência
    - Capturar erros individuais
    - Consolidar resultados
    
    Design Patterns:
    - Composition: Usa ImportarArquivoUseCase para lógica individual
    - Fail-Safe: Continua processamento mesmo com erros individuais
    """
    
    def __init__(
        self,
        transacao_repo: ITransacaoRepository,
        tag_repo: ITagRepository,
        regra_repo: IRegraRepository,
        usuario_repo: IUsuarioRepository
    ):
        # Compõe use case existente (reuso de código)
        self._importar_arquivo_use_case = ImportarArquivoUseCase(
            transacao_repo=transacao_repo,
            tag_repo=tag_repo,
            regra_repo=regra_repo,
            usuario_repo=usuario_repo
        )
    
    def execute(
        self,
        arquivos: List[Tuple[BinaryIO, str, str | None]],
        usuario_id: int = 1
    ) -> ResultadoImportacaoMultiplaDTO:
        """
        Importa múltiplos arquivos detectando automaticamente o tipo de cada um.
        
        Args:
            arquivos: Lista de tuplas (arquivo, nome_arquivo, password)
                     - arquivo: Conteúdo do arquivo (bytes)
                     - nome_arquivo: Nome do arquivo
                     - password: Senha para arquivos protegidos (opcional)
            usuario_id: ID do usuário responsável pelas transações
            
        Returns:
            ResultadoImportacaoMultiplaDTO com resultado consolidado
            
        Notes:
            - Processa arquivos sequencialmente
            - Erros em um arquivo não interrompem processamento dos demais
            - Retorna status detalhado de cada arquivo
        """
        resultados: List[ResultadoArquivoDTO] = []
        total_transacoes = 0
        
        # Processar cada arquivo individualmente
        for arquivo, nome_arquivo, password in arquivos:
            try:
                # Delegar para use case de arquivo único
                resultado = self._importar_arquivo_use_case.execute(
                    arquivo=arquivo,
                    nome_arquivo=nome_arquivo,
                    usuario_id=usuario_id,
                    password=password
                )
                
                # Sucesso: adicionar ao relatório
                resultados.append(
                    ResultadoArquivoDTO(
                        nome_arquivo=nome_arquivo,
                        sucesso=True,
                        total_importado=resultado.total_importado,
                        transacoes_ids=resultado.transacoes_ids,
                        mensagem=resultado.mensagem,
                        erro=None
                    )
                )
                total_transacoes += resultado.total_importado
                
            except Exception as e:
                # Erro: registrar mas continuar processamento
                resultados.append(
                    ResultadoArquivoDTO(
                        nome_arquivo=nome_arquivo,
                        sucesso=False,
                        total_importado=0,
                        transacoes_ids=[],
                        mensagem="Erro ao processar arquivo",
                        erro=str(e)
                    )
                )
        
        # Consolidar estatísticas
        arquivos_sucesso = sum(1 for r in resultados if r.sucesso)
        arquivos_erro = sum(1 for r in resultados if not r.sucesso)
        
        return ResultadoImportacaoMultiplaDTO(
            total_arquivos=len(arquivos),
            arquivos_sucesso=arquivos_sucesso,
            arquivos_erro=arquivos_erro,
            total_transacoes_importadas=total_transacoes,
            resultados=resultados
        )
