"""
Caso de Uso: Listar Transações
Orquestra a lógica de listagem de transações com filtros
"""
from typing import List

from app.application.dto.transacao_dto import FiltrosTransacaoDTO, TransacaoDTO
from app.application.dto.usuario_dto import UsuarioDTO
from app.application.mappers.tag_mapper import TagMapper
from app.application.mappers.transacao_mapper import TransacaoMapper
from app.domain.repositories.configuracao_repository import IConfiguracaoRepository
from app.domain.repositories.tag_repository import ITagRepository
from app.domain.repositories.transacao_repository import ITransacaoRepository
from app.domain.repositories.usuario_repository import IUsuarioRepository


class ListarTransacoesUseCase:
    """
    Caso de uso para listar transações com filtros.
    
    Princípio SRP: Responsabilidade única - listar transações
    Princípio DIP: Depende de abstrações (repositórios)
    """
    
    def __init__(
        self,
        transacao_repository: ITransacaoRepository,
        configuracao_repository: IConfiguracaoRepository,
        tag_repository: ITagRepository = None,
        usuario_repository: IUsuarioRepository = None
    ):
        self._transacao_repository = transacao_repository
        self._configuracao_repository = configuracao_repository
        self._tag_repository = tag_repository
        self._usuario_repository = usuario_repository
    
    def execute(self, filtros: FiltrosTransacaoDTO) -> List[TransacaoDTO]:
        """
        Executa o caso de uso de listar transações.
        
        Args:
            filtros: Filtros de busca
            
        Returns:
            Lista de DTOs de transações
        """
        # Obtém critério de data da configuração
        criterio = filtros.criterio_data
        if not criterio or criterio not in ["data_transacao", "data_fatura"]:
            criterio_config = self._configuracao_repository.obter("criterio_data_transacao")
            criterio = criterio_config if criterio_config else "data_transacao"
        
        # Busca transações no repositório
        transacoes = self._transacao_repository.listar(
            mes=filtros.mes,
            ano=filtros.ano,
            data_inicio=filtros.data_inicio,
            data_fim=filtros.data_fim,
            categoria=filtros.categoria,
            tipo=filtros.tipo,
            tag_ids=filtros.tag_ids,
            sem_tags=filtros.sem_tags,
            sem_categoria=filtros.sem_categoria,
            criterio_data=criterio,
            usuario_id=filtros.usuario_id
        )
        
        # Converte para DTOs usando mapper
        dtos = []
        for transacao in transacoes:
            # Carregar tags completas se tag_repository estiver disponível
            tags_completas = []
            if self._tag_repository:
                for tag_id in transacao.tag_ids:
                    tag = self._tag_repository.buscar_por_id(tag_id)
                    if tag:
                        tags_completas.append(TagMapper.to_dto(tag))
            
            # Carregar usuário se usuario_repository estiver disponível
            usuario_dto = None
            if self._usuario_repository:
                usuario = self._usuario_repository.buscar_por_id(transacao.usuario_id)
                if usuario and usuario.id is not None:
                    usuario_dto = UsuarioDTO(
                        id=usuario.id,
                        nome=usuario.nome,
                        cpf=usuario.cpf,
                        criado_em=usuario.criado_em,
                        atualizado_em=usuario.atualizado_em
                    )
            
            # Converter transação para DTO com tags e usuario
            dtos.append(TransacaoMapper.to_dto(transacao, tags=tags_completas, usuario=usuario_dto))
        
        return dtos
