"""
Mapper: Transacao Entity <-> TransacaoDTO
Centraliza a lógica de conversão evitando duplicação nos use cases
"""
from app.application.dto.transacao_dto import AtualizarTransacaoDTO, CriarTransacaoDTO, TransacaoDTO
from app.domain.entities.transacao import Transacao


class TransacaoMapper:
    """Converte entre Transacao (domain) e TransacaoDTOs (application)"""
    
    @staticmethod
    def to_dto(transacao: Transacao, tags=None, usuario=None) -> TransacaoDTO:
        """
        Converte entidade de domínio Transacao para DTO de saída.
        
        Args:
            transacao: Entidade de domínio
            tags: Lista opcional de TagDTOs associadas
            usuario: UsuarioDTO opcional do responsável
            
        Returns:
            TransacaoDTO para transferência de dados
        """
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
            tags=tags or [],
            usuario_id=transacao.usuario_id,
            usuario=usuario
        )
    
    @staticmethod
    def from_criar_dto(dto: CriarTransacaoDTO) -> Transacao:
        """
        Converte DTO de criação para entidade de domínio.
        
        Args:
            dto: DTO de criação
            
        Returns:
            Entidade Transacao (sem ID)
        """
        return Transacao(
            data=dto.data,
            descricao=dto.descricao,
            valor=dto.valor,
            tipo=dto.tipo,
            categoria=dto.categoria,
            origem=dto.origem,
            banco=dto.banco,
            observacoes=dto.observacoes,
            data_fatura=dto.data_fatura,
            valor_original=dto.valor,  # Valor original = valor inicial
            usuario_id=dto.usuario_id
        )
    
    @staticmethod
    def aplicar_atualizacoes(transacao: Transacao, dto: AtualizarTransacaoDTO) -> None:
        """
        Aplica atualizações parciais do DTO na entidade.
        Modifica a entidade in-place.
        
        Args:
            transacao: Entidade a ser atualizada
            dto: DTO com campos opcionais para atualizar
        """
        if dto.descricao is not None:
            transacao.descricao = dto.descricao
        if dto.valor is not None:
            transacao.valor = dto.valor
        if dto.categoria is not None:
            transacao.categoria = dto.categoria
        if dto.observacoes is not None:
            transacao.observacoes = dto.observacoes
        if dto.data_fatura is not None:
            transacao.data_fatura = dto.data_fatura
