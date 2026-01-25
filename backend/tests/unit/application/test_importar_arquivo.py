"""
Testes para ImportarArquivoUseCase
"""
from unittest.mock import Mock

import pytest
from app.application.dto.importacao_dto import ResultadoImportacaoDTO
from app.application.exceptions import ValidationException
from app.application.use_cases.importar_arquivo import ImportarArquivoUseCase
from app.domain.value_objects.tipo_transacao import TipoTransacao


@pytest.fixture
def mock_repos():
    """Cria mocks dos repositórios"""
    return {
        'transacao_repo': Mock(),
        'tag_repo': Mock(),
        'regra_repo': Mock(),
        'usuario_repo': Mock()
    }


@pytest.fixture
def use_case(mock_repos):
    """Cria instância do use case com mocks"""
    # Mock usuario_repo retorna CPF padrão
    mock_usuario = Mock()
    mock_usuario.cpf = "12345678901"
    mock_repos['usuario_repo'].buscar_por_id.return_value = mock_usuario
    
    return ImportarArquivoUseCase(
        transacao_repo=mock_repos['transacao_repo'],
        tag_repo=mock_repos['tag_repo'],
        regra_repo=mock_repos['regra_repo'],
        usuario_repo=mock_repos['usuario_repo']
    )


class TestImportarArquivoUseCase:
    """Testes do ImportarArquivoUseCase"""
    
    def test_importar_arquivo_csv_tratado(self, use_case, mock_repos):
        """Deve importar arquivo CSV já tratado com sucesso"""
        # Arrange
        csv_content = b"data,descricao,valor,origem\n2025-01-05,Teste,100.00,extrato_bancario"
        nome_arquivo = "transacoes.csv"
        
        # Mock tag
        mock_tag = Mock()
        mock_tag.id = 1
        mock_repos['tag_repo'].buscar_por_nome.return_value = mock_tag
        
        # Mock transação criada
        mock_transacao = Mock()
        mock_transacao.id = 123
        mock_repos['transacao_repo'].criar.return_value = mock_transacao
        
        # Mock regras vazias
        mock_repos['regra_repo'].listar.return_value = []
        
        # Act
        resultado = use_case.execute(csv_content, nome_arquivo)
        
        # Assert
        assert isinstance(resultado, ResultadoImportacaoDTO)
        assert resultado.total_importado == 1
        assert len(resultado.transacoes_ids) == 1
        assert resultado.transacoes_ids[0] == 123
        assert "parser: arquivo_tratado" in resultado.mensagem
        
        # Verificar que transação foi criada
        mock_repos['transacao_repo'].criar.assert_called_once()
        
        # Verificar que tag foi adicionada
        mock_transacao.adicionar_tag.assert_called_once_with(1)
        mock_repos['transacao_repo'].atualizar.assert_called()
    
    def test_importar_arquivo_vazio_deve_falhar(self, use_case):
        """Deve lançar exceção se arquivo estiver vazio"""
        # Arrange
        csv_content = b"data,descricao,valor,origem\n"  # Só header
        nome_arquivo = "vazio.csv"
        
        # Act & Assert
        with pytest.raises(ValidationException, match="Nenhuma linha válida encontrada"):
            use_case.execute(csv_content, nome_arquivo)
    
    def test_importar_com_regras_ativas(self, use_case, mock_repos):
        """Deve aplicar regras ativas nas transações importadas"""
        # Arrange
        csv_content = b"data,descricao,valor,origem\n2025-01-05,Mercado,50.00,fatura_cartao"
        nome_arquivo = "transacoes.csv"
        
        # Mock tag
        mock_tag = Mock()
        mock_tag.id = 1
        mock_repos['tag_repo'].buscar_por_nome.return_value = mock_tag
        
        # Mock transação criada
        mock_transacao = Mock()
        mock_transacao.id = 789
        mock_repos['transacao_repo'].criar.return_value = mock_transacao
        mock_repos['transacao_repo'].buscar_por_id.return_value = mock_transacao
        
        # Mock regras ativas
        mock_regra = Mock()
        mock_repos['regra_repo'].listar.return_value = [mock_regra]
        
        # Act
        resultado = use_case.execute(csv_content, nome_arquivo)
        
        # Assert
        assert resultado.total_importado == 1
        
        # Verificar que regra foi aplicada
        mock_regra.aplicar_em.assert_called_once_with(mock_transacao)
        
        # Verificar que transação foi atualizada após aplicar regras
        assert mock_repos['transacao_repo'].atualizar.call_count >= 2  # Tag + Regras
    
    def test_importar_fatura_sempre_saida(self, use_case, mock_repos):
        """Transações de fatura devem sempre ser SAIDA"""
        # Arrange
        csv_content = b"data,descricao,valor,origem\n2025-01-05,Compra,100.00,fatura_cartao"
        nome_arquivo = "fatura.csv"
        
        # Mock tag
        mock_tag = Mock()
        mock_tag.id = 1
        mock_repos['tag_repo'].buscar_por_nome.return_value = mock_tag
        
        # Capturar a transação criada
        transacao_criada = None
        def criar_transacao(transacao):
            nonlocal transacao_criada
            transacao_criada = transacao
            transacao_criada.id = 999
            return transacao_criada
        
        mock_repos['transacao_repo'].criar.side_effect = criar_transacao
        mock_repos['regra_repo'].listar.return_value = []
        
        # Act
        resultado = use_case.execute(csv_content, nome_arquivo)
        
        # Assert
        assert resultado.total_importado == 1
        assert transacao_criada.tipo == TipoTransacao.SAIDA
        assert transacao_criada.valor == 100.00  # Valor absoluto
    
    def test_importar_extrato_entrada_saida(self, use_case, mock_repos):
        """Extrato deve usar sinal do valor para determinar tipo"""
        # Arrange
        csv_data = "data,descricao,valor,origem\n"
        csv_data += "2025-01-05,Salario,5000.00,extrato_bancario\n"
        csv_data += "2025-01-06,Mercado,-150.00,extrato_bancario"
        csv_content = csv_data.encode('utf-8')
        
        nome_arquivo = "extrato.csv"
        
        # Mock tag
        mock_tag = Mock()
        mock_tag.id = 1
        mock_repos['tag_repo'].buscar_por_nome.return_value = mock_tag
        
        # Capturar transações criadas
        transacoes_criadas = []
        def criar_transacao(transacao):
            transacao.id = len(transacoes_criadas) + 1
            transacoes_criadas.append(transacao)
            return transacao
        
        mock_repos['transacao_repo'].criar.side_effect = criar_transacao
        mock_repos['regra_repo'].listar.return_value = []
        
        # Act
        resultado = use_case.execute(csv_content, nome_arquivo)
        
        # Assert
        assert resultado.total_importado == 2
        
        # Primeira transação (positivo) = ENTRADA
        assert transacoes_criadas[0].tipo == TipoTransacao.ENTRADA
        assert transacoes_criadas[0].valor == 5000.00
        
        # Segunda transação (negativo) = SAIDA
        assert transacoes_criadas[1].tipo == TipoTransacao.SAIDA
        assert transacoes_criadas[1].valor == 150.00  # Valor absoluto
