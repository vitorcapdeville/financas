"""
Testes unitários para Use Cases de Tags

Objetivo: Testar lógica de aplicação de tags usando mocks
"""
from unittest.mock import Mock

import pytest
from app.application.dto.tag_dto import CriarTagDTO
from app.application.exceptions.application_exceptions import EntityNotFoundException, ValidationException
from app.application.use_cases.criar_tag import CriarTagUseCase
from app.application.use_cases.deletar_tag import DeletarTagUseCase
from app.application.use_cases.listar_tags import ListarTagsUseCase
from app.domain.entities.tag import Tag


@pytest.mark.unit
class TestCriarTagUseCase:
    """Testes para CriarTagUseCase"""
    
    def test_criar_tag_com_sucesso(self):
        """
        ARRANGE: Mock do repositório e DTO válido
        ACT: Executar use case
        ASSERT: Verificar que tag foi criada
        """
        # Arrange
        mock_repository = Mock()
        mock_repository.buscar_por_nome.return_value = None  # Tag não existe
        tag_criada = Tag(id=1, nome="Importante")
        mock_repository.criar.return_value = tag_criada
        
        use_case = CriarTagUseCase(mock_repository)
        dto = CriarTagDTO(nome="Importante")
        
        # Act
        resultado = use_case.execute(dto)
        
        # Assert
        mock_repository.buscar_por_nome.assert_called_once_with("Importante")
        mock_repository.criar.assert_called_once()
        assert resultado.nome == "Importante"
    
    def test_criar_tag_duplicada_lanca_excecao(self):
        """Testa que criar tag com nome duplicado lança exceção"""
        # Arrange
        mock_repository = Mock()
        tag_existente = Tag(id=1, nome="Importante")
        mock_repository.buscar_por_nome.return_value = tag_existente
        
        use_case = CriarTagUseCase(mock_repository)
        dto = CriarTagDTO(nome="Importante")
        
        # Act & Assert
        with pytest.raises(ValidationException) as exc_info:
            use_case.execute(dto)
        
        assert "Importante" in str(exc_info.value)
        mock_repository.criar.assert_not_called()


@pytest.mark.unit
class TestListarTagsUseCase:
    """Testes para ListarTagsUseCase"""
    
    def test_listar_tags_retorna_todas_tags(self):
        """
        ARRANGE: Mock do repositório com lista de tags
        ACT: Executar use case
        ASSERT: Verificar que todas as tags foram retornadas
        """
        # Arrange
        mock_repository = Mock()
        tags = [
            Tag(id=1, nome="Importante"),
            Tag(id=2, nome="Recorrente"),
            Tag(id=3, nome="Urgente")
        ]
        mock_repository.listar.return_value = tags
        
        use_case = ListarTagsUseCase(mock_repository)
        
        # Act
        resultado = use_case.execute()
        
        # Assert
        mock_repository.listar.assert_called_once()
        assert len(resultado) == 3
        assert resultado[0].nome == "Importante"
        assert resultado[1].nome == "Recorrente"
        assert resultado[2].nome == "Urgente"
    
    def test_listar_tags_vazio_retorna_lista_vazia(self):
        """Testa que listar tags vazio retorna lista vazia"""
        # Arrange
        mock_repository = Mock()
        mock_repository.listar.return_value = []
        
        use_case = ListarTagsUseCase(mock_repository)
        
        # Act
        resultado = use_case.execute()
        
        # Assert
        assert len(resultado) == 0


@pytest.mark.unit
class TestDeletarTagUseCase:
    """Testes para DeletarTagUseCase"""
    
    def test_deletar_tag_existente_com_sucesso(self):
        """
        ARRANGE: Mock do repositório com tag existente
        ACT: Executar use case
        ASSERT: Verificar que tag foi deletada
        """
        # Arrange
        tag_existente = Tag(id=1, nome="A Deletar")
        
        mock_repository = Mock()
        mock_repository.buscar_por_id.return_value = tag_existente
        
        use_case = DeletarTagUseCase(mock_repository)
        
        # Act
        use_case.execute(1)
        
        # Assert
        mock_repository.buscar_por_id.assert_called_once_with(1)
        mock_repository.deletar.assert_called_once_with(1)
    
    def test_deletar_tag_inexistente_lanca_excecao(self):
        """Testa que deletar tag inexistente lança exceção"""
        # Arrange
        mock_repository = Mock()
        mock_repository.buscar_por_id.return_value = None
        
        use_case = DeletarTagUseCase(mock_repository)
        
        # Act & Assert
        with pytest.raises(EntityNotFoundException):
            use_case.execute(999)
        
        mock_repository.deletar.assert_not_called()
