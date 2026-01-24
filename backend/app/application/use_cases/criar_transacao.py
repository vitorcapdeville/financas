"""
Caso de Uso: Criar Transação
Orquestra a lógica de criação de uma nova transação
"""
from app.application.dto.transacao_dto import CriarTransacaoDTO, TransacaoDTO
from app.application.exceptions.application_exceptions import ValidationException
from app.application.mappers.transacao_mapper import TransacaoMapper
from app.domain.repositories.transacao_repository import ITransacaoRepository


class CriarTransacaoUseCase:
    """
    Caso de uso para criar uma nova transação.
    
    Princípio SRP: Responsabilidade única - criar transações
    Princípio DIP: Depende de abstração (ITransacaoRepository), não de implementação
    """
    
    def __init__(self, transacao_repository: ITransacaoRepository):
        self._transacao_repository = transacao_repository
    
    def execute(self, dto: CriarTransacaoDTO) -> TransacaoDTO:
        """
        Executa o caso de uso de criar transação.
        
        Args:
            dto: Dados para criação
            
        Returns:
            DTO com transação criada
            
        Raises:
            ValidationException: Se dados inválidos
        """
        # Validações de negócio
        if dto.valor < 0:
            raise ValidationException("Valor deve ser positivo")
        
        if not dto.descricao or dto.descricao.strip() == "":
            raise ValidationException("Descrição é obrigatória")
        
        # Cria entidade de domínio usando mapper
        transacao = TransacaoMapper.from_criar_dto(dto)
        
        # Persiste via repositório
        transacao_criada = self._transacao_repository.criar(transacao)
        
        # Retorna DTO usando mapper
        return TransacaoMapper.to_dto(transacao_criada)
