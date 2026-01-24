# Parser de Fatura BTG - Exemplo de Uso

O parser `BTGFaturaParser` foi criado para processar faturas de cartão de crédito do BTG Pactual.

## Características

- **Parser ID**: `btg_fatura`
- **Banco ID**: `btg`
- **Formatos suportados**: `.xls`, `.xlsx`
- **Requer senha**: Sim (obrigatória)

## Formato do Arquivo

### Nome do Arquivo

O arquivo deve seguir o padrão: `YYYYMMDD_*.xlsx`

Exemplos:

- `20240115_fatura_btg.xlsx`
- `20231225_cartao.xlsx`
- `20240228_fatura.xlsx`

A data no início do nome do arquivo representa a **data da fatura** (não a data de vencimento).

### Estrutura Interna (Excel)

O Excel deve conter as seguintes colunas:

- **Coluna B**: Data da transação (formato: `DD/MM/YYYY`)
- **Coluna C**: Descrição da transação
- **Coluna E**: Valor da transação
- **Coluna F**: Tipo de compra

### Arquivo Protegido por Senha

As faturas do BTG são arquivos Excel protegidos por senha. A senha deve ser fornecida ao importar o arquivo.

## Processamento de Parcelas

O parser reconhece automaticamente transações parceladas no formato `(N/T)` na descrição, onde:

- `N` = número da parcela atual
- `T` = total de parcelas

**Exemplo:**

```
Descrição: "Compra Loja ABC (3/12)"
Data original: 15/01/2024
Data ajustada: 15/03/2024  (soma 2 meses porque é a 3ª parcela)
```

O parser ajusta a data da transação baseado no número da parcela:

- Parcela 1/12 → data original
- Parcela 2/12 → data original + 1 mês
- Parcela 3/12 → data original + 2 meses
- ...e assim por diante

## Como Usar

### 1. Via API (Swagger UI)

Acesse `http://localhost:8000/docs` e use o endpoint `POST /importacao`:

1. Faça upload do arquivo `.xlsx`
2. Preencha o campo `password` com a senha do arquivo
3. Execute

**Exemplo de resposta:**

```json
{
  "total_importado": 25,
  "transacoes_ids": [1, 2, 3, ...],
  "mensagem": "25 transações importadas com sucesso (parser: btg_fatura)"
}
```

### 2. Via Python (Testes ou Scripts)

```python
from app.infrastructure.parsers.btg_fatura_parser import BTGFaturaParser

# Criar instância do parser
parser = BTGFaturaParser()

# Ler arquivo
with open("20240115_fatura_btg.xlsx", "rb") as f:
    conteudo = f.read()

# Fazer parsing (com senha)
df = parser.parse(
    arquivo=conteudo,
    nome_arquivo="20240115_fatura_btg.xlsx",
    password="sua_senha_aqui"
)

# DataFrame resultante tem as colunas:
# - data: datetime (ajustada para parcelas)
# - descricao: str
# - valor: float
# - tipo_compra: str
# - data_fatura: datetime
# - origem: 'fatura_cartao'
# - banco: 'btg'
```

## Detecção Automática

O parser é **automaticamente detectado** pelo sistema quando o arquivo segue o padrão de nome `YYYYMMDD_*.xlsx`.

Não é necessário especificar qual parser usar - o sistema identifica baseado no nome do arquivo.

## Exemplos de Dados Processados

### Entrada (Excel):

| Data       | Descrição            | Valor   | Tipo Compra |
| ---------- | -------------------- | ------- | ----------- |
| 15/01/2024 | Netflix              | -39.90  | Assinatura  |
| 15/01/2024 | Notebook Dell (1/12) | -250.00 | Parcelado   |
| 15/01/2024 | Notebook Dell (2/12) | -250.00 | Parcelado   |
| 20/01/2024 | Supermercado         | -450.00 | À vista     |

### Saída (DataFrame):

| data       | descricao            | valor   | tipo_compra | data_fatura | origem        | banco |
| ---------- | -------------------- | ------- | ----------- | ----------- | ------------- | ----- |
| 2024-01-15 | Netflix              | -39.90  | Assinatura  | 2024-01-15  | fatura_cartao | btg   |
| 2024-01-15 | Notebook Dell (1/12) | -250.00 | Parcelado   | 2024-01-15  | fatura_cartao | btg   |
| 2024-02-15 | Notebook Dell (2/12) | -250.00 | Parcelado   | 2024-01-15  | fatura_cartao | btg   |
| 2024-01-20 | Supermercado         | -450.00 | À vista     | 2024-01-15  | fatura_cartao | btg   |

Note que a segunda parcela teve sua data ajustada para `2024-02-15` (1 mês depois da data original).

## Filtragem Automática

O parser remove automaticamente:

- Linhas com cabeçalho (`data != 'Data'`)
- Linhas com "Benefício do cartão BTG Pactual"
- Linhas com dados nulos ou inválidos

## Tratamento de Erros

### Senha Incorreta

```
ValidationException: Erro ao descriptografar ou ler arquivo Excel: ...
Verifique se a senha está correta.
```

### Nome de Arquivo Inválido

```
ValidationException: Nome do arquivo deve seguir o padrão YYYYMMDD_*.xlsx.
Exemplo: 20240115_fatura_btg.xlsx
```

### Arquivo Sem Senha

```
ValidationException: Senha é obrigatória para ler faturas do BTG Pactual
```

## Integração com Sistema

Após o parsing, o sistema automaticamente:

1. ✅ Adiciona a tag "Rotina" em todas as transações
2. ✅ Aplica regras ativas (se houver)
3. ✅ Ignora duplicatas (transações já existentes)
4. ✅ Salva no banco de dados

## Testes

Os testes estão em: `tests/unit/infrastructure/test_btg_parser.py`

Rodar testes específicos:

```bash
cd backend
uv run pytest tests/unit/infrastructure/test_btg_parser.py::TestBTGFaturaParser -v
```

## Dependências

O parser utiliza a biblioteca `msoffcrypto-tool` para ler arquivos Excel protegidos por senha.

Esta dependência foi adicionada em `pyproject.toml`:

```toml
dependencies = [
    ...
    "msoffcrypto-tool>=5.0.0",
    ...
]
```
