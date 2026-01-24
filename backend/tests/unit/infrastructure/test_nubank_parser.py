"""
Testes unitários para parser de fatura Nubank
"""
from io import BytesIO

import pandas as pd
import pytest
from app.application.exceptions import ValidationException
from app.infrastructure.parsers.nubank_fatura_parser import NubankFaturaParser


class TestNubankFaturaParser:
    """Testes para NubankFaturaParser"""
    
    @pytest.fixture
    def parser(self):
        """Instância do parser de fatura Nubank"""
        return NubankFaturaParser()
    
    def test_propriedades_basicas(self, parser):
        """Deve ter propriedades corretas"""
        assert parser.parser_id == "nubank_fatura"
        assert parser.banco_id == "nubank"
        assert parser.nome_banco == "Nubank - Fatura Cartão"
        assert '.csv' in parser.formatos_suportados
    
    def test_validar_formato_csv(self, parser):
        """Deve aceitar arquivo .csv"""
        assert parser.validar_formato("Nubank_2026-01-06.csv") == True
    
    def test_validar_formato_xlsx_rejeitado(self, parser):
        """Deve rejeitar arquivo .xlsx"""
        assert parser.validar_formato("Nubank_2026-01-06.xlsx") == False
    
    def test_extract_data_fatura_valida(self, parser):
        """Deve extrair data da fatura do nome do arquivo"""
        data_fatura = parser._extract_data_fatura("Nubank_2026-01-06.csv")
        assert data_fatura == pd.Timestamp("2026-01-06")
    
    def test_extract_data_fatura_formato_invalido(self, parser):
        """Deve lançar exceção para formato inválido de nome"""
        with pytest.raises(ValidationException) as exc_info:
            parser._extract_data_fatura("fatura_invalida.csv")
        
        assert "Nubank_YYYY-MM-DD.csv" in str(exc_info.value)
    
    def test_extract_data_fatura_sem_prefixo_nubank(self, parser):
        """Deve lançar exceção se arquivo não começar com Nubank_"""
        with pytest.raises(ValidationException) as exc_info:
            parser._extract_data_fatura("Outro_2026-01-06.csv")
        
        assert "Nubank_YYYY-MM-DD.csv" in str(exc_info.value)
    
    def test_parse_fatura_nubank_valida(self, parser):
        """Deve fazer parsing de fatura Nubank válida"""
        # Criar CSV de teste em memória
        csv_content = """date,title,amount
2026-01-05,Restaurante XYZ,-50.00
2026-01-06,Uber,-25.50
2026-01-07,Cinema,-40.00
"""
        csv_buffer = BytesIO(csv_content.encode('utf-8'))
        
        # Fazer parsing
        resultado = parser.parse(csv_buffer.read(), "Nubank_2026-01-06.csv")
        
        # Verificar resultados
        assert len(resultado) == 3
        assert list(resultado.columns) == ['data', 'descricao', 'valor', 'data_fatura', 'origem', 'banco']
        
        # Verificar primeira linha
        assert resultado.iloc[0]['descricao'] == '[Nubank] Restaurante XYZ'
        assert resultado.iloc[0]['valor'] == -50.00
        assert resultado.iloc[0]['data_fatura'] == pd.Timestamp('2026-01-06')
        assert resultado.iloc[0]['origem'] == 'fatura_cartao'
        assert resultado.iloc[0]['banco'] == 'nubank'
    
    def test_parse_adiciona_prefixo_nubank(self, parser):
        """Deve adicionar prefixo [Nubank] em todas as descrições"""
        csv_content = """date,title,amount
2026-01-05,Compra 1,-10.00
2026-01-06,Compra 2,-20.00
"""
        csv_buffer = BytesIO(csv_content.encode('utf-8'))
        
        resultado = parser.parse(csv_buffer.read(), "Nubank_2026-01-06.csv")
        
        # Todas as descrições devem ter prefixo
        assert all(resultado['descricao'].str.startswith('[Nubank] '))
    
    def test_parse_colunas_faltando_lanca_excecao(self, parser):
        """Deve lançar exceção se colunas obrigatórias estiverem faltando"""
        csv_content = """date,title
2026-01-05,Compra 1
"""
        csv_buffer = BytesIO(csv_content.encode('utf-8'))
        
        with pytest.raises(ValidationException) as exc_info:
            parser.parse(csv_buffer.read(), "Nubank_2026-01-06.csv")
        
        assert "Colunas obrigatórias faltando" in str(exc_info.value)
        assert "amount" in str(exc_info.value)
    
    def test_parse_remove_linhas_invalidas(self, parser):
        """Deve remover linhas com dados inválidos"""
        csv_content = """date,title,amount
2026-01-05,Compra válida,-50.00
invalid-date,Compra data inválida,-25.00
2026-01-07,Compra valor inválido,not-a-number
2026-01-08,Compra válida 2,-40.00
"""
        csv_buffer = BytesIO(csv_content.encode('utf-8'))
        
        resultado = parser.parse(csv_buffer.read(), "Nubank_2026-01-06.csv")
        
        # Deve ter apenas 2 linhas válidas
        assert len(resultado) == 2
        assert '[Nubank] Compra válida' in resultado['descricao'].values
        assert '[Nubank] Compra válida 2' in resultado['descricao'].values
    
    def test_parse_arquivo_vazio_retorna_dataframe_vazio(self, parser):
        """Deve retornar DataFrame vazio para CSV sem dados"""
        csv_content = """date,title,amount
"""
        csv_buffer = BytesIO(csv_content.encode('utf-8'))
        
        resultado = parser.parse(csv_buffer.read(), "Nubank_2026-01-06.csv")
        
        assert len(resultado) == 0
    
    def test_parse_arquivo_corrompido_lanca_excecao(self, parser):
        """Deve lançar ValidationException para arquivo corrompido"""
        arquivo_invalido = b"dados corrompidos nao CSV"
        
        with pytest.raises(ValidationException) as exc_info:
            parser.parse(arquivo_invalido, "Nubank_2026-01-06.csv")
        
        # Pandas pode ler mas vai faltar colunas obrigatórias
        assert "Colunas obrigatórias faltando" in str(exc_info.value) or \
               "Erro ao processar fatura Nubank" in str(exc_info.value)
