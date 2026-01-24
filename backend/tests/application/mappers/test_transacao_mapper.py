"""
Testes para TransacaoMapper
"""
from datetime import date, datetime

from app.application.dto.tag_dto import TagDTO
from app.application.dto.transacao_dto import AtualizarTransacaoDTO, CriarTransacaoDTO, TransacaoDTO
from app.application.mappers.transacao_mapper import TransacaoMapper
from app.domain.entities.transacao import Transacao
from app.domain.value_objects.tipo_transacao import TipoTransacao


class TestTransacaoMapper:
    """Testes para TransacaoMapper"""
    
    def test_to_dto_sem_tags(self):
        """Testa conversão de Transacao para TransacaoDTO sem tags"""
        # Arrange
        transacao = Transacao(
            id=1,
            data=date(2024, 1, 15),
            descricao="Compra teste",
            valor=100.50,
            valor_original=100.50,
            tipo=TipoTransacao.SAIDA,
            categoria="Alimentação",
            origem="manual",
            banco=None,
            observacoes="Obs teste",
            data_fatura=None,
            tag_ids=[1, 2]
        )
        
        # Act
        dto = TransacaoMapper.to_dto(transacao)
        
        # Assert
        assert isinstance(dto, TransacaoDTO)
        assert dto.id == 1
        assert dto.data == date(2024, 1, 15)
        assert dto.descricao == "Compra teste"
        assert dto.valor == 100.50
        assert dto.valor_original == 100.50
        assert dto.tipo == TipoTransacao.SAIDA
        assert dto.categoria == "Alimentação"
        assert dto.origem == "manual"
        assert dto.banco is None
        assert dto.observacoes == "Obs teste"
        assert dto.data_fatura is None
        assert dto.tag_ids == [1, 2]
        assert dto.tags == []  # Sem tags fornecidas
    
    def test_to_dto_com_tags(self):
        """Testa conversão incluindo tags completas"""
        # Arrange
        transacao = Transacao(
            id=1,
            data=date(2024, 1, 15),
            descricao="Compra com tags",
            valor=50.0,
            tipo=TipoTransacao.SAIDA,
            tag_ids=[1, 2]
        )
        
        tags = [
            TagDTO(
                id=1,
                nome="Tag1",
                cor="#FF0000",
                descricao=None,
                criado_em=datetime.now(),
                atualizado_em=datetime.now()
            ),
            TagDTO(
                id=2,
                nome="Tag2",
                cor="#00FF00",
                descricao=None,
                criado_em=datetime.now(),
                atualizado_em=datetime.now()
            )
        ]
        
        # Act
        dto = TransacaoMapper.to_dto(transacao, tags=tags)
        
        # Assert
        assert len(dto.tags) == 2
        assert dto.tags[0].nome == "Tag1"
        assert dto.tags[1].nome == "Tag2"
    
    def test_from_criar_dto(self):
        """Testa conversão de CriarTransacaoDTO para Transacao"""
        # Arrange
        dto = CriarTransacaoDTO(
            data=date(2024, 1, 20),
            descricao="Nova compra",
            valor=75.30,
            tipo=TipoTransacao.SAIDA,
            categoria="Lazer",
            origem="manual",
            banco="BTG",
            observacoes="Teste",
            data_fatura=date(2024, 2, 5)
        )
        
        # Act
        transacao = TransacaoMapper.from_criar_dto(dto)
        
        # Assert
        assert isinstance(transacao, Transacao)
        assert transacao.id is None  # Nova entidade
        assert transacao.data == date(2024, 1, 20)
        assert transacao.descricao == "Nova compra"
        assert transacao.valor == 75.30
        assert transacao.valor_original == 75.30  # Valor original = valor inicial
        assert transacao.tipo == TipoTransacao.SAIDA
        assert transacao.categoria == "Lazer"
        assert transacao.origem == "manual"
        assert transacao.banco == "BTG"
        assert transacao.observacoes == "Teste"
        assert transacao.data_fatura == date(2024, 2, 5)
    
    def test_aplicar_atualizacoes_todos_campos(self):
        """Testa aplicação de todas as atualizações"""
        # Arrange
        transacao = Transacao(
            id=1,
            data=date(2024, 1, 10),
            descricao="Original",
            valor=100.0,
            tipo=TipoTransacao.SAIDA,
            categoria="Antiga",
            observacoes="Obs antiga",
            data_fatura=None
        )
        
        dto = AtualizarTransacaoDTO(
            descricao="Atualizada",
            valor=150.0,
            categoria="Nova",
            observacoes="Obs nova",
            data_fatura=date(2024, 2, 1)
        )
        
        # Act
        TransacaoMapper.aplicar_atualizacoes(transacao, dto)
        
        # Assert
        assert transacao.descricao == "Atualizada"
        assert transacao.valor == 150.0
        assert transacao.categoria == "Nova"
        assert transacao.observacoes == "Obs nova"
        assert transacao.data_fatura == date(2024, 2, 1)
    
    def test_aplicar_atualizacoes_parcial(self):
        """Testa atualização parcial"""
        # Arrange
        transacao = Transacao(
            id=1,
            data=date(2024, 1, 10),
            descricao="Original",
            valor=100.0,
            tipo=TipoTransacao.SAIDA,
            categoria="Cat1",
            observacoes="Obs1",
            data_fatura=None
        )
        
        dto = AtualizarTransacaoDTO(
            descricao="Nova desc",
            valor=200.0
            # Outros campos None
        )
        
        # Act
        TransacaoMapper.aplicar_atualizacoes(transacao, dto)
        
        # Assert
        assert transacao.descricao == "Nova desc"
        assert transacao.valor == 200.0
        # Campos não atualizados mantêm valores originais
        assert transacao.categoria == "Cat1"
        assert transacao.observacoes == "Obs1"
        assert transacao.data_fatura is None
    
    def test_aplicar_atualizacoes_dto_vazio(self):
        """Testa que DTO vazio não altera nada"""
        # Arrange
        transacao = Transacao(
            id=1,
            data=date(2024, 1, 10),
            descricao="Original",
            valor=100.0,
            tipo=TipoTransacao.SAIDA,
            categoria="Cat1",
            observacoes="Obs1",
            data_fatura=None
        )
        
        dto = AtualizarTransacaoDTO()  # Tudo None
        
        # Act
        TransacaoMapper.aplicar_atualizacoes(transacao, dto)
        
        # Assert - nada muda
        assert transacao.descricao == "Original"
        assert transacao.valor == 100.0
        assert transacao.categoria == "Cat1"
        assert transacao.observacoes == "Obs1"
        assert transacao.data_fatura is None
