"""
Testes de integração para ConfiguracaoRepository
Valida operações CRUD com banco de dados real
"""
import pytest
from app.infrastructure.database.repositories.configuracao_repository import ConfiguracaoRepository
from sqlmodel import Session


@pytest.mark.integration
class TestConfiguracaoRepositoryIntegration:
    """Testes de integração do repositório de configurações"""
    
    def test_criar_e_buscar_por_chave(self, db_session: Session):
        """
        ARRANGE: Configuração válida
        ACT: Criar e buscar por chave
        ASSERT: Configuração é persistida e recuperada corretamente
        """
        # Arrange
        repository = ConfiguracaoRepository(db_session)
        
        # Act
        repository.salvar("teste_config", "valor_teste")
        valor_buscado = repository.obter("teste_config")
        
        # Assert
        assert valor_buscado is not None
        assert valor_buscado == "valor_teste"
    
    def test_buscar_por_chave_inexistente_retorna_none(self, db_session: Session):
        """
        ARRANGE: Repositório sem a configuração
        ACT: Buscar por chave inexistente
        ASSERT: Retorna None
        """
        # Arrange
        repository = ConfiguracaoRepository(db_session)
        
        # Act
        valor_buscado = repository.obter("chave_inexistente_xyz")
        
        # Assert
        assert valor_buscado is None
    
    def test_salvar_atualiza_configuracao_existente(self, db_session: Session):
        """
        ARRANGE: Configuração já existente
        ACT: Salvar novamente com novo valor (upsert)
        ASSERT: Valor é atualizado
        """
        # Arrange
        repository = ConfiguracaoRepository(db_session)
        
        # Criar configuração inicial
        repository.salvar("dia_inicio", "1")
        
        # Act - Salvar novamente com novo valor
        repository.salvar("dia_inicio", "25")
        
        # Buscar novamente
        valor_buscado = repository.obter("dia_inicio")
        
        # Assert
        assert valor_buscado == "25"  # Valor atualizado
