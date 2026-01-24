"""Caso de uso: Listar Tags"""

from typing import List

from app.application.dto.tag_dto import TagDTO
from app.application.mappers.tag_mapper import TagMapper
from app.domain.repositories.tag_repository import ITagRepository


class ListarTagsUseCase:
    """
    Caso de uso para listar todas as tags.
    
    Responsabilidades:
    - Buscar tags no repositório
    - Converter para DTOs
    - Retornar lista ordenada
    """
    
    def __init__(self, tag_repository: ITagRepository):
        self._tag_repository = tag_repository
    
    def execute(self) -> List[TagDTO]:
        """
        Executa o caso de uso de listagem de tags.
        
        Returns:
            Lista de TagDTOs ordenada por nome
        """
        # Buscar todas as tags
        tags = self._tag_repository.listar()
        
        # Converter para DTOs usando mapper
        dtos = [TagMapper.to_dto(tag) for tag in tags]
        
        # Ordenar por nome
        dtos.sort(key=lambda t: t.nome)
        
        return dtos
