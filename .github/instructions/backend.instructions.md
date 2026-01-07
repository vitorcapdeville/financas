---
applyTo: "backend/**"
description: "Instruções de arquitetura Clean Architecture e SOLID para o backend FastAPI"
name: "Backend - Finanças Pessoais"
---

# Instruções para o GitHub Copilot - Backend de Finanças Pessoais

## Contexto do Projeto

Este é o backend de uma aplicação de gerenciamento de finanças pessoais, construído com:

- **FastAPI**: Framework web moderno e rápido
- **SQLModel**: ORM baseado em Pydantic e SQLAlchemy
- **PostgreSQL**: Banco de dados relacional
- **Alembic**: Gerenciamento de migrações de banco de dados
- **UV**: Gerenciador de pacotes e ambientes Python moderno
- **Pytest**: Framework de testes com cobertura mínima de 80%

## Arquitetura Clean Architecture + SOLID

O projeto segue **Clean Architecture** com separação clara de responsabilidades:

```
app/
├── domain/                 # Camada de Domínio (Núcleo do negócio)
│   ├── entities/           # Entidades de negócio (Transacao, Tag, Regra, Configuracao)
│   ├── repositories/       # Interfaces abstratas de repositórios
│   └── value_objects/      # Objetos de valor (TipoTransacao, Categoria)
├── application/            # Camada de Aplicação (Casos de uso)
│   ├── use_cases/          # Lógica de negócio (Criar, Listar, Atualizar, Deletar)
│   ├── dto/                # Data Transfer Objects (Input/Output)
│   └── exceptions/         # Exceções de negócio customizadas
├── infrastructure/         # Camada de Infraestrutura (Implementações)
│   ├── database/           # Modelos SQLModel, Sessões, Configuração DB
│   └── config.py           # Configurações da aplicação (Pydantic Settings)
└── interfaces/             # Camada de Interface (API REST)
    └── api/
        ├── routers/        # Endpoints FastAPI (transacoes, tags, regras, etc.)
        ├── schemas/        # Schemas Pydantic para request/response
        └── dependencies/   # Dependency Injection (get_db, repositórios)
```

### Princípios SOLID Aplicados

1. **Single Responsibility**: Cada use case faz apenas uma coisa
2. **Open/Closed**: Extensível via interfaces, fechado para modificação
3. **Liskov Substitution**: Repositórios podem ser substituídos (útil para testes)
4. **Interface Segregation**: Interfaces específicas e coesas
5. **Dependency Inversion**: Use cases dependem de interfaces, não implementações concretas

## Diretrizes de Código

### 1. Estrutura de Use Cases

Todos os use cases seguem este padrão:

```python
"""
Use Case: [Nome do Caso de Uso]
Descrição: [O que faz]
"""
from app.domain.repositories.[nome]_repository import [Nome]Repository
from app.application.dto.[entidade]_dto import [Entidade]Output
from app.application.exceptions import [ExcecaoCustomizada]

def [nome_use_case](
    [parametros],
    repository: [Nome]Repository  # Dependency Injection
) -> [TipoRetorno]:
    """
    [Descrição detalhada]

    Args:
        [descrição dos argumentos]
        repository: Repositório injetado via DI

    Returns:
        [descrição do retorno]

    Raises:
        [ExcecaoCustomizada]: [quando ocorre]
    """
    # 1. Validações de negócio
    # 2. Lógica do caso de uso
    # 3. Chamada ao repositório
    # 4. Tratamento de resposta
    # 5. Retorno do resultado
```

### 2. Dependency Injection

**SEMPRE** use injeção de dependência para repositórios nos routers:

```python
from fastapi import APIRouter, Depends
from app.interfaces.api.dependencies import get_transacao_repository
from app.domain.repositories.transacao_repository import TransacaoRepository
from app.application.use_cases import criar_transacao

router = APIRouter(prefix="/transacoes", tags=["transacoes"])

@router.post("/", response_model=TransacaoOutput)
def endpoint_criar_transacao(
    data: TransacaoCreate,
    repository: TransacaoRepository = Depends(get_transacao_repository)
):
    return criar_transacao.execute(data=data, repository=repository)
```

### 3. Tratamento de Erros

Use exceções customizadas da camada de aplicação:

