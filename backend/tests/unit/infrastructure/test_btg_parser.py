"""
Testes unitários para parsers de extrato bancário
"""
from io import BytesIO

import pandas as pd
import pytest
from app.application.exceptions import ValidationException
from app.infrastructure.parsers.btg_extrato_parser import BTGExtratoParser
from app.infrastructure.parsers.btg_fatura_parser import BTGFaturaParser


class TestBTGExtratoParser:
    """Testes para BTGExtratoParser"""
    
    @pytest.fixture
    def parser(self):
        """Instância do parser BTG"""
        return BTGExtratoParser()
    
    def test_propriedades_basicas(self, parser):
        """Deve ter propriedades corretas"""
        assert parser.banco_id == "btg"
        assert parser.nome_banco == "BTG Pactual"
        assert '.xls' in parser.formatos_suportados
        assert '.xlsx' in parser.formatos_suportados
    
    def test_validar_formato_xls(self, parser):
        """Deve aceitar arquivo .xls"""
        assert parser.validar_formato("extrato.xls") == True
    
    def test_validar_formato_xlsx(self, parser):
        """Deve aceitar arquivo .xlsx"""
        assert parser.validar_formato("extrato.xlsx") == True
    
    def test_validar_formato_csv_rejeitado(self, parser):
        """Deve rejeitar arquivo .csv"""
        assert parser.validar_formato("extrato.csv") == False
    
    def test_parse_extrato_btg_valido(self, parser):
        """Deve fazer parsing de extrato BTG válido"""
        # Criar arquivo Excel de teste em memória
        df_input = pd.DataFrame({
            'col_A': ['x'] * 5,
            'col_B': ['Data e hora', '01/12/2024 09:00', '02/12/2024 10:30', 'Saldo Diário', '03/12/2024 14:00'],
            'col_C': ['', 'Alimentação', 'Transporte', '', 'Lazer'],
            'col_D': ['', 'Débito', 'Débito', '', 'Débito'],
            'col_E': ['x'] * 5,
            'col_F': ['x'] * 5,
            'col_G': ['', 'Restaurante XYZ', 'Uber', 'Saldo Diário', 'Cinema'],
            'col_H': ['x'] * 5,
            'col_I': ['x'] * 5,
            'col_J': ['x'] * 5,
            'col_K': ['', -50.00, -25.50, '', -40.00],
        })
        
        # Salvar em BytesIO
        excel_buffer = BytesIO()
        df_input.to_excel(excel_buffer, index=False, header=False, engine='openpyxl')
        excel_buffer.seek(0)
        
        # Fazer parsing
        resultado = parser.parse(excel_buffer.read(), "extrato.xlsx")
        
        # Verificar resultados
        assert len(resultado) == 3  # 3 linhas válidas (exclui cabeçalho e Saldo Diário)
        assert list(resultado.columns) == ['data', 'descricao', 'valor', 'categoria', 'origem', 'banco']
        
        # Verificar primeira linha
        assert resultado.iloc[0]['descricao'] == 'Restaurante XYZ'
        assert resultado.iloc[0]['valor'] == -50.00
        assert resultado.iloc[0]['categoria'] == 'Alimentação'
        assert resultado.iloc[0]['origem'] == 'extrato_bancario'
        assert resultado.iloc[0]['banco'] == 'btg'
    
    def test_parse_remove_saldo_diario(self, parser):
        """Deve remover linhas com 'Saldo Diário'"""
        df_input = pd.DataFrame({
            'col_A': ['x'] * 4,
            'col_B': ['Data e hora', '01/12/2024 09:00', 'Saldo Diário', '02/12/2024 10:00'],
            'col_C': ['', 'Alimentação', '', 'Transporte'],
            'col_D': ['', 'Débito', '', 'Débito'],
            'col_E': ['x'] * 4,
            'col_F': ['x'] * 4,
            'col_G': ['', 'Restaurante', 'Saldo Diário', 'Uber'],
            'col_H': ['x'] * 4,
            'col_I': ['x'] * 4,
            'col_J': ['x'] * 4,
            'col_K': ['', -50.00, 1000.00, -25.00],
        })
        
        excel_buffer = BytesIO()
        df_input.to_excel(excel_buffer, index=False, header=False, engine='openpyxl')
        excel_buffer.seek(0)
        
        resultado = parser.parse(excel_buffer.read(), "extrato.xlsx")
        
        # Deve ter apenas 2 linhas (excluiu cabeçalho e Saldo Diário)
        assert len(resultado) == 2
        assert 'Saldo Diário' not in resultado['descricao'].values
    
    def test_parse_arquivo_vazio_retorna_dataframe_vazio(self, parser):
        """Deve retornar DataFrame vazio para arquivo com apenas cabeçalho"""
        # Criar arquivo com estrutura do BTG mas sem transações
        df_input = pd.DataFrame({
            'col_A': ['header'] * 2,
            'col_B': ['Data e hora', 'Saldo Diário'],
            'col_C': ['cat', ''],
            'col_D': ['tipo', ''],
            'col_E': ['e'] * 2,
            'col_F': ['f'] * 2,
            'col_G': ['desc', 'Saldo Diário'],
            'col_H': ['h'] * 2,
            'col_I': ['i'] * 2,
            'col_J': ['j'] * 2,
            'col_K': ['valor', 5000.00],
        })
        
        excel_buffer = BytesIO()
        df_input.to_excel(excel_buffer, index=False, header=False, engine='openpyxl')
        excel_buffer.seek(0)
        
        resultado = parser.parse(excel_buffer.read(), "extrato.xlsx")
        
        # Cabeçalho e Saldo Diário são filtrados
        assert len(resultado) == 0
    
    def test_parse_arquivo_corrompido_lanca_excecao(self, parser):
        """Deve lançar ValidationException para arquivo corrompido"""
        arquivo_invalido = b"dados corrompidos"
        
        with pytest.raises(ValidationException) as exc_info:
            parser.parse(arquivo_invalido, "extrato.xls")
        
        assert "Erro ao processar extrato BTG" in str(exc_info.value)


