# Importação de Extrato Bruto

Sistema de importação de arquivos de extrato bancário em formatos nativos dos bancos, utilizando parsers específicos.

## Arquitetura

Implementação seguindo **Clean Architecture** e **SOLID**:

### Domain Layer (Interfaces)

- **`IExtratoParser`** ([app/domain/parsers/extrato_parser.py](app/domain/parsers/extrato_parser.py))
  - Interface abstrata definindo contrato para parsers
  - Propriedades: `banco_id`, `nome_banco`, `formatos_suportados`
  - Método principal: `parse(arquivo: bytes, nome_arquivo: str) -> pd.DataFrame`
  - Princípio: Dependency Inversion Principle (DIP)

### Application Layer (Use Cases)

- **`ImportarExtratoBrutoUseCase`** ([app/application/use_cases/importar_extrato_bruto.py](app/application/use_cases/importar_extrato_bruto.py))
  - Orquestra o fluxo de importação usando parsers
  - Valida banco suportado e formato de arquivo
  - Utiliza `ImportacaoService` para processamento comum
  - Retorna lista de bancos disponíveis via `listar_bancos_suportados()`

### Infrastructure Layer (Implementações)

- **Parsers Concretos**

  - `BTGExtratoParser` ([app/infrastructure/parsers/btg_extrato_parser.py](app/infrastructure/parsers/btg_extrato_parser.py))
    - Formatos: `.xls`, `.xlsx`
    - Lê colunas específicas (B, C, D, G, K)
    - Filtra "Saldo Diário" e linhas inválidas
    - Normaliza para formato padrão: `data`, `descricao`, `valor`, `categoria`

- **`ExtratoParserRegistry`** ([app/infrastructure/parsers/extrato_parser_registry.py](app/infrastructure/parsers/extrato_parser_registry.py))
  - Factory Pattern + Singleton
  - Gerencia registro de parsers disponíveis
  - Métodos: `registrar()`, `obter_parser()`, `listar_bancos_disponiveis()`
  - Princípio: Open/Closed Principle (OCP) - extensível sem modificação

### Presentation Layer (API)

- **Endpoints** ([app/interfaces/api/routers/importacao.py](app/interfaces/api/routers/importacao.py))

  - `POST /importacao/extrato-bruto?banco_id={banco}`

    - Upload de arquivo nativo do banco
    - Validações: banco suportado, formato válido
    - Retorna: total importado, IDs das transações, mensagem

  - `GET /importacao/bancos-suportados`
    - Lista bancos disponíveis com formatos aceitos
    - Resposta: `[{banco_id, nome_banco, formatos_suportados}]`

## Database Schema

### Campo Adicionado: `banco`

- **Tabela**: `transacao`
- **Tipo**: `VARCHAR` (nullable)
- **Migração**: [alembic/versions/20260107_2137-b8792eec857b_adiciona_campo_banco_em_transacao.py](alembic/versions/20260107_2137-b8792eec857b_adiciona_campo_banco_em_transacao.py)
- **Entidade**: [app/domain/entities/transacao.py](app/domain/entities/transacao.py) - `banco: Optional[str]`
- **Model**: [app/infrastructure/database/models/transacao_model.py](app/infrastructure/database/models/transacao_model.py)

## Fluxo de Importação

```
1. Cliente → POST /importacao/extrato-bruto
2. Router valida arquivo e banco_id
3. ImportarExtratoBrutoUseCase:
   a. Obtém parser via ExtratoParserRegistry
   b. Parser converte arquivo → DataFrame normalizado
   c. ImportacaoService processa cada linha:
      - Cria Transacao com origem='extrato' e banco=banco_id
      - Persiste no banco de dados
      - Aplica regras ativas
4. Retorna ResultadoImportacaoResponse
```

## Adicionando Novos Bancos

Para adicionar suporte a um novo banco:

