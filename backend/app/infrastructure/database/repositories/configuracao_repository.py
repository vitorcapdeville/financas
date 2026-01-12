"""
Implementação concreta do repositório de Configurações usando SQLModel
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from app.domain.repositories.configuracao_repository import IConfiguracaoRepository
from app.infrastructure.database.models.configuracao_model import ConfiguracaoModel


class ConfiguracaoRepository(IConfiguracaoRepository):
    """
    Implementação concreta de IConfiguracaoRepository usando SQLModel.
    
    Sistema key-value para configurações da aplicação.
    """
    
    def __init__(self, session: Session):
        self._session = session
    
    def obter(self, chave: str) -> Optional[str]:
        """Obtém valor de uma configuração"""
        query = select(ConfiguracaoModel).where(ConfiguracaoModel.chave == chave)
        model = self._session.exec(query).first()
        if not model:
            return None
        return model.valor
    
    def salvar(self, chave: str, valor: str) -> None:
        """Salva ou atualiza uma configuração"""
        query = select(ConfiguracaoModel).where(ConfiguracaoModel.chave == chave)
        model = self._session.exec(query).first()
        
        if model:
            # Atualiza existente
            model.valor = valor
            model.atualizado_em = datetime.now()
        else:
            # Cria nova
            model = ConfiguracaoModel(chave=chave, valor=valor)
            self._session.add(model)
        
        self._session.commit()
