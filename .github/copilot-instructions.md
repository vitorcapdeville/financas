# 🏦 Finanças - AI Coding Agent Instructions

Aplicação monorepo de gerenciamento de finanças pessoais com **FastAPI (backend)** e **Next.js (frontend)**.

## Estrutura do Monorepo

```
financas/
├── backend/               # API FastAPI + PostgreSQL (Clean Architecture)
│   ├── app/               # Código-fonte principal
│   │   ├── domain/        # Entidades e interfaces (núcleo)
│   │   ├── application/   # Use Cases e lógica de negócio
│   │   ├── infrastructure/# Implementações (DB, repos)
│   │   └── interfaces/    # API REST (routers, schemas)
│   ├── alembic/           # Migrações de banco de dados
│   └── tests/             # Testes (pytest)
├── frontend/              # Next.js App Router + TypeScript
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # Componentes React
│   │   ├── services/      # API client (Axios)
│   │   └── types/         # Tipos TypeScript
│   └── __tests__/         # Testes (Jest)
└── .vscode/tasks.json     # Tasks de desenvolvimento
```

**Gerenciamento de Pacotes:**

- Backend: `uv` (NÃO use pip ou requirements.txt)
- Frontend: `npm`

## Instruções Detalhadas por Camada

Para detalhes de arquitetura e padrões específicos:

- **Backend**: Consulte [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md)
- **Frontend**: Consulte [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)

## Banco de Dados

### Setup PostgreSQL

```bash
# Container Docker (recomendado)
docker container start financas_postgres

# Credenciais (docker-compose.yml)
POSTGRES_DB=financas_db
POSTGRES_USER=financas_user
POSTGRES_PASSWORD=financas_pass
```

**Configuração Backend:** Crie `backend/.env`:

```env
DATABASE_URL=postgresql://financas_user:financas_pass@localhost:5432/financas_db
```

## Desenvolvimento

### Startup Rápido (VS Code Tasks - RECOMENDADO)

Pressione `Ctrl+Shift+P` → `Tasks: Run Task` → `🚀 STARTUP COMPLETO`

Isso inicia sequencialmente:

1. **Docker PostgreSQL** (`financas_postgres` container)
2. **Backend FastAPI** (http://localhost:8000)
3. **Frontend Next.js** (http://localhost:3000)

**Docs Interativa:** http://localhost:8000/docs (Swagger UI para testar endpoints)

### Comandos Manuais

```bash
# Backend
cd backend
uv sync                              # Instala dependências
uv run uvicorn app.main:app --reload # Dev server
uv run pytest -v                     # Testes (threshold 80%)
uv run alembic upgrade head          # Aplica migrações

# Frontend
cd frontend
npm install                          # Instala dependências
npm run dev                          # Dev server
npm run test                         # Testes (Jest)

# Docker
docker container start financas_postgres  # PostgreSQL
```

### Makefile (Alternativa)

```bash
make help                # Lista todos os comandos disponíveis
make docker-start        # Inicia PostgreSQL
make backend-start       # Inicia FastAPI
make frontend-start      # Inicia Next.js
make test               # Roda TODOS os testes (backend + frontend)
make backend-migrate    # Aplica migrações
```

## Commits e Versionamento

### Padrão de Commits (Conventional Commits)

```bash
# Formato: <tipo>(<escopo>): <descrição curta>

# Tipos principais:
feat:      Nova funcionalidade
fix:       Correção de bug
refactor:  Refatoração sem mudar funcionalidade
test:      Adicionar/modificar testes
docs:      Documentação
style:     Formatação, missing semi colons, etc
chore:     Tarefas de manutenção, deps, config

# Exemplos:
git commit -m "feat(backend): adiciona campo notas em transações"
git commit -m "fix(frontend): corrige formatação de moeda em cards"
git commit -m "refactor(backend): extrai lógica de validação para use case"
git commit -m "test(frontend): adiciona testes para TransacaoCard"
git commit -m "chore(backend): atualiza alembic para v1.13"
```

**Escopos comuns:** `backend`, `frontend`, `db`, `docs`, `ci`

### Workflow de Desenvolvimento

1. **Antes de começar:**

   - Pull da branch principal: `git pull origin main`
   - Aplique migrações: `cd backend && uv run alembic upgrade head`

2. **Durante desenvolvimento:**

   - Rode testes frequentemente: `make test` ou `uv run pytest` / `npm run test`
   - Verifique coverage: `uv run pytest --cov=app` (threshold: 80%)

3. **Antes de commitar:**

   - Rode todos os testes: `make test`
   - Lint/format: `cd backend && uv run ruff format .` / `cd frontend && npm run lint`
   - Verifique se o backend/frontend iniciam sem erros

4. **Ao criar migração:**
   - Sempre rode `uv run alembic upgrade head` antes de criar nova migração
   - Revise o script gerado antes de commitar
   - Teste a migração em DB limpo se possível

## Debugging

### Backend

- **Logs:** Uvicorn mostra requests, status codes e erros no terminal
- **Debug API:** Use http://localhost:8000/docs (Swagger UI interativo)
- **DB State:** `uv run alembic current` mostra migração atual
- **Inspecionar DB:** Use cliente PostgreSQL (DBeaver, pgAdmin, psql)

### Frontend

- **Network:** DevTools → Network para ver requests/responses da API
- **React DevTools:** Inspecionar estado e props de componentes
- **Console:** Erros de renderização e logs aparecem no browser console
- **Hot Reload:** Salvamento automático recarrega (backend e frontend)

## Testes

**Coverage Mínimo:** 80% (configurado em `pytest.ini` e `jest.config.js`)

```bash
# Backend - rodar todos os testes
cd backend
uv run pytest -v

# Backend - com coverage HTML
uv run pytest --cov=app --cov-report=html
# Abre: backend/htmlcov/index.html

# Frontend - modo watch
cd frontend
npm run test

# Frontend - coverage
npm run test:coverage
# Abre: frontend/coverage/lcov-report/index.html
```

## Arquivos-Chave

- [.vscode/tasks.json](.vscode/tasks.json) - Tasks de desenvolvimento
- [docker-compose.yml](docker-compose.yml) - Configuração PostgreSQL
- [Makefile](Makefile) - Comandos helper do projeto
- `backend/alembic/env.py` - **SEMPRE** importe novos models aqui
- `backend/pyproject.toml` - Dependências backend (gerenciado por `uv`)
- `frontend/package.json` - Dependências frontend
