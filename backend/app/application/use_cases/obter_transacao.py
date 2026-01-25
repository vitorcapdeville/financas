"""
Use Case: Obter Transação com Tags Completas
Camada de Aplicação - Lógica de Negócio
"""


from app.application.dto.tag_dto import TagDTO
from app.application.dto.transacao_dto import TransacaoDTO
from app.application.dto.usuario_dto import UsuarioDTO
from app.application.exceptions.application_exceptions import EntityNotFoundException
from app.domain.repositories.tag_repository import ITagRepository
from app.domain.repositories.transacao_repository import ITransacaoRepository
from app.domain.repositories.usuario_repository import IUsuarioRepository


class ObterTransacaoUseCase:
    """
    Use Case para obter uma transação completa com tags.
    
    Responsabilidades:
    - Buscar transação por ID
    - Carregar tags completas associadas
    - Retornar DTO completo com todas as informações
    
    Princípios SOLID:
    - SRP: Responsável apenas por obter transação com detalhes completos
    - DIP: Depende de abstrações (interfaces de repositórios)
    """
    
    def __init__(
        self,
        transacao_repository: ITransacaoRepository,
        tag_repository: ITagRepository,
        usuario_repository: IUsuarioRepository
    ):
        self._transacao_repo = transacao_repository
        self._tag_repo = tag_repository
        self._usuario_repo = usuario_repository
    
    def execute(self, transacao_id: int) -> TransacaoDTO:
        """
        Busca uma transação por ID com tags completas.
        
        Args:
            transacao_id: ID da transação
            
        Returns:
            TransacaoDTO com tags completas populadas
            
        Raises:
            EntityNotFoundException: Se transação não for encontrada
        """
        # Buscar transação
        transacao = self._transacao_repo.buscar_por_id(transacao_id)
        if not transacao:
            raise EntityNotFoundException(f"Transação {transacao_id} não encontrada", transacao_id)
        
        # Garantir que transação tem ID
        assert transacao.id is not None, "Transação retornada do repositório deve ter ID"
        
        # Buscar tags completas
        tags_completas = []
        for tag_id in transacao.tag_ids:
            tag = self._tag_repo.buscar_por_id(tag_id)
            if tag and tag.id is not None:  # Verificação adicional
                tags_completas.append(TagDTO(
                    id=tag.id,
                    nome=tag.nome,
                    cor=tag.cor,
                    descricao=tag.descricao,
                    criado_em=tag.criado_em,
                    atualizado_em=tag.atualizado_em
                ))
        
        # Buscar usuário responsável
        usuario_dto = None
        usuario = self._usuario_repo.buscar_por_id(transacao.usuario_id)
        if usuario and usuario.id is not None:
            usuario_dto = UsuarioDTO(
                id=usuario.id,
                nome=usuario.nome,
                cpf=usuario.cpf,
                criado_em=usuario.criado_em,
                atualizado_em=usuario.atualizado_em
            )
        
        # Retorna DTO completo
        return TransacaoDTO(
            id=transacao.id,
            data=transacao.data,
            descricao=transacao.descricao,
            valor=transacao.valor,
            valor_original=transacao.valor_original,
            tipo=transacao.tipo,
            categoria=transacao.categoria,
            origem=transacao.origem,
            banco=transacao.banco,
            observacoes=transacao.observacoes,
            data_fatura=transacao.data_fatura,
            criado_em=transacao.criado_em,
            atualizado_em=transacao.atualizado_em,
            tag_ids=transacao.tag_ids,
            tags=tags_completas,
            usuario_id=transacao.usuario_id,
            usuario=usuario_dto
        )
