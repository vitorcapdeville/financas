"""
Testes de API Routers
"""
import pytest
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine


@pytest.fixture(scope="function")
def client():
    """Cliente de teste FastAPI com banco em memória"""
    # Importar modelos
    from app.infrastructure.database.models.transacao_model import TransacaoModel  # noqa
    from app.infrastructure.database.models.tag_model import TagModel  # noqa
    from app.infrastructure.database.models.regra_model import RegraModel  # noqa
    from app.infrastructure.database.models.configuracao_model import ConfiguracaoModel  # noqa
    
    # Criar engine em memória
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Criar tabelas
    SQLModel.metadata.create_all(test_engine)
    
    # Override do engine
    def override_get_session():
        with Session(test_engine) as session:
            yield session
    
    from app.infrastructure.database.session import get_session
    app.dependency_overrides[get_session] = override_get_session
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Limpar
    SQLModel.metadata.drop_all(test_engine)
    app.dependency_overrides.clear()


class TestTagsRouter:
    """Testes para o router de tags"""
    
    def test_criar_tag(self, client):
        """Deve criar uma tag com sucesso"""
        response = client.post("/tags", json={
            "nome": "Nova Tag",
            "cor": "#FF0000",
            "descricao": "Descrição da tag"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == "Nova Tag"
        assert data["cor"] == "#FF0000"
        assert "id" in data
    
    def test_listar_tags(self, client):
        """Deve listar todas as tags"""
        # Criar algumas tags
        client.post("/tags", json={"nome": "Tag 1", "cor": "#FF0000"})
        client.post("/tags", json={"nome": "Tag 2", "cor": "#00FF00"})
        
        response = client.get("/tags")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        assert any(t["nome"] == "Tag 1" for t in data)
        assert any(t["nome"] == "Tag 2" for t in data)


class TestConfiguracoesRouter:
    """Testes para o router de configurações"""
    
    def test_obter_configuracao(self, client):
        """Deve obter uma configuração"""
        # Criar configuração
        client.post("/configuracoes", json={
            "chave": "teste_config",
            "valor": "valor_teste"
        })
        
        # Obter configuração
        response = client.get("/configuracoes/teste_config")
        
        assert response.status_code == 200
        data = response.json()
        assert data["chave"] == "teste_config"
        assert data["valor"] == "valor_teste"
    
    def test_obter_configuracao_inexistente_retorna_404(self, client):
        """Deve retornar 404 para configuração inexistente"""
        response = client.get("/configuracoes/chave_inexistente")
        
        assert response.status_code == 404
    
    def test_salvar_configuracao_nova(self, client):
        """Deve criar nova configuração"""
        response = client.post("/configuracoes", json={
            "chave": "nova_config",
            "valor": "novo_valor"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["chave"] == "nova_config"
        assert data["valor"] == "novo_valor"
    
    def test_salvar_configuracao_existente_faz_upsert(self, client):
        """Deve atualizar configuração existente"""
        # Criar configuração
        client.post("/configuracoes", json={
            "chave": "config_upsert",
            "valor": "valor_inicial"
        })
        
        # Atualizar com mesma chave
        response = client.post("/configuracoes", json={
            "chave": "config_upsert",
            "valor": "valor_atualizado"
        })
        
        assert response.status_code == 201
        
        # Verificar que foi atualizado
        get_response = client.get("/configuracoes/config_upsert")
        assert get_response.json()["valor"] == "valor_atualizado"


class TestTransacoesRouter:
    """Testes para o router de transações"""
    
    def test_criar_transacao(self, client):
        """Deve criar uma transação"""
        response = client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Compra Supermercado",
            "valor": 150.50,
            "tipo": "saida",
            "categoria": "Alimentação"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["descricao"] == "Compra Supermercado"
        assert data["valor"] == 150.50
        assert data["tipo"] == "saida"
    
    def test_listar_transacoes(self, client):
        """Deve listar transações"""
        # Criar transações
        client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Compra 1",
            "valor": 100.0,
            "tipo": "saida"
        })
        client.post("/transacoes", json={
            "data": "2024-01-16",
            "descricao": "Compra 2",
            "valor": 200.0,
            "tipo": "saida"
        })
        
        response = client.get("/transacoes")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
    
    def test_obter_transacao_por_id(self, client):
        """Deve obter transação por ID"""
        # Criar transação
        create_response = client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Compra Teste",
            "valor": 100.0,
            "tipo": "saida"
        })
        transacao_id = create_response.json()["id"]
        
        # Obter transação
        response = client.get(f"/transacoes/{transacao_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == transacao_id
        assert data["descricao"] == "Compra Teste"
    
    def test_atualizar_transacao(self, client):
        """Deve atualizar uma transação"""
        # Criar transação
        create_response = client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Original",
            "valor": 100.0,
            "tipo": "saida"
        })
        transacao_id = create_response.json()["id"]
        
        # Atualizar transação
        response = client.patch(f"/transacoes/{transacao_id}", json={
            "descricao": "Atualizada",
            "categoria": "Nova Categoria"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["descricao"] == "Atualizada"
        assert data["categoria"] == "Nova Categoria"
    
    def test_listar_categorias(self, client):
        """Deve listar categorias únicas"""
        # Criar transações com categorias
        client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Compra 1",
            "valor": 100.0,
            "tipo": "saida",
            "categoria": "Alimentação"
        })
        client.post("/transacoes", json={
            "data": "2024-01-16",
            "descricao": "Compra 2",
            "valor": 200.0,
            "tipo": "saida",
            "categoria": "Transporte"
        })
        
        response = client.get("/transacoes/categorias")
        
        assert response.status_code == 200
        data = response.json()
        assert "Alimentação" in data
        assert "Transporte" in data
