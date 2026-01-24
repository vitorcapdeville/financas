"""
Testes para RegraMapper
"""

from app.application.dto.regra_dto import AtualizarRegraDTO, CriarRegraDTO, RegraDTO
from app.application.mappers.regra_mapper import RegraMapper
from app.domain.entities.regra import Regra
from app.domain.value_objects.regra_enums import CriterioTipo, TipoAcao


class TestRegraMapper:
    """Testes para RegraMapper"""
    
    def test_to_dto_converte_corretamente(self):
        """Testa conversão de Regra para RegraDTO"""
        # Arrange
        regra = Regra(
            id=1,
            nome="Regra Teste",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="uber",
            acao_valor="Transporte",
            prioridade=10,
            ativo=True,
            tag_ids=[1, 2, 3]
        )
        
        # Act
        dto = RegraMapper.to_dto(regra)
        
        # Assert
        assert isinstance(dto, RegraDTO)
        assert dto.id == 1
        assert dto.nome == "Regra Teste"
        assert dto.tipo_acao == TipoAcao.ALTERAR_CATEGORIA
        assert dto.criterio_tipo == CriterioTipo.DESCRICAO_CONTEM
        assert dto.criterio_valor == "uber"
        assert dto.acao_valor == "Transporte"
        assert dto.prioridade == 10
        assert dto.ativo is True
        assert dto.tag_ids == [1, 2, 3]
    
    def test_from_criar_dto_converte_corretamente(self):
        """Testa conversão de CriarRegraDTO para Regra"""
        # Arrange
        dto = CriarRegraDTO(
            nome="Nova Regra",
            tipo_acao=TipoAcao.ADICIONAR_TAGS,
            criterio_tipo=CriterioTipo.DESCRICAO_EXATA,
            criterio_valor="Uber",
            acao_valor="[1,2]",
            prioridade=5,
            ativo=False,
            tag_ids=[1, 2]
        )
        
        # Act
        regra = RegraMapper.from_criar_dto(dto)
        
        # Assert
        assert isinstance(regra, Regra)
        assert regra.id is None  # Nova entidade não tem ID
        assert regra.nome == "Nova Regra"
        assert regra.tipo_acao == TipoAcao.ADICIONAR_TAGS
        assert regra.criterio_tipo == CriterioTipo.DESCRICAO_EXATA
        assert regra.criterio_valor == "Uber"
        assert regra.acao_valor == "[1,2]"
        assert regra.prioridade == 5
        assert regra.ativo is False
        assert regra.tag_ids == [1, 2]
    
    def test_from_criar_dto_com_tag_ids_none(self):
        """Testa que tag_ids None vira lista vazia"""
        # Arrange
        dto = CriarRegraDTO(
            nome="Regra Sem Tags",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="teste",
            acao_valor="Categoria",
            prioridade=1,
            tag_ids=None
        )
        
        # Act
        regra = RegraMapper.from_criar_dto(dto)
        
        # Assert
        assert regra.tag_ids == []
    
    def test_aplicar_atualizacoes_atualiza_todos_campos(self):
        """Testa aplicação de todas as atualizações"""
        # Arrange
        regra = Regra(
            id=1,
            nome="Original",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="old",
            acao_valor="OldCat",
            prioridade=1,
            ativo=True,
            tag_ids=[]
        )
        
        dto = AtualizarRegraDTO(
            nome="Atualizada",
            tipo_acao=TipoAcao.ADICIONAR_TAGS,
            criterio_tipo=CriterioTipo.CATEGORIA,
            criterio_valor="Transporte",
            acao_valor="NewCat",
            prioridade=10,
            ativo=False,
            tag_ids=[5, 6]
        )
        
        # Act
        RegraMapper.aplicar_atualizacoes(regra, dto)
        
        # Assert
        assert regra.nome == "Atualizada"
        assert regra.tipo_acao == TipoAcao.ADICIONAR_TAGS
        assert regra.criterio_tipo == CriterioTipo.CATEGORIA
        assert regra.criterio_valor == "Transporte"
        assert regra.acao_valor == "NewCat"
        assert regra.prioridade == 10
        assert regra.ativo is False
        assert regra.tag_ids == [5, 6]
    
    def test_aplicar_atualizacoes_parcial(self):
        """Testa aplicação parcial (apenas alguns campos)"""
        # Arrange
        regra = Regra(
            id=1,
            nome="Original",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="old",
            acao_valor="OldCat",
            prioridade=5,
            ativo=True,
            tag_ids=[1]
        )
        
        dto = AtualizarRegraDTO(
            nome="Nome Novo",
            prioridade=15
            # Outros campos None
        )
        
        # Act
        RegraMapper.aplicar_atualizacoes(regra, dto)
        
        # Assert
        assert regra.nome == "Nome Novo"
        assert regra.prioridade == 15
        # Campos não atualizados devem manter valores originais
        assert regra.tipo_acao == TipoAcao.ALTERAR_CATEGORIA
        assert regra.criterio_tipo == CriterioTipo.DESCRICAO_CONTEM
        assert regra.criterio_valor == "old"
        assert regra.acao_valor == "OldCat"
        assert regra.ativo is True
        assert regra.tag_ids == [1]
    
    def test_aplicar_atualizacoes_nao_altera_se_dto_vazio(self):
        """Testa que nada muda se DTO estiver vazio"""
        # Arrange
        regra = Regra(
            id=1,
            nome="Original",
            tipo_acao=TipoAcao.ALTERAR_CATEGORIA,
            criterio_tipo=CriterioTipo.DESCRICAO_CONTEM,
            criterio_valor="old",
            acao_valor="OldCat",
            prioridade=5,
            ativo=True,
            tag_ids=[1]
        )
        
        dto = AtualizarRegraDTO()  # Todos os campos None
        
        # Act
        RegraMapper.aplicar_atualizacoes(regra, dto)
        
        # Assert - nada deve ter mudado
        assert regra.nome == "Original"
        assert regra.tipo_acao == TipoAcao.ALTERAR_CATEGORIA
        assert regra.criterio_tipo == CriterioTipo.DESCRICAO_CONTEM
        assert regra.criterio_valor == "old"
        assert regra.acao_valor == "OldCat"
        assert regra.prioridade == 5
        assert regra.ativo is True
        assert regra.tag_ids == [1]