```python
from app.application.exceptions import (
    RecursoNaoEncontrado,
    RegraDeNegocioViolada,
    DadosInvalidos
)

# No use case
if not transacao:
    raise RecursoNaoEncontrado(f"Transação {id} não encontrada")

# No router (FastAPI trata automaticamente)
@router.get("/{id}")
def obter_transacao(id: int, repository: TransacaoRepository = Depends(...)):
    # Se não encontrar, lança RecursoNaoEncontrado (404)
    return obter_transacao_use_case.execute(id=id, repository=repository)
```

### 4. Modelos e Schemas

- **Domain Entities** (`domain/entities/`): Lógica de negócio pura, sem dependências de DB
- **Infrastructure Models** (`infrastructure/database/models/`): SQLModel para persistência
- **DTOs** (`application/dto/`): Input/Output para use cases
- **API Schemas** (`interfaces/api/schemas/`): Request/Response da API

**Exemplo de separação:**

```python
# domain/entities/transacao.py
@dataclass
class Transacao:
    id: int | None
    descricao: str
    valor: Decimal
    # ... lógica de negócio

# infrastructure/database/models/transacao_model.py
class TransacaoModel(SQLModel, table=True):
    __tablename__ = "transacoes"
    id: int | None = Field(default=None, primary_key=True)
    descricao: str
    # ... mapeamento DB

# application/dto/transacao_dto.py
class TransacaoCreate(BaseModel):
    descricao: str
    valor: Decimal
    # ... validações

class TransacaoOutput(BaseModel):
    id: int
    descricao: str
    # ... campos de saída
```

### 5. Repositórios

**Interface (domain/repositories/):**

```python
from abc import ABC, abstractmethod
from typing import Protocol

class TransacaoRepository(Protocol):
    """Interface do repositório de transações"""

    @abstractmethod
    def criar(self, transacao: Transacao) -> Transacao:
        ...

    @abstractmethod
    def buscar_por_id(self, id: int) -> Transacao | None:
        ...
```

**Implementação (infrastructure/database/repositories/):**

```python
from sqlmodel import Session, select
from app.domain.repositories.transacao_repository import TransacaoRepository
from app.infrastructure.database.models.transacao_model import TransacaoModel

class TransacaoRepositoryImpl(TransacaoRepository):
    def __init__(self, session: Session):
        self.session = session

    def criar(self, transacao: Transacao) -> Transacao:
        db_transacao = TransacaoModel.model_validate(transacao)
        self.session.add(db_transacao)
        self.session.commit()
        self.session.refresh(db_transacao)
        return Transacao.from_orm(db_transacao)
```

### 6. Testes

**Cobertura Mínima:** 80% overall, 90% para routers

```python
# tests/application/use_cases/test_criar_transacao.py
import pytest
from app.application.use_cases import criar_transacao
from app.application.exceptions import DadosInvalidos

def test_criar_transacao_com_dados_validos(mock_repository):
    # Arrange
    data = TransacaoCreate(descricao="Teste", valor=100.0)

    # Act
    result = criar_transacao.execute(data=data, repository=mock_repository)

    # Assert
    assert result.descricao == "Teste"
    mock_repository.criar.assert_called_once()

def test_criar_transacao_com_valor_negativo_invalido(mock_repository):
    # Arrange
    data = TransacaoCreate(descricao="Teste", valor=-100.0, tipo="ENTRADA")

    # Act & Assert
    with pytest.raises(DadosInvalidos):
        criar_transacao.execute(data=data, repository=mock_repository)
```

### 7. Migrações (Alembic)

**Sempre crie migrações para mudanças no schema:**

```bash
# Criar nova migração
uv run alembic revision --autogenerate -m "Descrição da mudança"

# Aplicar migrações
uv run alembic upgrade head

# Reverter última migração
uv run alembic downgrade -1
```

**IMPORTANTE:**

- Revise sempre as migrações auto-geradas
- Adicione índices para colunas filtradas com frequência
- Use `op.batch_alter_table()` para mudanças que podem travar a tabela

### 8. Gerenciamento de Dependências

**Use UV (NÃO use pip ou requirements.txt):**

```bash
# Adicionar nova dependência
uv add nome-do-pacote

# Adicionar dependência de dev
uv add --dev nome-do-pacote

# Sincronizar dependências
uv sync

# Rodar comando
uv run [comando]
```

### 9. Padrões de Código

- **Type hints** obrigatórios em todas as funções
- **Docstrings** em formato Google Style para use cases e funções públicas
- **Nomes descritivos**: `criar_transacao` > `create_tx`
- **Constantes** em UPPER_CASE
- **Enums** para valores fixos (TipoTransacao, Categoria)

