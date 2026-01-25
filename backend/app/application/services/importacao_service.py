"""
Serviço de Importação de Transações

Responsabilidades:
- Processar DataFrame normalizado e criar transações
- Garantir existência da tag Rotina
- Aplicar regras ativas
"""
from datetime import datetime
from typing import List

import pandas as pd

from app.application.dto.importacao_dto import ResultadoImportacaoDTO
from app.domain.entities.tag import Tag
from app.domain.entities.transacao import Transacao
from app.domain.repositories.regra_repository import IRegraRepository
from app.domain.repositories.tag_repository import ITagRepository
from app.domain.repositories.transacao_repository import ITransacaoRepository
from app.domain.repositories.usuario_repository import IUsuarioRepository
from app.domain.value_objects.tipo_transacao import TipoTransacao


class ImportacaoService:
    """
    Serviço para importação de transações a partir de DataFrame normalizado.
    
    Responsabilidades:
    - Converter linhas do DataFrame em entidades Transacao
    - Garantir existência da tag Rotina
    - Aplicar regras ativas em transações importadas
    """
    
    def __init__(
        self,
        transacao_repo: ITransacaoRepository,
        tag_repo: ITagRepository,
        regra_repo: IRegraRepository,
        usuario_repo: IUsuarioRepository,
        usuario_id: int = 1  # Padrão: "Não definido"
    ):
        self._transacao_repo = transacao_repo
        self._tag_repo = tag_repo
        self._regra_repo = regra_repo
        self._usuario_repo = usuario_repo
        self._usuario_id = usuario_id
    
    def obter_cpf_usuario(self) -> str | None:
        """
        Obtém o CPF do usuário associado (usado como senha para faturas BTG).
        
        Returns:
            CPF do usuário ou None se não cadastrado
        """
        usuario = self._usuario_repo.buscar_por_id(self._usuario_id)
        return usuario.cpf if usuario else None
    
    def importar(self, df: pd.DataFrame) -> ResultadoImportacaoDTO:
        """
        Importa transações a partir de um DataFrame normalizado.
        
        Args:
            df: DataFrame com colunas: data, descricao, valor, origem, categoria (opcional), 
                banco (opcional), data_fatura (opcional)
            
        Returns:
            ResultadoImportacaoDTO com detalhes da importação
        """
        # Garantir que tag "Rotina" existe
        tag_rotina = self._garantir_tag_rotina()
        
        # Processar linhas e criar transações
        transacoes_ids = self._processar_linhas(df, tag_rotina)
        
        # Aplicar regras ativas em todas as transações importadas
        self._aplicar_regras(transacoes_ids)
        
        return ResultadoImportacaoDTO(
            total_importado=len(transacoes_ids),
            transacoes_ids=transacoes_ids,
            mensagem=f"{len(transacoes_ids)} transações importadas com sucesso"
        )
    
    def _processar_linhas(self, df: pd.DataFrame, tag_rotina: Tag) -> List[int]:
        """Processa cada linha do DataFrame e cria transações."""
        transacoes_ids = []
        
        for _, row in df.iterrows():
            try:
                transacao = self._linha_para_transacao(row)
                
                # Persistir
                transacao = self._transacao_repo.criar(transacao)
                
                # Adicionar tag "Rotina"
                transacao.adicionar_tag(tag_rotina.id)
                self._transacao_repo.atualizar(transacao)
                
                transacoes_ids.append(transacao.id)
                
            except Exception as e:
                # Log erro mas continua processamento
                print(f"Erro ao processar linha: {str(e)}")
                continue
        
        return transacoes_ids
    
    def _linha_para_transacao(self, row: pd.Series) -> Transacao:
        """
        Converte linha do DataFrame em entidade Transacao.
        
        Parser já normalizou os dados, apenas criamos a entidade.
        """
        # Converter data
        data = self._converter_data(row['data'])
        
        # Converter valor e determinar tipo baseado em origem
        valor = float(row['valor'])
        origem = str(row['origem']).lower()
        
        # Lógica baseada em origem
        if origem == 'fatura_cartao':
            # Fatura sempre é saída
            tipo = TipoTransacao.SAIDA
            valor_abs = abs(valor)
        else:  # extrato_bancario
            # Extrato usa sinal do valor
            tipo = TipoTransacao.ENTRADA if valor > 0 else TipoTransacao.SAIDA
            valor_abs = abs(valor)
        
        # Campos opcionais
        categoria = str(row['categoria']) if 'categoria' in row and pd.notna(row['categoria']) else None
        banco = str(row['banco']) if 'banco' in row and pd.notna(row['banco']) else None
        data_fatura = self._converter_data(row['data_fatura']) if 'data_fatura' in row and pd.notna(row['data_fatura']) else None
        
        return Transacao(
            data=data,
            descricao=str(row['descricao']),
            valor=valor_abs,
            valor_original=valor_abs,
            tipo=tipo,
            categoria=categoria,
            origem=origem,
            banco=banco,
            data_fatura=data_fatura,
            usuario_id=self._usuario_id
        ) 
    
    def _garantir_tag_rotina(self) -> Tag:
        """Garante que tag 'Rotina' existe, criando se necessário."""
        tag = self._tag_repo.buscar_por_nome("Rotina")
        
        if not tag:
            tag = Tag(
                nome="Rotina",
                cor="#4B5563",
                descricao="Tag adicionada automaticamente às transações importadas"
            )
            tag = self._tag_repo.criar(tag)
        
        return tag
    
    def _converter_data(self, valor) -> datetime.date:
        """Converte valor para date, suportando múltiplos formatos."""
        if isinstance(valor, str):
            if '/' in valor:
                return pd.to_datetime(valor, format='%d/%m/%Y').date()
            else:
                return pd.to_datetime(valor).date()
        else:
            return pd.to_datetime(valor).date()
    
    def _aplicar_regras(self, transacoes_ids: List[int]) -> None:
        """Aplica todas as regras ativas nas transações."""
        regras = self._regra_repo.listar(apenas_ativas=True)
        
        for transacao_id in transacoes_ids:
            transacao = self._transacao_repo.buscar_por_id(transacao_id)
            if not transacao:
                continue
            
            # Aplicar cada regra
            for regra in regras:
                regra.aplicar_em(transacao)
            
            # Atualizar transação
            self._transacao_repo.atualizar(transacao)
