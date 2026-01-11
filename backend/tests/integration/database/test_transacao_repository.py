"""
Testes de integração para TransacaoRepository
Valida operações CRUD com banco de dados real
"""
from datetime import date

import pytest
from app.domain.entities.transacao import TipoTransacao, Transacao
from app.infrastructure.database.repositories.transacao_repository import TransacaoRepository
from sqlmodel import Session


@pytest.mark.integration
class TestTransacaoRepositoryIntegration:
    """Testes de integração do repositório de transações"""
    
    def test_criar_e_buscar_por_id(self, db_session: Session):
        """
        ARRANGE: Transação válida
        ACT: Criar e buscar por ID
        ASSERT: Transação é persistida e recuperada corretamente
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        transacao = Transacao(
            data=date(2025, 1, 15),
            descricao="Test transaction",
            valor=100.50,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        # Act
        transacao_criada = repository.criar(transacao)
        transacao_buscada = repository.buscar_por_id(transacao_criada.id)
        
        # Assert
        assert transacao_buscada is not None
        assert transacao_buscada.id == transacao_criada.id
        assert transacao_buscada.descricao == "Test transaction"
        assert transacao_buscada.valor == 100.50
        assert transacao_buscada.tipo == TipoTransacao.SAIDA
    
    def test_listar_todas_transacoes(self, db_session: Session):
        """
        ARRANGE: Múltiplas transações no banco
        ACT: Listar sem filtros
        ASSERT: Retorna todas as transações
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        
        transacao1 = Transacao(
            data=date(2025, 1, 10),
            descricao="Transacao 1",
            valor=50.00,
            tipo=TipoTransacao.ENTRADA,
            origem="manual"
        )
        
        transacao2 = Transacao(
            data=date(2025, 1, 15),
            descricao="Transacao 2",
            valor=75.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        repository.criar(transacao1)
        repository.criar(transacao2)
        
        # Act
        transacoes = repository.listar()
        
        # Assert
        assert len(transacoes) >= 2
        descricoes = [t.descricao for t in transacoes]
        assert "Transacao 1" in descricoes
        assert "Transacao 2" in descricoes
    
    def test_listar_com_filtro_tipo(self, db_session: Session):
        """
        ARRANGE: Transações de entrada e saída
        ACT: Filtrar por tipo ENTRADA
        ASSERT: Retorna apenas entradas
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        
        entrada = Transacao(
            data=date(2025, 1, 10),
            descricao="Entrada",
            valor=100.00,
            tipo=TipoTransacao.ENTRADA,
            origem="manual"
        )
        
        saida = Transacao(
            data=date(2025, 1, 15),
            descricao="Saida",
            valor=50.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        repository.criar(entrada)
        repository.criar(saida)
        
        # Act
        transacoes = repository.listar(tipo=TipoTransacao.ENTRADA)
        
        # Assert
        assert all(t.tipo == TipoTransacao.ENTRADA for t in transacoes)
        descricoes = [t.descricao for t in transacoes]
        assert "Entrada" in descricoes
        assert "Saida" not in descricoes
    
    def test_listar_com_filtro_categoria(self, db_session: Session):
        """
        ARRANGE: Transações com categorias diferentes
        ACT: Filtrar por categoria específica
        ASSERT: Retorna apenas transações da categoria
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        
        transacao1 = Transacao(
            data=date(2025, 1, 10),
            descricao="Compra mercado",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            categoria="Alimentação",
            origem="manual"
        )
        
        transacao2 = Transacao(
            data=date(2025, 1, 15),
            descricao="Combustível",
            valor=200.00,
            tipo=TipoTransacao.SAIDA,
            categoria="Transporte",
            origem="manual"
        )
        
        repository.criar(transacao1)
        repository.criar(transacao2)
        
        # Act
        transacoes = repository.listar(categoria="Alimentação")
        
        # Assert
        assert all(t.categoria == "Alimentação" for t in transacoes)
        descricoes = [t.descricao for t in transacoes]
        assert "Compra mercado" in descricoes
        assert "Combustível" not in descricoes
    
    def test_listar_com_filtro_periodo_data(self, db_session: Session):
        """
        ARRANGE: Transações em datas diferentes
        ACT: Filtrar por período específico
        ASSERT: Retorna apenas transações no período
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        
        # Transação dentro do período
        transacao_dentro = Transacao(
            data=date(2025, 1, 15),
            descricao="Dentro do período",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        # Transação fora do período
        transacao_fora = Transacao(
            data=date(2025, 2, 20),
            descricao="Fora do período",
            valor=50.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        repository.criar(transacao_dentro)
        repository.criar(transacao_fora)
        
        # Act
        transacoes = repository.listar(
            data_inicio=date(2025, 1, 1),
            data_fim=date(2025, 1, 31)
        )
        
        # Assert
        descricoes = [t.descricao for t in transacoes]
        assert "Dentro do período" in descricoes
        assert "Fora do período" not in descricoes
    
    def test_atualizar_transacao(self, db_session: Session):
        """
        ARRANGE: Transação existente
        ACT: Atualizar categoria
        ASSERT: Mudança é persistida
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        transacao = Transacao(
            data=date(2025, 1, 15),
            descricao="Test",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        transacao_criada = repository.criar(transacao)
        
        # Act
        transacao_criada.alterar_categoria("Nova Categoria")
        repository.atualizar(transacao_criada)
        
        # Buscar novamente para validar persistência
        transacao_atualizada = repository.buscar_por_id(transacao_criada.id)
        
        # Assert
        assert transacao_atualizada.categoria == "Nova Categoria"
        assert transacao_atualizada.atualizado_em > transacao_atualizada.criado_em
    
    def test_deletar_transacao(self, db_session: Session):
        """
        ARRANGE: Transação existente
        ACT: Deletar transação
        ASSERT: Transação é removida do banco
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        transacao = Transacao(
            data=date(2025, 1, 15),
            descricao="To be deleted",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        transacao_criada = repository.criar(transacao)
        transacao_id = transacao_criada.id
        
        # Act
        repository.deletar(transacao_id)
        transacao_buscada = repository.buscar_por_id(transacao_id)
        
        # Assert
        assert transacao_buscada is None
    
    def test_restaurar_valor_original(self, db_session: Session):
        """
        ARRANGE: Transação com valor modificado
        ACT: Restaurar valor original
        ASSERT: Valor volta ao original
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        transacao = Transacao(
            data=date(2025, 1, 15),
            descricao="Test",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        transacao_criada = repository.criar(transacao)
        
        # Modificar valor
        transacao_criada.alterar_valor(50.00)
        repository.atualizar(transacao_criada)
        
        # Act
        repository.restaurar_valor_original(transacao_criada.id)
        
        # Buscar novamente
        transacao_restaurada = repository.buscar_por_id(transacao_criada.id)
        
        # Assert
        assert transacao_restaurada.valor == 100.00  # Valor original
        assert transacao_restaurada.valor_original == 100.00
    
    def test_adicionar_tag_em_transacao(self, db_session: Session):
        """
        ARRANGE: Transação sem tags
        ACT: Adicionar tag
        ASSERT: Tag é adicionada e persistida
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        transacao = Transacao(
            data=date(2025, 1, 15),
            descricao="Test",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        transacao_criada = repository.criar(transacao)
        
        # Act
        transacao_criada.adicionar_tag(1)
        transacao_criada.adicionar_tag(2)
        repository.atualizar(transacao_criada)
        
        # Buscar novamente
        transacao_atualizada = repository.buscar_por_id(transacao_criada.id)
        
        # Assert
        assert 1 in transacao_atualizada.tag_ids
        assert 2 in transacao_atualizada.tag_ids
        assert len(transacao_atualizada.tag_ids) == 2    
    def test_listar_com_filtro_sem_tags(self, db_session: Session):
        """
        ARRANGE: Transações com e sem tags
        ACT: Filtrar apenas transações sem tags
        ASSERT: Retorna apenas transações sem tags
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        
        # Transação sem tags
        transacao_sem_tags = Transacao(
            data=date(2025, 1, 10),
            descricao="Sem tags",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        # Transação com tags
        transacao_com_tags = Transacao(
            data=date(2025, 1, 15),
            descricao="Com tags",
            valor=50.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        t1 = repository.criar(transacao_sem_tags)
        t2 = repository.criar(transacao_com_tags)
        
        # Adicionar tag à segunda transação
        t2.adicionar_tag(1)
        repository.atualizar(t2)
        
        # Act
        transacoes = repository.listar(sem_tags=True)
        
        # Assert
        descricoes = [t.descricao for t in transacoes]
        assert "Sem tags" in descricoes
        assert "Com tags" not in descricoes
        assert all(len(t.tag_ids) == 0 for t in transacoes)
    
    def test_listar_com_filtro_tags_ou_sem_tags(self, db_session: Session):
        """
        ARRANGE: Transações com tag 1, tag 2 e sem tags
        ACT: Filtrar por tag 1 OU sem tags
        ASSERT: Retorna transações com tag 1 ou sem tags, mas não com apenas tag 2
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        
        # Transação sem tags
        transacao_sem_tags = Transacao(
            data=date(2025, 1, 10),
            descricao="Sem tags",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        # Transação com tag 1
        transacao_tag1 = Transacao(
            data=date(2025, 1, 15),
            descricao="Com tag 1",
            valor=50.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        # Transação com tag 2
        transacao_tag2 = Transacao(
            data=date(2025, 1, 20),
            descricao="Com tag 2",
            valor=75.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        )
        
        t1 = repository.criar(transacao_sem_tags)
        t2 = repository.criar(transacao_tag1)
        t3 = repository.criar(transacao_tag2)
        
        # Adicionar tags
        t2.adicionar_tag(1)
        repository.atualizar(t2)
        
        t3.adicionar_tag(2)
        repository.atualizar(t3)
        
        # Act - Filtrar por tag 1 OU sem tags
        transacoes = repository.listar(tag_ids=[1], sem_tags=True)
        
        # Assert
        descricoes = [t.descricao for t in transacoes]
        assert "Sem tags" in descricoes
        assert "Com tag 1" in descricoes
        assert "Com tag 2" not in descricoes
    
    def test_listar_com_filtro_multiplas_tags_ou_sem_tags(self, db_session: Session):
        """
        ARRANGE: Transações com diferentes tags e sem tags
        ACT: Filtrar por tags [1,2] OU sem tags
        ASSERT: Retorna transações com tag 1, tag 2 ou sem tags
        """
        # Arrange
        repository = TransacaoRepository(db_session)
        
        # Criar transações
        t_sem_tags = repository.criar(Transacao(
            data=date(2025, 1, 10),
            descricao="Sem tags",
            valor=100.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        ))
        
        t_tag1 = repository.criar(Transacao(
            data=date(2025, 1, 15),
            descricao="Tag 1",
            valor=50.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        ))
        
        t_tag2 = repository.criar(Transacao(
            data=date(2025, 1, 20),
            descricao="Tag 2",
            valor=75.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        ))
        
        t_tag3 = repository.criar(Transacao(
            data=date(2025, 1, 25),
            descricao="Tag 3",
            valor=25.00,
            tipo=TipoTransacao.SAIDA,
            origem="manual"
        ))
        
        # Adicionar tags
        t_tag1.adicionar_tag(1)
        repository.atualizar(t_tag1)
        
        t_tag2.adicionar_tag(2)
        repository.atualizar(t_tag2)
        
        t_tag3.adicionar_tag(3)
        repository.atualizar(t_tag3)
        
        # Act
        transacoes = repository.listar(tag_ids=[1, 2], sem_tags=True)
        
        # Assert
        descricoes = [t.descricao for t in transacoes]
        assert "Sem tags" in descricoes
        assert "Tag 1" in descricoes
        assert "Tag 2" in descricoes
        assert "Tag 3" not in descricoes