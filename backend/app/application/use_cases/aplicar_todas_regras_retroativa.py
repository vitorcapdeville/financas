"""
Caso de Uso: Aplicar Todas as Regras Retroativamente
Aplica todas as regras ativas em todas as transações existentes
"""
from app.domain.repositories.regra_repository import IRegraRepository
from app.domain.repositories.transacao_repository import ITransacaoRepository


class AplicarTodasRegrasRetroativaUseCase:
    """
    Caso de uso para aplicar todas as regras ativas retroativamente em todas as transações.
    
    Princípio SRP: Responsabilidade única - aplicar todas as regras em lote
    """
    
    def __init__(
        self,
        transacao_repository: ITransacaoRepository,
        regra_repository: IRegraRepository
    ):
        self._transacao_repository = transacao_repository
        self._regra_repository = regra_repository
    
    def execute(self) -> dict:
        """
        Aplica todas as regras ativas em todas as transações.
        
        Returns:
            Dicionário com estatísticas: 
            {
                "total_processado": int (número de transações processadas),
                "total_modificado": int (número de transações modificadas)
            }
        """
        # Busca todas as transações
        transacoes = self._transacao_repository.listar()
        
        # Busca regras ativas ordenadas por prioridade
        regras = self._regra_repository.listar(apenas_ativas=True)
        
        # Aplica regras
        total_modificado = 0
        
        for transacao in transacoes:
            modificado = False
            
            for regra in regras:
                if regra.aplicar_em(transacao):
                    modificado = True
            
            if modificado:
                self._transacao_repository.atualizar(transacao)
                total_modificado += 1
        
        return {
            "total_processado": len(transacoes),
            "total_modificado": total_modificado
        }
