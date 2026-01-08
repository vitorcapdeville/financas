# Como Adicionar Novo Parser

## Exemplo: Parser de Fatura BTG

### 1. Criar o Parser

`app/infrastructure/parsers/btg_fatura_parser.py`

```python
from io import BytesIO
from typing import BinaryIO
import pandas as pd
from app.application.exceptions import ValidationException
from app.domain.parsers.extrato_parser import IExtratoParser


class BTGFaturaParser(IExtratoParser):
    """Parser para faturas de cartão do BTG Pactual"""

    @property
    def parser_id(self) -> str:
        # ID único no registry (chave única)
        return "btg_fatura"

    @property
    def banco_id(self) -> str:
        # Banco (vai para coluna 'banco' no DataFrame)
        return "btg"

    @property
    def nome_banco(self) -> str:
        return "BTG Pactual - Fatura"

    @property
    def formatos_suportados(self) -> list[str]:
        return ['.pdf', '.xlsx']

    def parse(self, arquivo: BinaryIO, nome_arquivo: str) -> pd.DataFrame:
        """
        Lê fatura BTG e retorna DataFrame normalizado.

        DEVE retornar DataFrame com colunas:
        - data: datetime
        - descricao: str
        - valor: float
        - origem: str ('fatura_cartao')
        - banco: str ('btg')
        - categoria: str (opcional)
        - data_fatura: datetime (opcional)
        """
        # Implementar leitura específica da fatura BTG
        # ...

        # Sempre adicionar estas colunas
        df['origem'] = 'fatura_cartao'
        df['banco'] = self.banco_id

        return df
```

### 2. Registrar no Registry

`app/infrastructure/parsers/extrato_parser_registry.py`

```python
def _inicializar_parsers(registry: ExtratoParserRegistry) -> None:
    from app.infrastructure.parsers.btg_extrato_parser import BTGExtratoParser
    from app.infrastructure.parsers.btg_fatura_parser import BTGFaturaParser  # NOVO
    from app.infrastructure.parsers.arquivo_tratado_parser import ArquivoTratadoParser

    registry.registrar(BTGExtratoParser())
    registry.registrar(BTGFaturaParser())  # NOVO
    registry.registrar(ArquivoTratadoParser())
```

### 3. Detector já está preparado!

O `DetectorTipoArquivo` já detecta faturas BTG pelo padrão:

```
YYYY-MM-DD_Fatura_NOME_NNNN_BTG
```

E retorna `parser_id='btg_fatura'` automaticamente.

## Diferença entre parser_id e banco_id

| Campo       | Propósito           | Exemplo        | Único?                                           |
| ----------- | ------------------- | -------------- | ------------------------------------------------ |
| `parser_id` | Chave no registry   | `'btg_fatura'` | ✅ SIM - cada parser tem um ID único             |
| `banco_id`  | Coluna no DataFrame | `'btg'`        | ❌ NÃO - múltiplos parsers podem ter mesmo banco |

## Parsers Planejados

- ✅ `btg_extrato` - Extrato BTG (implementado)
- ⏳ `btg_fatura` - Fatura BTG (a implementar)
- ⏳ `nubank_extrato` - Extrato Nubank (a implementar)
- ⏳ `nubank_fatura` - Fatura Nubank (a implementar)
- ✅ `arquivo_tratado` - CSV/Excel normalizado (implementado)

## Fluxo Completo

```
Arquivo: "2025-01-05_Fatura_VITOR_123_BTG.pdf"
    ↓
DetectorTipoArquivo.detectar()
    → parser_id = 'btg_fatura'
    → banco = 'btg'
    → origem = 'fatura_cartao'
    ↓
Registry.obter_parser('btg_fatura')
    → BTGFaturaParser
    ↓
BTGFaturaParser.parse()
    → DataFrame normalizado
    ↓
ImportacaoService
    → Salva no banco
```
