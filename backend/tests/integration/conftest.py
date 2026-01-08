"""
Configurações para testes de integração
"""
import pytest
from app.interfaces.api.dependencies import get_session
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine


@pytest.fixture(scope="function")
def session():
    """
    Fixture para banco de dados de teste (SQLite em memória).
    Cada teste recebe uma sessão limpa.
    """
    # Importar modelos
    from app.infrastructure.database.models.configuracao_model import ConfiguracaoModel  # noqa: F401
    from app.infrastructure.database.models.regra_model import RegraModel  # noqa: F401
    from app.infrastructure.database.models.tag_model import TagModel  # noqa: F401
    from app.infrastructure.database.models.transacao_model import TransacaoModel  # noqa: F401

    # Criar engine
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Criar tabelas
    SQLModel.metadata.create_all(engine)

    # Criar sessão
    with Session(engine) as test_session:
        yield test_session

    # Limpar
    SQLModel.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(scope="function")
def client(session):
    """
    Fixture para TestClient da FastAPI com banco de dados de teste.
    """
    def get_test_session():
        return session

    # Override da dependência
    app.dependency_overrides[get_session] = get_test_session

    with TestClient(app) as test_client:
        yield test_client

    # Limpar override
    app.dependency_overrides.clear()