class TestBTGFaturaParser:
    """Testes para BTGFaturaParser"""
    
    @pytest.fixture
    def parser(self):
        """Instância do parser de fatura BTG"""
        return BTGFaturaParser()
    
    def test_propriedades_basicas(self, parser):
        """Deve ter propriedades corretas"""
        assert parser.parser_id == "btg_fatura"
        assert parser.banco_id == "btg"
        assert parser.nome_banco == "BTG Pactual - Fatura Cartão"
        assert '.xls' in parser.formatos_suportados
        assert '.xlsx' in parser.formatos_suportados
    
    def test_validar_formato_xlsx(self, parser):
        """Deve aceitar arquivo .xlsx"""
        assert parser.validar_formato("20240115_fatura.xlsx") == True
    
    def test_extract_data_fatura_valida(self, parser):
        """Deve extrair data da fatura do nome do arquivo"""
        data_fatura = parser._extract_data_fatura("2024-01-15_Fatura_NOME_1234_BTG.xlsx")
        assert data_fatura == pd.Timestamp("2024-01-15")
    
    def test_extract_data_fatura_formato_invalido(self, parser):
        """Deve lançar exceção para formato inválido de nome"""
        with pytest.raises(ValidationException) as exc_info:
            parser._extract_data_fatura("fatura_invalida.xlsx")
        
        assert "YYYY-MM-DD_Fatura_NOME_NNNN_BTG.xlsx" in str(exc_info.value)
    
    def test_parse_sem_senha_lanca_excecao(self, parser):
        """Deve lançar exceção se senha não fornecida"""
        arquivo = b"dados"
        
        with pytest.raises(ValidationException) as exc_info:
            parser.parse(arquivo, "20240115_fatura.xlsx", password=None)
        
        assert "Senha é obrigatória" in str(exc_info.value)
    
    def test_process_parcelas_sem_parcelas(self, parser):
        """Deve processar transação sem parcelas corretamente"""
        df = pd.DataFrame({
            'data': ['15/01/2024'],
            'descricao': ['Compra à vista'],
            'valor': [100.0],
        })
        
        resultado = parser._process_parcelas(df)
        
        # Data deve permanecer a mesma
        assert resultado.iloc[0]['data'] == pd.Timestamp('2024-01-15')
    
    def test_process_parcelas_com_parcelas(self, parser):
        """Deve ajustar data baseado no número da parcela"""
        df = pd.DataFrame({
            'data': ['15/01/2024', '15/01/2024'],
            'descricao': ['Compra parcelada (1/12)', 'Compra parcelada (3/12)'],
            'valor': [50.0, 50.0],
        })
        
        resultado = parser._process_parcelas(df)
        
        # Primeira parcela: data original
        assert resultado.iloc[0]['data'] == pd.Timestamp('2024-01-15')
        # Terceira parcela: data original + 2 meses
        assert resultado.iloc[1]['data'] == pd.Timestamp('2024-03-15')

