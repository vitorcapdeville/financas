.PHONY: help start stop restart clean install test lint format docker-start backend-start frontend-start

# Cores para output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m

help: ## Mostra esta ajuda
	@echo "$(BLUE)🏦 Comandos disponíveis para o Monorepo Finanças:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""


# ================================
# 🐳 DOCKER
# ================================

docker-start: ## Inicia apenas o Docker PostgreSQL
	@echo "$(BLUE)🐘 Iniciando PostgreSQL...$(NC)"
	@docker container start -a financas_postgres
	@echo "$(GREEN)✅ PostgreSQL iniciado$(NC)"

# ================================
# 🔵 BACKEND
# ================================

backend-start: ## Inicia apenas o Backend
	@echo "$(BLUE)🚀 Iniciando Backend...$(NC)"
	@cd backend && uv run uvicorn app.main:app --reload

backend-test: ## Roda testes do Backend
	@echo "$(BLUE)🧪 Rodando testes do Backend...$(NC)"
	@cd backend && uv run pytest -v

backend-test-cov: ## Roda testes do Backend com coverage
	@echo "$(BLUE)📊 Rodando testes do Backend com coverage...$(NC)"
	@cd backend && uv run pytest --cov=app --cov-report=html

backend-migrate: ## Aplica migrações do Alembic
	@echo "$(BLUE)📦 Aplicando migrações...$(NC)"
	@cd backend && uv run alembic upgrade head
	@echo "$(GREEN)✅ Migrações aplicadas$(NC)"

backend-migrate-create: ## Cria nova migração (use: make backend-migrate-create MSG="sua mensagem")
	@echo "$(BLUE)📝 Criando migração...$(NC)"
	@cd backend && uv run alembic revision --autogenerate -m "$(MSG)"

backend-lint: ## Lint no Backend (Ruff)
	@echo "$(BLUE)🔍 Linting Backend...$(NC)"
	@cd backend && uv run ruff check .

backend-format: ## Formata código do Backend (Ruff)
	@echo "$(BLUE)✨ Formatando Backend...$(NC)"
	@cd backend && uv run ruff format .

backend-install: ## Instala dependências do Backend
	@echo "$(BLUE)📦 Instalando dependências do Backend...$(NC)"
	@cd backend && uv sync

# ================================
# 🎨 FRONTEND
# ================================

frontend-start: ## Inicia apenas o Frontend
	@echo "$(BLUE)🎨 Iniciando Frontend...$(NC)"
	@cd frontend && npm run dev

frontend-test: ## Roda testes do Frontend
	@echo "$(BLUE)🧪 Rodando testes do Frontend...$(NC)"
	@cd frontend && npm run test:ci

frontend-test-cov: ## Roda testes do Frontend com coverage
	@echo "$(BLUE)📊 Rodando testes do Frontend com coverage...$(NC)"
	@cd frontend && npm run test:coverage

frontend-build: ## Build de produção do Frontend
	@echo "$(BLUE)📦 Fazendo build do Frontend...$(NC)"
	@cd frontend && npm run build

frontend-lint: ## Lint no Frontend (ESLint)
	@echo "$(BLUE)🔍 Linting Frontend...$(NC)"
	@cd frontend && npm run lint

frontend-install: ## Instala dependências do Frontend
	@echo "$(BLUE)📦 Instalando dependências do Frontend...$(NC)"
	@cd frontend && npm install

# ================================
# 🛠️ GERAL
# ================================

install: backend-install frontend-install ## Instala todas as dependências (Backend + Frontend)
	@echo "$(GREEN)✅ Todas as dependências instaladas$(NC)"

test: backend-test frontend-test ## Roda todos os testes
	@echo "$(GREEN)✅ Todos os testes executados$(NC)"

lint: backend-lint frontend-lint ## Lint em tudo
	@echo "$(GREEN)✅ Lint concluído$(NC)"

format: backend-format ## Formata todo o código
	@echo "$(GREEN)✅ Formatação concluída$(NC)"

clean: ## Remove arquivos temporários e caches
	@echo "$(RED)🧹 Limpando caches e arquivos temporários...$(NC)"
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "coverage" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type f -name "*.log" -delete 2>/dev/null || true
	@echo "$(GREEN)✅ Limpeza concluída$(NC)"

reset: clean ## Reset completo (remove .venv e node_modules)
	@echo "$(RED)⚠️  Reset completo...$(NC)"
	@rm -rf backend/.venv
	@rm -rf frontend/node_modules
	@echo "$(YELLOW)Agora execute: make install$(NC)"

# ================================
# 📊 STATUS
# ================================

status: ## Mostra status dos serviços
	@echo "$(BLUE)📊 Status dos Serviços:$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker PostgreSQL:$(NC)"
	@docker ps --filter "name=financas_postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "  $(RED)Não está rodando$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend (porta 8000):$(NC)"
	@lsof -i :8000 2>/dev/null | grep LISTEN || echo "  $(RED)Não está rodando$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend (porta 3000):$(NC)"
	@lsof -i :3000 2>/dev/null | grep LISTEN || echo "  $(RED)Não está rodando$(NC)"
	@echo ""

# Default target
.DEFAULT_GOAL := help
