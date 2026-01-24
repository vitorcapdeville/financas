"""
Mapper: Regra Entity <-> RegraDTO
Centraliza a lógica de conversão evitando duplicação nos use cases
"""
from app.application.dto.regra_dto import AtualizarRegraDTO, CriarRegraDTO, RegraDTO
from app.domain.entities.regra import Regra


class RegraMapper:
    """Converte entre Regra (domain) e RegraDTOs (application)"""
    
    @staticmethod
    def to_dto(regra: Regra) -> RegraDTO:
        """
        Converte entidade de domínio Regra para DTO de saída.
        
        Args:
            regra: Entidade de domínio
            
        Returns:
            RegraDTO para transferência de dados
        """
        return RegraDTO(
            id=regra.id,
            nome=regra.nome,
            tipo_acao=regra.tipo_acao,
            criterio_tipo=regra.criterio_tipo,
            criterio_valor=regra.criterio_valor,
            acao_valor=regra.acao_valor,
            prioridade=regra.prioridade,
            ativo=regra.ativo,
            tag_ids=regra.tag_ids
        )
    
    @staticmethod
    def from_criar_dto(dto: CriarRegraDTO) -> Regra:
        """
        Converte DTO de criação para entidade de domínio.
        
        Args:
            dto: DTO de criação
            
        Returns:
            Entidade Regra (sem ID)
        """
        return Regra(
            nome=dto.nome,
            tipo_acao=dto.tipo_acao,
            criterio_tipo=dto.criterio_tipo,
            criterio_valor=dto.criterio_valor,
            acao_valor=dto.acao_valor,
            prioridade=dto.prioridade,
            ativo=dto.ativo,
            tag_ids=dto.tag_ids or []
        )
    
    @staticmethod
    def aplicar_atualizacoes(regra: Regra, dto: AtualizarRegraDTO) -> None:
        """
        Aplica atualizações parciais do DTO na entidade.
        Modifica a entidade in-place.
        
        Args:
            regra: Entidade a ser atualizada
            dto: DTO com campos opcionais para atualizar
        """
        if dto.nome is not None:
            regra.nome = dto.nome
        if dto.tipo_acao is not None:
            regra.tipo_acao = dto.tipo_acao
        if dto.criterio_tipo is not None:
            regra.criterio_tipo = dto.criterio_tipo
        if dto.criterio_valor is not None:
            regra.criterio_valor = dto.criterio_valor
        if dto.acao_valor is not None:
            regra.acao_valor = dto.acao_valor
        if dto.prioridade is not None:
            regra.prioridade = dto.prioridade
        if dto.ativo is not None:
            regra.ativo = dto.ativo
        if dto.tag_ids is not None:
            regra.tag_ids = dto.tag_ids
