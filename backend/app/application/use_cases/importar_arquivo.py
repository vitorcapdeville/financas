"""
Use Case: Importar Arquivo

Ponto de entrada único para importação de arquivos.
Segue Clean Architecture e SOLID.

Fluxo:
1. Detecta qual parser usar pelo nome do arquivo
2. Parser lê arquivo e retorna DataFrame normalizado
3. ImportacaoService processa DataFrame e salva transações
"""
from typing import BinaryIO

from app.application.dto.importacao_dto import ResultadoImportacaoDTO
from app.application.exceptions import ValidationException
from app.application.services.detector_tipo_arquivo import DetectorTipoArquivo
from app.application.services.importacao_service import ImportacaoService
from app.domain.repositories.regra_repository import IRegraRepository
from app.domain.repositories.tag_repository import ITagRepository
from app.domain.repositories.transacao_repository import ITransacaoRepository
from app.domain.repositories.usuario_repository import IUsuarioRepository
from app.infrastructure.parsers.extrato_parser_registry import obter_registry


class ImportarArquivoUseCase:
    """
    Orquestra o fluxo de importação de arquivos.
    
    Responsabilidades (Single Responsibility):
    - Detectar qual parser usar
    - Coordenar parser + service
    """
    
    def __init__(
        self,
        transacao_repo: ITransacaoRepository,
        tag_repo: ITagRepository,
        regra_repo: IRegraRepository,
        usuario_repo: IUsuarioRepository
    ):
        self._detector = DetectorTipoArquivo()
        self._parser_registry = obter_registry()
        self._transacao_repo = transacao_repo
        self._tag_repo = tag_repo
        self._regra_repo = regra_repo
        self._usuario_repo = usuario_repo
    
    def execute(
        self,
        arquivo: BinaryIO,
        nome_arquivo: str,
        usuario_id: int = 1,
        password: str | None = None
    ) -> ResultadoImportacaoDTO:
        """
        Importa arquivo detectando automaticamente o tipo.
        
        Args:
            arquivo: Conteúdo do arquivo (bytes)
            nome_arquivo: Nome do arquivo
            usuario_id: ID do usuário responsável pelas transações
            password: Senha para arquivos protegidos (opcional)
            
        Returns:
            ResultadoImportacaoDTO com resultado da importação
            
        Raises:
            ValidationException: Se tipo não suportado ou dados inválidos
        """
        # Criar service com usuario_id
        service = ImportacaoService(
            transacao_repo=self._transacao_repo,
            tag_repo=self._tag_repo,
            regra_repo=self._regra_repo,
            usuario_repo=self._usuario_repo,
            usuario_id=usuario_id
        )
        
        # Se não foi fornecida senha, tentar obter CPF do usuário
        if password is None:
            password = service.obter_cpf_usuario()
        
        # 1. Detectar qual parser usar pelo nome
        parser_id = self._detector.detectar(nome_arquivo)
        
        # 2. Obter parser apropriado
        parser = self._parser_registry.obter_parser(parser_id)
        
        # 3. Parser lê arquivo e retorna DataFrame normalizado
        df_normalizado = parser.parse(arquivo, nome_arquivo, password=password)
        
        # Validar que DataFrame tem dados
        if df_normalizado.empty:
            raise ValidationException(
                f"Arquivo '{nome_arquivo}' não contém dados válidos"
            )
        
        # 4. Service processa DataFrame e salva transações
        resultado = service.importar(df_normalizado)
        
        # Adicionar contexto na mensagem
        resultado.mensagem = f"{resultado.mensagem} (parser: {parser_id})"
        
        return resultado