1. **Criar Parser Concreto** em `app/infrastructure/parsers/`

   ```python
   class NubankExtratoParser(IExtratoParser):
       @property
       def banco_id(self) -> str:
           return "nubank"

       @property
       def nome_banco(self) -> str:
           return "Nubank"

       @property
       def formatos_suportados(self) -> List[str]:
           return [".csv"]

       def parse(self, arquivo: bytes, nome_arquivo: str) -> pd.DataFrame:
           # Lógica específica do Nubank
           # Retornar DataFrame com colunas: data, descricao, valor, categoria
           ...
   ```

2. **Registrar no Registry** em `extrato_parser_registry.py`

   ```python
   def _inicializar_parsers():
       registry = obter_registry()
       registry.registrar(BTGExtratoParser())
       registry.registrar(NubankExtratoParser())  # ← Adicionar aqui
   ```

3. **Pronto!** O sistema automaticamente:
   - Lista o banco em `GET /bancos-suportados`
   - Aceita arquivos no formato especificado
   - Valida formato via `validar_formato()`

## Testes

### Unitários

- **Parser BTG** ([tests/unit/infrastructure/test_btg_parser.py](tests/unit/infrastructure/test_btg_parser.py))
  - 8 testes cobrindo:
    - Propriedades (banco_id, nome, formatos)
    - Validação de formatos
    - Parsing de arquivo válido
    - Remoção de "Saldo Diário"
    - Tratamento de arquivo vazio/corrompido

### Integração

- **Endpoint Extrato Bruto** ([tests/integration/test_importacao_extrato_bruto.py](tests/integration/test_importacao_extrato_bruto.py))
  - 6 testes cobrindo:
    - Listagem de bancos suportados
    - Importação BTG com sucesso
    - Validação de banco inexistente
    - Validação de formato inválido
    - Atribuição de origem/banco
    - Arquivo vazio

**Coverage**: 100% das novas funcionalidades

## Exemplos de Uso

### Via API

```bash
# Listar bancos disponíveis
curl http://localhost:8000/importacao/bancos-suportados

# Importar extrato BTG
curl -X POST "http://localhost:8000/importacao/extrato-bruto?banco_id=btg" \
  -F "arquivo=@extrato_btg_dezembro.xls"

# Resposta esperada:
{
  "total_importado": 45,
  "transacoes_ids": [123, 124, 125, ...],
  "mensagem": "45 transações importadas com sucesso"
}
```

### Via Frontend (futuro)

```typescript
const arquivo = document.getElementById("fileInput").files[0];
const formData = new FormData();
formData.append("arquivo", arquivo);

const response = await fetch(`/importacao/extrato-bruto?banco_id=btg`, {
  method: "POST",
  body: formData,
});

const resultado = await response.json();
console.log(`${resultado.total_importado} transações importadas`);
```

## Benefícios da Arquitetura

1. **SOLID Compliance**:

   - **SRP**: Cada parser tem uma responsabilidade única
   - **OCP**: Adicionar bancos não modifica código existente
   - **LSP**: Todos os parsers implementam mesma interface
   - **ISP**: Interface `IExtratoParser` minimalista
   - **DIP**: Use case depende de abstração, não implementação

2. **Extensibilidade**:

   - Adicionar novo banco: apenas criar parser e registrar
   - Não requer alterações em use cases ou endpoints
   - Parsers testáveis isoladamente

3. **Manutenibilidade**:

   - Lógica de parsing isolada por banco
   - Mudanças em formato de um banco não afetam outros
   - Fácil depuração e troubleshooting

4. **Testabilidade**:
   - Parsers mockáveis via interface
   - Testes unitários para cada parser
   - Testes de integração end-to-end

## Próximos Passos

- [ ] Adicionar parser para Nubank (.csv)
- [ ] Adicionar parser para Inter (.xls/.xlsx)
- [ ] Adicionar parser para C6 Bank (.csv)
- [ ] Implementar validação de duplicatas por hash
- [ ] Adicionar logging detalhado de parsing
- [ ] Criar documentação de formatos esperados por banco
