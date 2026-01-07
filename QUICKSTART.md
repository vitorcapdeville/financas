# ⚡ Quick Start - Guia Rápido

## 🎯 Uso Mais Simples (Recomendado)

### Opção 1: Script Automático
```bash
~/Documents/financas/dev.sh
```
Isso irá:
1. ✅ Abrir VS Code
2. ✅ Iniciar Docker PostgreSQL
3. ✅ Iniciar Backend (porta 8000)
4. ✅ Iniciar Frontend (porta 3000)

### Opção 2: Makefile
```bash
cd ~/Documents/financas
make start
```

### Opção 3: VS Code Task
1. Abra: `code ~/Documents/financas`
2. Pressione: `Ctrl+Shift+P`
3. Digite: `Tasks: Run Task`
4. Selecione: `🚀 STARTUP COMPLETO`

## 🛑 Para Parar Tudo

```bash
cd ~/Documents/financas
make stop
# ou
./scripts/stop.sh
```

## 📊 Ver Status

```bash
cd ~/Documents/financas
make status
```

## 🔧 Comandos Frequentes

```bash
# Testes
make test                    # Tudo
make backend-test            # Só backend
make frontend-test           # Só frontend

# Migrações
make backend-migrate         # Aplicar
make backend-migrate-create MSG="adiciona campo X"  # Criar

# Lint/Format
make lint                    # Lint tudo
make format                  # Formata tudo

# Instalação
make install                 # Instala tudo
make backend-install         # Só backend
make frontend-install        # Só frontend

# Limpeza
make clean                   # Remove caches
make reset                   # Reset completo (⚠️ remove .venv e node_modules)
```

## 🌐 URLs Importantes

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **API Redoc:** http://localhost:8000/redoc

## 📁 Estrutura

```
financas/
├── backend/              # FastAPI + PostgreSQL
├── frontend/             # Next.js + TypeScript
├── scripts/              # Scripts de automação
├── .vscode/              # Configurações VS Code
├── Makefile              # Comandos make
├── dev.sh                # Quick start
└── README.md             # Documentação completa
```

## 🆘 Problemas Comuns

### Porta já em uso
```bash
make stop
# ou
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>
```

### PostgreSQL não inicia
```bash
docker container start financas_postgres
docker logs financas_postgres
```

### Dependências desatualizadas
```bash
make install
```

## 📚 Mais Informações

- **Documentação Completa:** `README.md`
- **Comandos Detalhados:** `COMANDOS.md`
- **Guia de Migração:** `MIGRACAO.md`

---

**TL;DR:** Execute `~/Documents/financas/dev.sh` e tudo será iniciado automaticamente! 🚀
