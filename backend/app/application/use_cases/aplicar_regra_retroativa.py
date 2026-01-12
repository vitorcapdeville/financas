"""
Caso de Uso: Aplicar Regra Retroativamente
Aplica uma regra específica em todas as transações existentes
"""
from app.application.exceptions.application_exceptions import EntityNotFoundException
from app.domain.repositories.regra_repository import IRegraRepository
from app.domain.repositories.transacao_repository import ITransacaoRepository


class AplicarRegraRetroativamenteUseCase:
    """
    Caso de uso para aplicar uma regra específica retroativamente em todas as transações.
    
    Princípio SRP: Responsabilidade única - aplicar uma regra em lote
    """
    
    def __init__(
        self,
        transacao_repository: ITransacaoRepository,
        regra_repository: IRegraRepository
    ):
        self._transacao_repository = transacao_repository
        self._regra_repository = regra_repository
    
    def execute(self, regra_id: int) -> dict:
        """
        Aplica uma regra específica em todas as transações.
        
        Args:
            regra_id: ID da regra a aplicar
            
        Returns:
            Dicionário com estatísticas: 
            {
                "total_processado": int,
                "total_modificado": int
            }
            
        Raises:
            EntityNotFoundException: Se regra não existe
        """
        # Busca regra
        regra = self._regra_repository.buscar_por_id(regra_id)
        if not regra:
            raise EntityNotFoundException("Regra", regra_id)
        
        # Busca todas as transações
        transacoes = self._transacao_repository.listar()
        
        # Aplica regra
        total_modificado = 0
        
        for transacao in transacoes:
            if regra.aplicar_em(transacao):
                self._transacao_repository.atualizar(transacao)
                total_modificado += 1
        
        return {
            "total_processado": len(transacoes),
            "total_modificado": total_modificado
        }
