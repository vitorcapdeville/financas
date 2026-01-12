"""
Exceções da camada de aplicação
"""


class ApplicationException(Exception):
    """Exceção base da aplicação"""
    pass


class EntityNotFoundException(ApplicationException):
    """Entidade não encontrada"""
    def __init__(self, entity_name: str, entity_id: any):
        self.entity_name = entity_name
        self.entity_id = entity_id
        super().__init__(f"{entity_name} with id {entity_id} not found")


class ValidationException(ApplicationException):
    """Erro de validação de dados"""
    pass
