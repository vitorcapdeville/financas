"""
Mapper: Tag Entity <-> TagDTO
Centraliza a lógica de conversão evitando duplicação nos use cases
"""
from app.application.dto.tag_dto import CriarTagDTO, TagDTO
from app.domain.entities.tag import Tag


class TagMapper:
    """Converte entre Tag (domain) e TagDTOs (application)"""
    
    @staticmethod
    def to_dto(tag: Tag) -> TagDTO:
        """
        Converte entidade de domínio Tag para DTO de saída.
        
        Args:
            tag: Entidade de domínio
            
        Returns:
            TagDTO para transferência de dados
        """
        return TagDTO(
            id=tag.id,
            nome=tag.nome,
            cor=tag.cor,
            descricao=tag.descricao,
            criado_em=tag.criado_em,
            atualizado_em=tag.atualizado_em
        )
    
    @staticmethod
    def from_criar_dto(dto: CriarTagDTO) -> Tag:
        """
        Converte DTO de criação para entidade de domínio.
        
        Args:
            dto: DTO de criação
            
        Returns:
            Entidade Tag (sem ID)
        """
        return Tag(
            nome=dto.nome,
            cor=dto.cor,
            descricao=dto.descricao
        )
