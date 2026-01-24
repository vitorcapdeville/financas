"""
Testes unitários para parsers do Nubank (fatura e extrato)
"""
from io import BytesIO

import pandas as pd
import pytest
from app.application.exceptions import ValidationException
from app.infrastructure.parsers.nubank_extrato_parser import NubankExtratoParser
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
        assert resultado.iloc[0]['descricao'] == 'Restaurante XYZ'
        assert resultado.iloc[0]['valor'] == -50.00
        assert resultado.iloc[0]['data_fatura'] == pd.Timestamp('2026-01-06')
        assert resultado.iloc[0]['origem'] == 'fatura_cartao'
        assert resultado.iloc[0]['banco'] == 'nubank'
    
    def test_parse_adiciona_data_fatura(self, parser):
        """Deve adicionar data_fatura extraída do nome do arquivo"""
        csv_content = """date,title,amount
2026-01-05,Compra 1,-10.00
2026-01-06,Compra 2,-20.00
"""
        csv_buffer = BytesIO(csv_content.encode('utf-8'))
        
        resultado = parser.parse(csv_buffer.read(), "Nubank_2026-01-06.csv")
        
        # Todas as linhas devem ter a mesma data_fatura
        assert all(resultado['data_fatura'] == pd.Timestamp('2026-01-06'))
    
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
        assert 'Compra válida' in resultado['descricao'].values
        assert 'Compra válida 2' in resultado['descricao'].values
    
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


class TestNubankExtratoParser:
    """Testes para NubankExtratoParser"""
    
    @pytest.fixture
    def parser(self):
        """Instância do parser de extrato Nubank"""
        return NubankExtratoParser()
    
    def test_propriedades_basicas(self, parser):
        """Deve ter propriedades corretas"""
        assert parser.parser_id == "nubank_extrato"
        assert parser.banco_id == "nubank"
        assert parser.nome_banco == "Nubank - Extrato Bancário"
        assert '.csv' in parser.formatos_suportados
    
    def test_validar_formato_csv_valido(self, parser):
        """Deve aceitar arquivo CSV com padrão correto"""
        arquivo_mock = BytesIO(b"test")
        assert parser.validar_formato(arquivo_mock, "NU_454757980_01NOV2025_30NOV2025.csv") == True
    
    def test_validar_formato_xlsx_rejeitado(self, parser):
        """Deve rejeitar arquivo .xlsx"""
        arquivo_mock = BytesIO(b"test")
        assert parser.validar_formato(arquivo_mock, "NU_454757980_01NOV2025_30NOV2025.xlsx") == False
    
    def test_validar_formato_nome_invalido(self, parser):
        """Deve rejeitar nome de arquivo que não segue o padrão"""
        arquivo_mock = BytesIO(b"test")
        assert parser.validar_formato(arquivo_mock, "extrato_nubank.csv") == False
    
    def test_parse_extrato_nubank_valido(self, parser):
        """Deve fazer parsing de extrato Nubank válido"""
        # Criar CSV de teste
        csv_data = """Data,Valor,Descrição
15/11/2025,1500.00,Salário
16/11/2025,-50.50,Restaurante XYZ
17/11/2025,-100.00,Supermercado ABC"""
        
        arquivo = csv_data.encode('utf-8')
        
        resultado = parser.parse(arquivo, "NU_454757980_01NOV2025_30NOV2025.csv")
        
        # Verificar resultados
        assert len(resultado) == 3
        assert list(resultado.columns) == ['data', 'descricao', 'valor', 'origem', 'banco']
        
        # Verificar primeira linha
        assert resultado.iloc[0]['descricao'] == 'Salário'
        assert resultado.iloc[0]['valor'] == 1500.00
        assert resultado.iloc[0]['origem'] == 'extrato_bancario'
        assert resultado.iloc[0]['banco'] == 'nubank'
        assert pd.notna(resultado.iloc[0]['data'])
    
    def test_parse_converte_tipos_corretamente(self, parser):
        """Deve converter data e valor para tipos corretos"""
        csv_data = """Data,Valor,Descrição
20/12/2025,-250.75,Compra teste"""
        
        arquivo = csv_data.encode('utf-8')
        resultado = parser.parse(arquivo, "NU_454757980_01DEC2025_31DEC2025.csv")
        
        assert len(resultado) == 1
        assert isinstance(resultado.iloc[0]['data'], pd.Timestamp)
        assert resultado.iloc[0]['valor'] == -250.75
    
    def test_parse_remove_linhas_invalidas(self, parser):
        """Deve remover linhas com dados inválidos"""
        csv_data = """Data,Valor,Descrição
15/11/2025,100.00,Compra válida
data_invalida,50.00,Dados ruins
16/11/2025,valor_invalido,Mais dados ruins
17/11/2025,200.00,Outra compra válida"""
        
        arquivo = csv_data.encode('utf-8')
        resultado = parser.parse(arquivo, "NU_454757980_01NOV2025_30NOV2025.csv")
        
        # Apenas 2 linhas válidas
        assert len(resultado) == 2
        assert resultado.iloc[0]['descricao'] == 'Compra válida'
        assert resultado.iloc[1]['descricao'] == 'Outra compra válida'
    
    def test_parse_nome_arquivo_invalido_lanca_excecao(self, parser):
        """Deve lançar ValidationException para nome de arquivo inválido"""
        csv_data = b"Data,Valor,Descricao\n15/11/2025,100.00,Teste"
        
        with pytest.raises(ValidationException) as exc_info:
            parser.parse(csv_data, "arquivo_invalido.csv")
        
        assert "não é um extrato Nubank válido" in str(exc_info.value)
    
    def test_parse_colunas_faltando_lanca_excecao(self, parser):
        """Deve lançar ValidationException se colunas obrigatórias faltarem"""
        # CSV sem coluna Descrição
        csv_data = b"Data,Valor\n15/11/2025,100.00"
        
        with pytest.raises(ValidationException) as exc_info:
            parser.parse(csv_data, "NU_454757980_01NOV2025_30NOV2025.csv")
        
        assert "Colunas faltando" in str(exc_info.value)
    
    def test_parse_arquivo_vazio_retorna_dataframe_vazio(self, parser):
        """Deve retornar DataFrame vazio para arquivo sem dados válidos"""
        csv_data = "Data,Valor,Descrição\n".encode('utf-8')
        
        resultado = parser.parse(csv_data, "NU_454757980_01NOV2025_30NOV2025.csv")
        
        assert len(resultado) == 0
        assert list(resultado.columns) == ['data', 'descricao', 'valor', 'origem', 'banco']
    
    def test_parse_arquivo_corrompido_lanca_excecao(self, parser):
        """Deve lançar ValidationException para arquivo corrompido"""
        arquivo_invalido = b"dados corrompidos nao CSV"
        
        with pytest.raises(ValidationException) as exc_info:
            parser.parse(arquivo_invalido, "NU_454757980_01NOV2025_30NOV2025.csv")
        
        assert "Erro ao processar extrato Nubank" in str(exc_info.value) or \
               "Colunas faltando" in str(exc_info.value)

