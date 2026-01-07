# 🏦 Finanças - Monorepo

Aplicação completa de gerenciamento de finanças pessoais com backend FastAPI e frontend Next.js.

## 📁 Estrutura do Projeto

```
financas/
├── backend/           # API FastAPI + PostgreSQL
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   └── pyproject.toml
├── frontend/          # Next.js + TypeScript + Tailwind
│   ├── src/
│   ├── public/
│   └── package.json
└── .vscode/          # Configurações VS Code
    ├── tasks.json
    ├── settings.json
    └── extensions.json
```

## 🚀 Quick Start

### Pré-requisitos

- Docker (para PostgreSQL)
- Python 3.11+ com UV instalado
- Node.js 18+ com npm

### 1. Iniciar o Ambiente

**Opção A - Usar Task do VS Code (RECOMENDADO):**
1. Abra a pasta `financas` no VS Code: `code ~/Documents/financas`
2. Pressione `Ctrl+Shift+P`
3. Execute: `Tasks: Run Task` → `🚀 STARTUP COMPLETO`

**Opção B - Manual:**
```bash
# Terminal 1 - Docker
docker container start financas_postgres

# Terminal 2 - Backend
cd backend
uv run uvicorn app.main:app --reload

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### 2. Acessar

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Docs Interativa:** http://localhost:8000/docs

## 🛠️ Tasks Disponíveis (VS Code)

Pressione `Ctrl+Shift+P` → `Tasks: Run Task`:

### Startup
- **🚀 STARTUP COMPLETO** - Inicia tudo sequencialmente (Docker → Backend → Frontend)

### Docker
- **🐘 Docker: Iniciar PostgreSQL** - Inicia container do banco

### Backend
- **🚀 Backend: Iniciar FastAPI** - Servidor dev com hot reload
- **📦 Backend: Aplicar migrações** - Roda Alembic migrations
- **✅ Backend: Rodar testes** - Pytest com coverage

### Frontend
- **🎨 Frontend: Iniciar Next.js** - Servidor dev com hot reload
- **🧪 Frontend: Rodar testes** - Jest + React Testing Library

## 📦 Dependências

### Backend

```bash
cd backend
uv sync  # Instala dependências do pyproject.toml
```

Principais dependências:
- FastAPI
- SQLModel
- PostgreSQL (psycopg2-binary)
- Alembic
- Pandas

### Frontend

```bash
cd frontend
npm install
```

Principais dependências:
- Next.js 14
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Recharts

## 🗄️ Banco de Dados

### Configuração

Crie o arquivo `backend/.env`:
```env
DATABASE_URL=postgresql://financas_user:financas_pass@localhost:5432/financas_db
```

### Migrações

```bash
cd backend

# Aplicar migrações
uv run alembic upgrade head

# Criar nova migração
uv run alembic revision --autogenerate -m "descrição"

# Reverter migração
uv run alembic downgrade -1
```

## 🧪 Testes

### Backend

```bash
cd backend
uv run pytest -v              # Todos os testes
uv run pytest tests/test_transacoes.py  # Arquivo específico
uv run pytest --cov=app       # Com coverage
```

### Frontend

```bash
cd frontend
npm run test              # Modo watch
npm run test:ci           # Single run (CI)
npm run test:coverage     # Com coverage
```

## 📝 Padrões de Desenvolvimento

### Commits

Use **Conventional Commits**:
```bash
feat: adiciona endpoint de tags
fix: corrige cálculo de período
docs: atualiza README
test: adiciona testes para regras
```

### Backend

- Migrations via Alembic (nunca use `create_all()`)
- Server Actions para mutações
- Tipagem forte com SQLModel
- Testes com pytest

### Frontend

- Server Components por padrão
- Server Actions para mutações
- Estado na URL (searchParams)
- Client Components apenas quando necessário
- Tailwind CSS para estilos

## 🔧 Troubleshooting

### Porta em uso

```bash
# Backend (8000)
lsof -i :8000
kill -9 <PID>

# Frontend (3000)
lsof -i :3000
kill -9 <PID>
```

### PostgreSQL não inicia

```bash
docker ps -a  # Ver status
docker logs financas_postgres  # Ver logs
docker container start financas_postgres  # Tentar iniciar
```

### Reset completo

```bash
# Backend
cd backend
rm -rf .venv
uv sync
uv run alembic upgrade head

# Frontend
cd frontend
rm -rf node_modules .next
npm install
```

## 📚 Documentação

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Next.js Docs](https://nextjs.org/docs)
- [SQLModel Docs](https://sqlmodel.tiangolo.com)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feat/nova-funcionalidade`
2. Commit com Conventional Commits
3. Push: `git push origin feat/nova-funcionalidade`
4. Abra um Pull Request

---

**Última atualização:** Janeiro 2026
