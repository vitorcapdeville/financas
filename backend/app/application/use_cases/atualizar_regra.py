"""Caso de uso: Atualizar Regra"""

from app.application.dto.regra_dto import AtualizarRegraDTO, RegraDTO
from app.application.exceptions.application_exceptions import EntityNotFoundException, ValidationException
from app.application.mappers.regra_mapper import RegraMapper
from app.domain.repositories.regra_repository import IRegraRepository


class AtualizarRegraUseCase:
    """
    Caso de uso para atualizar uma regra existente.
    
    Responsabilidades:
    - Validar que regra existe
    - Validar unicidade do novo nome (se alterado)
    - Atualizar entidade
    - Persistir via repositório
    """
    
    def __init__(self, regra_repository: IRegraRepository):
        self._regra_repository = regra_repository
    
    def execute(self, regra_id: int, dto: AtualizarRegraDTO) -> RegraDTO:
        """
        Executa o caso de uso de atualização de regra.
        
        Args:
            regra_id: ID da regra a atualizar
            dto: Dados para atualização
            
        Returns:
            RegraDTO com dados atualizados
            
        Raises:
            EntityNotFoundException: Se regra não existe
            ValidationException: Se novo nome já está em uso
        """
        # Buscar regra existente
        regra = self._regra_repository.buscar_por_id(regra_id)
        if not regra:
            raise EntityNotFoundException("Regra", regra_id)
        
        # Validar unicidade do novo nome (se foi alterado)
        if dto.nome and dto.nome != regra.nome:
            regra_com_nome = self._regra_repository.buscar_por_nome(dto.nome)
            if regra_com_nome:
                raise ValidationException(f"Já existe uma regra com o nome '{dto.nome}'")
        
        # Aplicar atualizações usando mapper
        RegraMapper.aplicar_atualizacoes(regra, dto)
        
        # Persistir
        regra_atualizada = self._regra_repository.atualizar(regra)
        
        # Retornar DTO usando mapper
        return RegraMapper.to_dto(regra_atualizada)
