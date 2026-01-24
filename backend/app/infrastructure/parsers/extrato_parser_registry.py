"""
Registry de parsers de extrato bancário.

Gerencia o registro e seleção de parsers para diferentes bancos,
seguindo o padrão Factory/Registry.
"""
from typing import Dict, List, Optional

from app.application.exceptions import ValidationException
from app.domain.parsers.extrato_parser import IExtratoParser


class ExtratoParserRegistry:
    """
    Registry para parsers de extrato bancário.
    
    Responsabilidades:
    - Registrar parsers disponíveis
    - Selecionar parser correto baseado no parser_id
    - Listar parsers suportados
    
    Uso:
        registry = ExtratoParserRegistry()
        registry.registrar(BTGExtratoParser())
        parser = registry.obter_parser('btg_extrato')
    """
    
    def __init__(self):
        self._parsers: Dict[str, IExtratoParser] = {}
    
    def registrar(self, parser: IExtratoParser) -> None:
        """
        Registra um parser no registry.
        
        Args:
            parser: Instância do parser a registrar
            
        Raises:
            ValueError: Se parser_id já registrado
        """
        parser_id = parser.parser_id
        
        if parser_id in self._parsers:
            raise ValueError(
                f"Parser '{parser_id}' já registrado"
            )
        
        self._parsers[parser_id] = parser
    
    def obter_parser(self, parser_id: str) -> IExtratoParser:
        """
        Obtém parser por ID.
        
        Args:
            parser_id: Identificador do parser (ex: 'btg_extrato', 'btg_fatura')
            
        Returns:
            Parser correspondente
            
        Raises:
            ValidationException: Se parser não encontrado
        """
        parser = self._parsers.get(parser_id)
        
        if not parser:
            parsers_disponiveis = self.listar_parsers_disponiveis()
            raise ValidationException(
                f"Parser '{parser_id}' não encontrado. "
                f"Parsers disponíveis: {', '.join(parsers_disponiveis)}"
            )
        
        return parser
    
    def listar_parsers_disponiveis(self) -> List[str]:
        """
        Lista IDs dos parsers registrados.
        
        Returns:
            Lista de parser_ids disponíveis
        """
        return list(self._parsers.keys())
    
    def listar_parsers(self) -> List[Dict[str, any]]:
        """
        Lista informações de todos os parsers registrados.
        
        Returns:
            Lista de dicts com info dos parsers:
            - parser_id: str (identificador único)
            - banco_id: str (banco)
            - nome_banco: str
            - formatos_suportados: List[str]
        """
        return [
            {
                "parser_id": parser.parser_id,
                "banco_id": parser.banco_id,
                "nome_banco": parser.nome_banco,
                "formatos_suportados": parser.formatos_suportados
            }
            for parser in self._parsers.values()
        ]


# Instância singleton do registry
_registry_instance: Optional[ExtratoParserRegistry] = None


def obter_registry() -> ExtratoParserRegistry:
    """
    Obtém instância singleton do registry de parsers.
    
    Returns:
        Instância do ExtratoParserRegistry
    """
    global _registry_instance
    
    if _registry_instance is None:
        _registry_instance = ExtratoParserRegistry()
        _inicializar_parsers(_registry_instance)
    
    return _registry_instance


def _inicializar_parsers(registry: ExtratoParserRegistry) -> None:
    """
    Inicializa registry com parsers disponíveis.
    
    Args:
        registry: Registry a inicializar
    """
    # Importar e registrar parsers
    from app.infrastructure.parsers.arquivo_tratado_parser import ArquivoTratadoParser
    from app.infrastructure.parsers.btg_extrato_parser import BTGExtratoParser
    from app.infrastructure.parsers.btg_fatura_parser import BTGFaturaParser
    from app.infrastructure.parsers.nubank_extrato_parser import NubankExtratoParser
    from app.infrastructure.parsers.nubank_fatura_parser import NubankFaturaParser
    
    # Registrar parsers de bancos
    registry.registrar(BTGExtratoParser())
    registry.registrar(BTGFaturaParser())
    registry.registrar(NubankExtratoParser())
    registry.registrar(NubankFaturaParser())
    
    # Registrar parser genérico para arquivos tratados
    registry.registrar(ArquivoTratadoParser())
    
    # Futuros parsers serão adicionados aqui:
    # registry.registrar(InterExtratoParser())

