"""
Caso de uso: Restaurar Valor Original da Transação
"""
from app.application.dto.transacao_dto import TransacaoDTO
from app.application.exceptions.application_exceptions import EntityNotFoundException, ValidationException
from app.application.mappers.transacao_mapper import TransacaoMapper
from app.domain.repositories.transacao_repository import ITransacaoRepository


class RestaurarValorOriginalUseCase:
    """
    Caso de uso para restaurar o valor original de uma transação.
    
    Responsabilidades:
    - Validar que a transação existe
    - Validar que possui valor_original salvo
    - Restaurar valor ao valor_original
    """
    
    def __init__(self, transacao_repository: ITransacaoRepository):
        self._transacao_repository = transacao_repository
    
    def execute(self, transacao_id: int) -> TransacaoDTO:
        """
        Executa o caso de uso de restauração de valor original.
        
        Args:
            transacao_id: ID da transação
            
        Returns:
            TransacaoDTO com valor restaurado
            
        Raises:
            EntityNotFoundException: Se transação não existir
            ValidationException: Se não houver valor_original salvo
        """
        # Buscar transação
        transacao = self._transacao_repository.buscar_por_id(transacao_id)
        if not transacao:
            raise EntityNotFoundException("Transacao", transacao_id)
        
        # Validar que possui valor_original
        if transacao.valor_original is None:
            raise ValidationException("Transação não possui valor original salvo")
        
        # Restaurar valor
        transacao_restaurada = self._transacao_repository.restaurar_valor_original(transacao_id)
        
        # Converter para DTO usando mapper
        return TransacaoMapper.to_dto(transacao_restaurada)
