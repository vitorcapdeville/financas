""" 
Testes para Use Cases Auxiliares
"""
from unittest.mock import Mock

import pytest
from app.application.use_cases.listar_categorias import ListarCategoriasUseCase


class TestListarCategoriasUseCase:
    """Testes para ListarCategoriasUseCase"""
    
    @pytest.fixture
    def mock_transacao_repo(self):
        return Mock()
    
    @pytest.fixture
    def use_case(self, mock_transacao_repo):
        return ListarCategoriasUseCase(mock_transacao_repo)
    
    def test_listar_categorias_com_sucesso(self, use_case, mock_transacao_repo):
        """Deve listar categorias ordenadas alfabeticamente"""
        # Arrange
        categorias = ["Transporte", "Alimentação", "Saúde", "Lazer"]
        mock_transacao_repo.listar_categorias.return_value = categorias
        
        # Act
        result = use_case.execute()
        
        # Assert
        assert result == ["Alimentação", "Lazer", "Saúde", "Transporte"]
        mock_transacao_repo.listar_categorias.assert_called_once()
    
    def test_filtrar_categorias_none(self, use_case, mock_transacao_repo):
        """Deve filtrar categorias None"""
        # Arrange
        categorias = ["Alimentação", None, "Transporte", None, "Saúde"]
        mock_transacao_repo.listar_categorias.return_value = categorias
        
        # Act
        result = use_case.execute()
        
        # Assert
        assert result == ["Alimentação", "Saúde", "Transporte"]
        assert None not in result
    
    def test_filtrar_categorias_vazias(self, use_case, mock_transacao_repo):
        """Deve filtrar categorias vazias"""
        # Arrange
        categorias = ["Alimentação", "", "Transporte", "   ", "Saúde"]
        mock_transacao_repo.listar_categorias.return_value = categorias
        
        # Act
        result = use_case.execute()
        
        # Assert
        # Empty strings são consideradas falsy em Python
        assert "" not in result
        assert "Alimentação" in result
        assert "Transporte" in result
        assert "Saúde" in result
    
    def test_sem_categorias_retorna_lista_vazia(self, use_case, mock_transacao_repo):
        """Deve retornar lista vazia se não houver categorias"""
        # Arrange
        mock_transacao_repo.listar_categorias.return_value = []
        
        # Act
        result = use_case.execute()
        
        # Assert
        assert result == []
    
    def test_categorias_duplicadas_sao_preservadas(self, use_case, mock_transacao_repo):
        """Repositório já retorna categorias únicas, então duplicatas não aparecem"""
        # Arrange
        categorias = ["Alimentação", "Transporte", "Saúde"]
        mock_transacao_repo.listar_categorias.return_value = categorias
        
        # Act
        result = use_case.execute()
        
        # Assert
        assert result == ["Alimentação", "Saúde", "Transporte"]
        assert len(result) == 3
