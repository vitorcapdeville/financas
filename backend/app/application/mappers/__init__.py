"""
Mappers: Responsáveis pela conversão entre Entidades de Domínio e DTOs

Seguindo Clean Architecture, centralizamos a lógica de conversão aqui,
evitando duplicação em use cases.
"""
from .regra_mapper import RegraMapper
from .tag_mapper import TagMapper
from .transacao_mapper import TransacaoMapper

__all__ = ["RegraMapper", "TransacaoMapper", "TagMapper"]
