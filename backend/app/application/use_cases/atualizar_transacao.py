"""
Caso de uso: Atualizar Transação
"""
from app.application.dto.transacao_dto import AtualizarTransacaoDTO, TransacaoDTO
from app.application.exceptions.application_exceptions import EntityNotFoundException
from app.application.mappers.transacao_mapper import TransacaoMapper
from app.domain.repositories.transacao_repository import ITransacaoRepository


class AtualizarTransacaoUseCase:
    """
    Caso de uso para atualizar uma transação existente.
    
    Responsabilidades:
    - Validar que a transação existe
    - Aplicar atualizações parciais (apenas campos fornecidos)
    - Retornar transação atualizada
    """
    
    def __init__(self, transacao_repository: ITransacaoRepository):
        self._transacao_repository = transacao_repository
    
    def execute(self, transacao_id: int, dto: AtualizarTransacaoDTO) -> TransacaoDTO:
        """
        Executa o caso de uso de atualização de transação.
        
        Args:
            transacao_id: ID da transação a atualizar
            dto: DTO com campos a atualizar (parcial)
            
        Returns:
            TransacaoDTO com dados atualizados
            
        Raises:
            EntityNotFoundException: Se transação não existir
        """
        # Buscar transação
        transacao = self._transacao_repository.buscar_por_id(transacao_id)
        if not transacao:
            raise EntityNotFoundException("Transacao", transacao_id)
        
        # Aplicar atualizações usando mapper
        TransacaoMapper.aplicar_atualizacoes(transacao, dto)
        
        # Atualizar transação no repositório
        transacao_atualizada = self._transacao_repository.atualizar(transacao)
        
        # Converter para DTO de retorno usando mapper
        return TransacaoMapper.to_dto(transacao_atualizada)
