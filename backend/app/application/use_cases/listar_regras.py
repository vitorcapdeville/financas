"""Caso de uso: Listar Regras"""

from typing import List

from app.application.dto.regra_dto import RegraDTO
from app.application.mappers.regra_mapper import RegraMapper
from app.domain.repositories.regra_repository import IRegraRepository


class ListarRegrasUseCase:
    """
    Caso de uso para listar todas as regras.
    
    Responsabilidades:
    - Buscar regras no repositório
    - Converter para DTOs
    - Retornar lista ordenada por prioridade (desc)
    """
    
    def __init__(self, regra_repository: IRegraRepository):
        self._regra_repository = regra_repository
    
    def execute(self, apenas_ativas: bool = False) -> List[RegraDTO]:
        """
        Executa o caso de uso de listagem de regras.
        
        Args:
            apenas_ativas: Se True, retorna apenas regras ativas
            
        Returns:
            Lista de RegraDTOs ordenada por prioridade (maior primeiro)
        """
        # Buscar todas as regras
        regras = self._regra_repository.listar()
        
        # Filtrar apenas ativas se solicitado
        if apenas_ativas:
            regras = [r for r in regras if r.ativo]
        
        # Converter para DTOs usando mapper
        dtos = [RegraMapper.to_dto(regra) for regra in regras]
        
        # Ordenar por prioridade (maior primeiro)
        dtos.sort(key=lambda r: r.prioridade, reverse=True)
        
        return dtos
