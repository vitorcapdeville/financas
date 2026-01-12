"""
Testes unitários para Use Cases de Regras

Objetivo: Testar lógica de aplicação de regras usando mocks
"""
from unittest.mock import Mock

import pytest
from app.application.dto.regra_dto import AtualizarRegraDTO, CriarRegraDTO
from app.application.exceptions.application_exceptions import EntityNotFoundException, ValidationException
from app.application.use_cases.atualizar_regra import AtualizarRegraUseCase
from app.application.use_cases.criar_regra import CriarRegraUseCase
from app.application.use_cases.deletar_regra import DeletarRegraUseCase
from app.application.use_cases.listar_regras import ListarRegrasUseCase
from app.domain.entities.regra import Regra
from app.domain.value_objects.regra_enums import CriterioTipo, TipoAcao


@pytest.mark.unit
class TestCriarRegraUseCase:
    """Testes para CriarRegraUseCase"""
    
    def test_criar_regra_com_sucesso(self):
        """
        ARRANGE: Mock do repositório
        ACT: Criar regra
        ASSERT: Regra criada e persistida
        """
        # Arrange
        mock_repository = Mock()
        mock_repository.buscar_por_nome.return_value = None  # Nome não duplicado
        regra_criada = Regra(
            id=1,
            nome="Categorizar Uber",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="uber",
            acao_valor="Transporte",
            prioridade=10,
            ativo=True
        )
        mock_repository.criar.return_value = regra_criada
        
        use_case = CriarRegraUseCase(mock_repository)
        dto = CriarRegraDTO(
            nome="Categorizar Uber",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="uber",
            acao_valor="Transporte",
            prioridade=10,
            ativo=True
        )
        
        # Act
        resultado = use_case.execute(dto)
        
        # Assert
        mock_repository.criar.assert_called_once()
        assert resultado.nome == "Categorizar Uber"
        assert resultado.acao_valor == "Transporte"
    
    def test_criar_regra_nome_vazio_lanca_excecao(self):
        """Testa que criar regra com nome vazio lança exceção"""
        # Arrange
        mock_repository = Mock()
        use_case = CriarRegraUseCase(mock_repository)
        dto = CriarRegraDTO(
            nome="",  # Nome vazio
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="teste",
            acao_valor="Categoria",
            prioridade=10
        )
        
        # Act & Assert
        with pytest.raises(ValidationException) as exc_info:
            use_case.execute(dto)
        
        assert "nome" in str(exc_info.value).lower()
        mock_repository.criar.assert_not_called()


@pytest.mark.unit
class TestListarRegrasUseCase:
    """Testes para ListarRegrasUseCase"""
    
    def test_listar_regras_retorna_todas_regras(self):
        """
        ARRANGE: Mock do repositório com lista de regras
        ACT: Executar use case
        ASSERT: Verificar que todas as regras foram retornadas
        """
        # Arrange
        mock_repository = Mock()
        regras = [
            Regra(id=1, nome="Regra 1", prioridade=10),
            Regra(id=2, nome="Regra 2", prioridade=5),
            Regra(id=3, nome="Regra 3", prioridade=15)
        ]
        mock_repository.listar.return_value = regras
        
        use_case = ListarRegrasUseCase(mock_repository)
        
        # Act
        resultado = use_case.execute()
        
        # Assert
        mock_repository.listar.assert_called_once()
        assert len(resultado) == 3
        # Deve ordenar por prioridade (decrescente)
        assert resultado[0].prioridade == 15
        assert resultado[1].prioridade == 10
        assert resultado[2].prioridade == 5
    
    def test_listar_regras_vazio_retorna_lista_vazia(self):
        """Testa que repositório vazio retorna lista vazia"""
        # Arrange
        mock_repository = Mock()
        mock_repository.listar.return_value = []
        
        use_case = ListarRegrasUseCase(mock_repository)
        
        # Act
        resultado = use_case.execute()
        
        # Assert
        assert resultado == []


@pytest.mark.unit
class TestAtualizarRegraUseCase:
    """Testes para AtualizarRegraUseCase"""
    
    def test_atualizar_regra_existente_com_sucesso(self):
        """
        ARRANGE: Mock do repositório com regra existente
        ACT: Executar use case com dados de atualização
        ASSERT: Verificar que regra foi atualizada
        """
        # Arrange
        regra_existente = Regra(
            id=1,
            nome="Regra antiga",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="teste",
            acao_valor="Antiga"
        )
        
        mock_repository = Mock()
        mock_repository.buscar_por_id.return_value = regra_existente
        mock_repository.buscar_por_nome.return_value = None  # Nome não duplicado
        mock_repository.atualizar.return_value = regra_existente
        
        use_case = AtualizarRegraUseCase(mock_repository)
        dto = AtualizarRegraDTO(nome="Regra atualizada", acao_valor="Nova")
        
        # Act
        resultado = use_case.execute(1, dto)
        
        # Assert
        mock_repository.buscar_por_id.assert_called_once_with(1)
        mock_repository.atualizar.assert_called_once()
        assert resultado.nome == "Regra atualizada"
    
    def test_atualizar_regra_inexistente_lanca_excecao(self):
        """Testa que atualizar regra inexistente lança exceção"""
        # Arrange
        mock_repository = Mock()
        mock_repository.buscar_por_id.return_value = None
        
        use_case = AtualizarRegraUseCase(mock_repository)
        dto = AtualizarRegraDTO(nome="Novo nome")
        
        # Act & Assert
        with pytest.raises(EntityNotFoundException):
            use_case.execute(999, dto)


@pytest.mark.unit
class TestDeletarRegraUseCase:
    """Testes para DeletarRegraUseCase"""
    
    def test_deletar_regra_existente_com_sucesso(self):
        """
        ARRANGE: Mock do repositório com regra existente
        ACT: Executar use case
        ASSERT: Verificar que regra foi deletada
        """
        # Arrange
        regra_existente = Regra(id=1, nome="A Deletar")
        
        mock_repository = Mock()
        mock_repository.buscar_por_id.return_value = regra_existente
        
        use_case = DeletarRegraUseCase(mock_repository)
        
        # Act
        use_case.execute(1)
        
        # Assert
        mock_repository.buscar_por_id.assert_called_once_with(1)
        mock_repository.deletar.assert_called_once_with(1)
    
    def test_deletar_regra_inexistente_lanca_excecao(self):
        """Testa que deletar regra inexistente lança exceção"""
        # Arrange
        mock_repository = Mock()
        mock_repository.buscar_por_id.return_value = None
        
        use_case = DeletarRegraUseCase(mock_repository)
        
        # Act & Assert
        with pytest.raises(EntityNotFoundException):
            use_case.execute(999)
        
        mock_repository.deletar.assert_not_called()