### 10. API REST - Convenções

- **GET** `/recurso`: Listar (com filtros opcionais)
- **GET** `/recurso/{id}`: Obter um específico
- **POST** `/recurso`: Criar
- **PATCH** `/recurso/{id}`: Atualizar parcialmente
- **DELETE** `/recurso/{id}`: Deletar

**Response Status Codes:**

- 200: OK (GET, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (dados inválidos)
- 404: Not Found (recurso não existe)
- 422: Unprocessable Entity (validação Pydantic falhou)
- 500: Internal Server Error

### 11. Filtros e Queries

Use query parameters para filtros:

```python
@router.get("/", response_model=list[TransacaoOutput])
def listar_transacoes(
    data_inicio: date | None = None,
    data_fim: date | None = None,
    categoria: Categoria | None = None,
    repository: TransacaoRepository = Depends(get_transacao_repository)
):
    return listar_transacoes_use_case.execute(
        data_inicio=data_inicio,
        data_fim=data_fim,
        categoria=categoria,
        repository=repository
    )
```

### 12. Importação de Dados

Suportamos importação de:

- **Extratos bancários** (CSV)
- **Faturas de cartão** (Excel/XLSX)

**Regras:**

- Sempre validar formato antes de processar
- Usar Pandas para parsing
- Aplicar regras de categorização automática após importação
- Detectar duplicatas por (data, valor, descrição)

## Checklist para Novos Endpoints

- [ ] Use case criado em `application/use_cases/`
- [ ] DTOs definidos em `application/dto/`
- [ ] Router implementado em `interfaces/api/routers/`
- [ ] Schemas Pydantic em `interfaces/api/schemas/`
- [ ] Dependency injection configurada
- [ ] Testes unitários do use case (>= 90% cobertura)
- [ ] Testes de integração do endpoint
- [ ] Documentação atualizada (docstrings + README se necessário)
- [ ] Migração criada e aplicada (se houver mudança no DB)

## Ferramentas de Desenvolvimento

- **Linter/Formatter**: Usar Ruff
- **Type checker**: mypy (configurar no futuro)
- **Testes**: `uv run pytest -v`
- **Cobertura**: `uv run pytest --cov=app --cov-report=html`
- **Dev server**: `uv run uvicorn app.main:app --reload`
- **Docs interativas**: http://localhost:8000/docs

## Observações Importantes

1. **NUNCA** coloque lógica de negócio nos routers - use use cases
2. **SEMPRE** injete repositórios via dependency injection
3. **NÃO** acesse o banco diretamente nos use cases - use repositórios
4. **TESTE** tudo antes de commitar (mínimo 80% de cobertura)
5. **DOCUMENTE** mudanças significativas no README
6. **USE UV** para todas as operações com dependências
7. **MIGRE** o banco sempre que mudar o schema

## Exemplo Completo: Adicionar Nova Feature

**Tarefa:** Adicionar campo "notas" às transações

1. **Domínio** - Atualizar entidade:

```python
# domain/entities/transacao.py
@dataclass
class Transacao:
    # ... campos existentes
    notas: str | None = None
```

2. **Infraestrutura** - Atualizar modelo:

```python
# infrastructure/database/models/transacao_model.py
class TransacaoModel(SQLModel, table=True):
    # ... campos existentes
    notas: str | None = Field(default=None)
```

3. **Migração**:

```bash
uv run alembic revision --autogenerate -m "Adicionar campo notas em transacoes"
uv run alembic upgrade head
```

4. **DTOs** - Atualizar:

```python
# application/dto/transacao_dto.py
class TransacaoCreate(BaseModel):
    # ... campos existentes
    notas: str | None = None

class TransacaoOutput(BaseModel):
    # ... campos existentes
    notas: str | None
```

5. **Use Case** - Ajustar se necessário:

```python
# application/use_cases/criar_transacao.py
# (código já deve suportar o novo campo automaticamente)
```

6. **Testes** - Adicionar casos:

```python
def test_criar_transacao_com_notas(mock_repository):
    data = TransacaoCreate(descricao="Teste", valor=100.0, notas="Obs importante")
    result = criar_transacao.execute(data=data, repository=mock_repository)
    assert result.notas == "Obs importante"
```

7. **Rodar testes**:

```bash
uv run pytest -v
```

## Recursos Adicionais

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLModel Docs**: https://sqlmodel.tiangolo.com
- **Alembic Docs**: https://alembic.sqlalchemy.org
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
