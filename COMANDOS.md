# Comandos Úteis - Monorepo Finanças

## 🚀 Startup Rápido

### Via Script
```bash
cd ~/Documents/financas
./scripts/start.sh    # Inicia tudo
./scripts/stop.sh     # Para tudo
```

### Via VS Code Task
1. `Ctrl+Shift+P`
2. `Tasks: Run Task`
3. `🚀 STARTUP COMPLETO`

### Manual
```bash
# Terminal 1 - Docker
docker container start financas_postgres

# Terminal 2 - Backend
cd ~/Documents/financas/backend
uv run uvicorn app.main:app --reload

# Terminal 3 - Frontend
cd ~/Documents/financas/frontend
npm run dev
```

## 🛠️ Comandos Backend

```bash
cd backend

# Desenvolvimento
uv run uvicorn app.main:app --reload    # Servidor dev
uv run uvicorn app.main:app             # Servidor normal

# Migrações
uv run alembic upgrade head                           # Aplicar
uv run alembic revision --autogenerate -m "mudança"   # Criar
uv run alembic downgrade -1                           # Reverter
uv run alembic history                                # Histórico
uv run alembic current                                # Versão atual

# Testes
uv run pytest                           # Todos
uv run pytest -v                        # Verbose
uv run pytest --cov=app                 # Com coverage
uv run pytest tests/test_transacoes.py  # Arquivo específico
uv run pytest -k "test_criar"           # Por nome

# Dependências
uv add nome-pacote         # Adicionar
uv sync                    # Sincronizar
uv pip list                # Listar

# Linting/Format
uv run ruff check .        # Lint
uv run ruff format .       # Format
```

## 🎨 Comandos Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev         # Servidor dev (porta 3000)
npm run build       # Build produção
npm run start       # Servidor produção
npm run lint        # ESLint

# Testes
npm run test              # Modo watch
npm run test:ci           # Single run
npm run test:coverage     # Com coverage

# Dependências
npm install               # Instalar todas
npm install pacote        # Adicionar
npm update                # Atualizar
npm outdated              # Ver desatualizadas
```

## 🐳 Comandos Docker

```bash
# PostgreSQL
docker container start financas_postgres     # Iniciar
docker container stop financas_postgres      # Parar
docker container restart financas_postgres   # Reiniciar
docker logs financas_postgres                # Ver logs
docker exec -it financas_postgres psql -U financas_user -d financas_db  # Conectar

# Verificar se está rodando
docker ps | grep financas_postgres

# Verificar se está pronto
docker exec financas_postgres pg_isready -U financas_user
```

## 🔍 Debug

```bash
# Ver processos nas portas
lsof -i :8000    # Backend
lsof -i :3000    # Frontend
lsof -i :5432    # PostgreSQL

# Matar processos
kill -9 $(lsof -ti:8000)  # Backend
kill -9 $(lsof -ti:3000)  # Frontend

# Ver logs
tail -f backend.log
tail -f frontend.log
```

## 📊 Git

```bash
# Status dos dois projetos
git -C backend status
git -C frontend status

# Commit (Conventional Commits)
git add .
git commit -m "feat: nova funcionalidade"
git commit -m "fix: correção de bug"
git commit -m "docs: atualiza documentação"
git commit -m "test: adiciona testes"
git commit -m "refactor: refatora código"

# Push
git push origin main
```

## 🔄 Reset Completo

```bash
cd ~/Documents/financas

# Backend
cd backend
rm -rf .venv __pycache__ .pytest_cache htmlcov
uv sync
uv run alembic upgrade head
cd ..

# Frontend
cd frontend
rm -rf node_modules .next coverage
npm install
cd ..

# Reiniciar serviços
./scripts/stop.sh
./scripts/start.sh
```

## 🧪 Testes Rápidos

```bash
# Backend - criar transação
curl -X POST http://localhost:8000/transacoes/ \
  -H "Content-Type: application/json" \
  -d '{
    "data": "2026-01-07",
    "descricao": "Teste",
    "valor": 100.50,
    "tipo": "saida",
    "origem": "manual"
  }'

# Backend - listar transações
curl http://localhost:8000/transacoes/

# Frontend - verificar se está rodando
curl http://localhost:3000

# Docs interativa
open http://localhost:8000/docs
```

## 📝 Atalhos VS Code

| Ação | Atalho |
|------|--------|
| Abrir Terminal | `Ctrl + ` ` |
| Nova aba Terminal | `Ctrl + Shift + ` ` |
| Tasks | `Ctrl + Shift + P` → `Tasks: Run Task` |
| Buscar arquivos | `Ctrl + P` |
| Buscar em arquivos | `Ctrl + Shift + F` |
| Command Palette | `Ctrl + Shift + P` |
