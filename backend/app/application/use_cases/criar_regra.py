"""Caso de uso: Criar Regra"""

from app.application.dto.regra_dto import CriarRegraDTO, RegraDTO
from app.application.exceptions.application_exceptions import ValidationException
from app.application.mappers.regra_mapper import RegraMapper
from app.domain.repositories.regra_repository import IRegraRepository


class CriarRegraUseCase:
    """
    Caso de uso para criar uma nova regra de automação.
    
    Responsabilidades:
    - Validar dados de entrada
    - Verificar unicidade do nome
    - Criar entidade Regra
    - Persistir via repositório
    """
    
    def __init__(self, regra_repository: IRegraRepository):
        self._regra_repository = regra_repository
    
    def execute(self, dto: CriarRegraDTO) -> RegraDTO:
        """
        Executa o caso de uso de criação de regra.
        
        Args:
            dto: Dados para criar a regra
            
        Returns:
            RegraDTO com dados da regra criada
            
        Raises:
            ValidationException: Se dados inválidos ou nome duplicado
        """
        # Validar unicidade do nome
        regra_existente = self._regra_repository.buscar_por_nome(dto.nome)
        if regra_existente:
            raise ValidationException(f"Já existe uma regra com o nome '{dto.nome}'")
        
        # Criar entidade de domínio usando mapper
        regra = RegraMapper.from_criar_dto(dto)
        
        # Persistir
        regra_criada = self._regra_repository.criar(regra)
        
        # Retornar DTO usando mapper
        return RegraMapper.to_dto(regra_criada)
