"""
Parser de fatura de cartão de crédito do BTG Pactual
"""
import io
from typing import BinaryIO, Optional

import msoffcrypto
import pandas as pd
from pandas import DateOffset

from app.application.exceptions import ValidationException
from app.domain.parsers.extrato_parser import IExtratoParser


class BTGFaturaParser(IExtratoParser):
    """
    Parser para faturas de cartão de crédito do BTG Pactual.
    
    Formato esperado:
    - Arquivo Excel protegido por senha (.xls ou .xlsx)
    - Colunas: B (data), C (descricao), E (valor), F (tipo_compra)
    - Nome do arquivo: YYYY-MM-DD_Fatura_NOME_NNNN_BTG.xlsx
    - Suporte a transações parceladas (formato: "Descrição (1/12)")
    - Ajusta data da transação baseado no número da parcela
    """
    
    @property
    def parser_id(self) -> str:
        return "btg_fatura"
    
    @property
    def banco_id(self) -> str:
        return "btg"
    
    @property
    def nome_banco(self) -> str:
        return "BTG Pactual - Fatura Cartão"
    
    @property
    def formatos_suportados(self) -> list[str]:
        return ['.xls', '.xlsx']
    
    def _read_excel_with_password(
        self,
        arquivo: BinaryIO,
        password: str,
        **kwargs
    ) -> pd.DataFrame:
        """
        Lê arquivo Excel protegido por senha.
        
        Args:
            arquivo: Conteúdo do arquivo Excel
            password: Senha para descriptografar o arquivo
            **kwargs: Argumentos adicionais para pd.read_excel
            
        Returns:
            DataFrame com os dados do arquivo
            
        Raises:
            ValidationException: Se erro ao descriptografar ou ler arquivo
        """
        try:
            decrypted_workbook = io.BytesIO()
            
            # msoffcrypto precisa de um arquivo seekable
            arquivo_bytes = arquivo if isinstance(arquivo, bytes) else arquivo.read()
            file_obj = io.BytesIO(arquivo_bytes)
            
            # Criar objeto OfficeFile e descriptografar
            office_file = msoffcrypto.OfficeFile(file_obj)
            office_file.load_key(password=password)
            office_file.decrypt(decrypted_workbook)
            
            # Voltar ao início do stream
            decrypted_workbook.seek(0)
            
            df = pd.read_excel(decrypted_workbook, **kwargs)
            return df
            
        except Exception as e:
            raise ValidationException(
                f"Erro ao descriptografar ou ler arquivo Excel: {str(e)}. "
                "Verifique se a senha está correta."
            )
    
    def _extract_data_fatura(self, nome_arquivo: str) -> pd.Timestamp:
        """
        Extrai data da fatura do nome do arquivo.
        
        Formato esperado: YYYY-MM-DD_Fatura_NOME_NNNN_BTG.xlsx
        Exemplo: 2024-01-15_Fatura_NOME_1234_BTG.xlsx -> 2024-01-15
        
        Args:
            nome_arquivo: Nome do arquivo
            
        Returns:
            Data da fatura
            
        Raises:
            ValidationException: Se nome do arquivo não seguir padrão esperado
        """
        try:
            data_str = nome_arquivo.split("_")[0]
            return pd.to_datetime(data_str, format="%Y-%m-%d")
        except (IndexError, ValueError) as e:
            raise ValidationException(
                f"Nome do arquivo deve seguir o padrão YYYY-MM-DD_Fatura_NOME_NNNN_BTG.xlsx. "
                f"Exemplo: 2024-01-15_Fatura_NOME_1234_BTG.xlsx. Erro: {str(e)}"
            )
    
    def _process_parcelas(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Processa transações parceladas e ajusta datas.
        
        Extrai informação de parcelas do formato "(1/12)" e ajusta
        a data da transação somando (parcela_num - 1) meses.
        
        Args:
            df: DataFrame com coluna 'descricao' e 'data'
            
        Returns:
            DataFrame com datas ajustadas e colunas auxiliares removidas
        """
        # Extrair informação de parcelas (ex: "1/12")
        df["parcela"] = df["descricao"].str.extract(r"\((\d+/\d+)\)")
        
        # Separar número e denominador, mas apenas para linhas com parcelas
        df["parcela_num"] = None
        df["parcela_den"] = None
        
        # Processar apenas linhas com parcelas válidas
        mask_parcelas = df["parcela"].notna()
        if mask_parcelas.any():
            parcelas_split = df.loc[mask_parcelas, "parcela"].str.split("/", expand=True)
            df.loc[mask_parcelas, "parcela_num"] = parcelas_split[0]
            df.loc[mask_parcelas, "parcela_den"] = parcelas_split[1]
        
        # Converter data original
        df["data"] = pd.to_datetime(df["data"], format="%d/%m/%Y", errors='coerce')
        
        # Calcular nova data: data original + (parcela_num - 1) meses
        # Se não for parcelado, parcela_num é None, fillna(1) faz com que seja a data original
        df["parcela_num"] = pd.to_numeric(df["parcela_num"], errors='coerce')
        df["nova_data"] = df.apply(
            lambda row: row["data"] + DateOffset(months=int(row["parcela_num"] - 1))
            if pd.notna(row["parcela_num"])
            else row["data"],
            axis=1
        )
        
        # Limpar colunas auxiliares e renomear
        df = df.drop(columns=["parcela_num", "parcela_den", "parcela", "data"])
        df = df.rename(columns={"nova_data": "data"})
        
        return df
    
    def parse(
        self,
        arquivo: BinaryIO,
        nome_arquivo: str,
        password: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Faz parsing da fatura de cartão BTG.
        
        Args:
            arquivo: Conteúdo do arquivo Excel
            nome_arquivo: Nome do arquivo (formato: YYYY-MM-DD_Fatura_NOME_NNNN_BTG.xlsx)
            password: Senha para descriptografar o arquivo (obrigatório)
            
        Returns:
            DataFrame com colunas: data, descricao, valor, tipo_compra, data_fatura
            
        Raises:
            ValidationException: Se erro ao processar arquivo ou senha não fornecida
        """
        if not password:
            raise ValidationException(
                "Senha é obrigatória para ler faturas do BTG Pactual"
            )
        
        try:
            # Extrair data da fatura do nome do arquivo
            data_fatura = self._extract_data_fatura(nome_arquivo)
            
            # Ler Excel com senha
            df = self._read_excel_with_password(
                arquivo,
                password=password,
                usecols="B,C,E,F",
                names=["data", "descricao", "valor", "tipo_compra"]
            )
            
            # Adicionar coluna data_fatura
            df["data_fatura"] = data_fatura
            
            # Filtrar linhas inválidas
            df = df.query(
                "data.notnull() and "
                "descricao.notnull() and "
                "tipo_compra.notnull() and "
                "descricao != 'Benefício do cartão BTG Pactual' and "
                "data != 'Data'"
            ).copy()
            
            # Processar parcelas e ajustar datas
            df = self._process_parcelas(df)
            
            # Converter valor para float
            df["valor"] = pd.to_numeric(df["valor"], errors='coerce')
            
            # Remover linhas onde conversão falhou
            df = df.dropna(subset=["data", "valor"])
            
            # Adicionar colunas de contexto
            df['origem'] = 'fatura_cartao'
            df['banco'] = self.banco_id
            
            # Reordenar colunas (incluir tipo_compra e data_fatura)
            df = df[["data", "descricao", "valor", "tipo_compra", "data_fatura", "origem", "banco"]]
            
            return df
            
        except ValidationException:
            # Re-raise ValidationException
            raise
        except Exception as e:
            raise ValidationException(
                f"Erro ao processar fatura BTG: {str(e)}"
            )
