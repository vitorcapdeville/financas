"""
Testes para TagMapper
"""
from datetime import datetime

from app.application.dto.tag_dto import CriarTagDTO, TagDTO
from app.application.mappers.tag_mapper import TagMapper
from app.domain.entities.tag import Tag


class TestTagMapper:
    """Testes para TagMapper"""
    
    def test_to_dto_converte_corretamente(self):
        """Testa conversão de Tag para TagDTO"""
        # Arrange
        tag = Tag(
            id=1,
            nome="Tag Teste",
            cor="#FF0000",
            descricao="Descrição teste",
            criado_em=datetime(2024, 1, 1, 10, 0, 0),
            atualizado_em=datetime(2024, 1, 15, 15, 30, 0)
        )
        
        # Act
        dto = TagMapper.to_dto(tag)
        
        # Assert
        assert isinstance(dto, TagDTO)
        assert dto.id == 1
        assert dto.nome == "Tag Teste"
        assert dto.cor == "#FF0000"
        assert dto.descricao == "Descrição teste"
        assert dto.criado_em == datetime(2024, 1, 1, 10, 0, 0)
        assert dto.atualizado_em == datetime(2024, 1, 15, 15, 30, 0)
    
    def test_to_dto_com_campos_opcionais_none(self):
        """Testa conversão quando campos opcionais são None"""
        # Arrange
        tag = Tag(
            id=2,
            nome="Tag Simples",
            cor=None,
            descricao=None
        )
        
        # Act
        dto = TagMapper.to_dto(tag)
        
        # Assert
        assert dto.id == 2
        assert dto.nome == "Tag Simples"
        assert dto.cor is None
        assert dto.descricao is None
        assert isinstance(dto.criado_em, datetime)
        assert isinstance(dto.atualizado_em, datetime)
    
    def test_from_criar_dto_com_todos_campos(self):
        """Testa conversão de CriarTagDTO para Tag com todos os campos"""
        # Arrange
        dto = CriarTagDTO(
            nome="Nova Tag",
            cor="#00FF00",
            descricao="Descrição da nova tag"
        )
        
        # Act
        tag = TagMapper.from_criar_dto(dto)
        
        # Assert
        assert isinstance(tag, Tag)
        assert tag.id is None  # Nova entidade não tem ID
        assert tag.nome == "Nova Tag"
        assert tag.cor == "#00FF00"
        assert tag.descricao == "Descrição da nova tag"
        assert isinstance(tag.criado_em, datetime)
        assert isinstance(tag.atualizado_em, datetime)
    
    def test_from_criar_dto_apenas_nome(self):
        """Testa criação de tag com apenas nome (campos opcionais)"""
        # Arrange
        dto = CriarTagDTO(
            nome="Tag Mínima",
            cor=None,
            descricao=None
        )
        
        # Act
        tag = TagMapper.from_criar_dto(dto)
        
        # Assert
        assert tag.nome == "Tag Mínima"
        assert tag.cor is None
        assert tag.descricao is None
    
    def test_from_criar_dto_normaliza_nome(self):
        """Testa que Tag.__post_init__ normaliza o nome (strip)"""
        # Arrange
        dto = CriarTagDTO(
            nome="  Tag com espaços  ",
            cor="#0000FF"
        )
        
        # Act
        tag = TagMapper.from_criar_dto(dto)
        
        # Assert
        assert tag.nome == "Tag com espaços"  # Espaços removidos
