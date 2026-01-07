# 🔄 Guia de Migração para Monorepo

## ✅ O que foi feito

1. ✅ Criada pasta `financas/` como monorepo
2. ✅ Copiado `financas-api` → `financas/backend`
3. ✅ Copiado `financas-front` → `financas/frontend`
4. ✅ Criado `.vscode/tasks.json` com tasks unificadas
5. ✅ Criado `.vscode/settings.json` com configurações VS Code
6. ✅ Criado `.vscode/extensions.json` com extensões recomendadas
7. ✅ Criado `scripts/start.sh` para startup automático
8. ✅ Criado `scripts/stop.sh` para parar serviços
9. ✅ Criado `README.md` com documentação completa
10. ✅ Criado `COMANDOS.md` com referência rápida
11. ✅ Criado `.gitignore` para monorepo

## 📁 Estrutura Atual

```
Documents/
├── financas-api/          ← Versão ANTIGA (manter por enquanto)
├── financas-front/        ← Versão ANTIGA (manter por enquanto)
└── financas/              ← NOVO MONOREPO 🎉
    ├── backend/           ← Cópia de financas-api
    ├── frontend/          ← Cópia de financas-front
    ├── scripts/
    │   ├── start.sh
    │   └── stop.sh
    ├── .vscode/
    │   ├── tasks.json
    │   ├── settings.json
    │   └── extensions.json
    ├── README.md
    ├── COMANDOS.md
    └── .gitignore
```

## 🚀 Como Começar a Usar o Monorepo

### Passo 1: Abrir no VS Code

```bash
cd ~/Documents/financas
code .
```

### Passo 2: Testar Startup via Task

1. Pressione `Ctrl+Shift+P`
2. Digite: `Tasks: Run Task`
3. Selecione: `🚀 STARTUP COMPLETO`
4. Aguarde os serviços iniciarem

### Passo 3: Verificar se está funcionando

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs

### Passo 4: Testar Startup via Script

```bash
cd ~/Documents/financas
./scripts/start.sh
```

Para parar:
```bash
./scripts/stop.sh
```

## 🔀 Próximos Passos (depois de validar)

### 1. Inicializar Git no Monorepo

```bash
cd ~/Documents/financas
git init
git add .
git commit -m "chore: inicializa monorepo finanças"
```

### 2. Criar repositório remoto único

Opção A - Criar novo repo:
```bash
# No GitHub/GitLab, criar repo "financas"
git remote add origin git@github.com:vitorcapdeville/financas.git
git push -u origin main
```

Opção B - Migrar repos existentes (CUIDADO - avançado):
- Mesclar históricos dos dois repos em um
- Requer estratégia de git subtree ou git filter-branch

### 3. Após validar tudo funciona, remover versões antigas

```bash
# APENAS depois de ter certeza que tudo funciona!
rm -rf ~/Documents/financas-api
rm -rf ~/Documents/financas-front
```

## ⚠️ Checklist de Validação

Antes de deletar as versões antigas, teste:

- [ ] Docker PostgreSQL inicia
- [ ] Backend inicia sem erros
- [ ] Frontend inicia sem erros
- [ ] Frontend consegue chamar API
- [ ] Consegue criar/listar transações
- [ ] Consegue importar dados
- [ ] Testes do backend passam
- [ ] Testes do frontend passam
- [ ] Migrações do Alembic funcionam

## 🧪 Comandos de Teste

```bash
cd ~/Documents/financas

# Testar Backend
cd backend
uv run pytest -v
cd ..

# Testar Frontend
cd frontend
npm run test:ci
cd ..

# Testar Migrações
cd backend
uv run alembic upgrade head
uv run alembic current
cd ..
```

## 📝 Diferenças para as Versões Antigas

### Tasks VS Code

**ANTES (versões antigas):**
- Backend tinha seu próprio `.vscode/tasks.json`
- Frontend tinha seu próprio `.vscode/tasks.json`
- Docker configurado na pasta pai

**AGORA (monorepo):**
- Tudo em um único `.vscode/tasks.json` na raiz
- Tasks usam `cwd` para executar em cada pasta
- Task `🚀 STARTUP COMPLETO` inicia tudo sequencialmente

### Caminhos

**ANTES:**
```bash
cd ~/Documents/financas-api
cd ~/Documents/financas-front
```

**AGORA:**
```bash
cd ~/Documents/financas
cd backend  # ou frontend
```

### Git

**ANTES:**
- Dois repositórios separados
- `financas-api` e `financas-front`

**AGORA:**
- Um repositório único
- Backend e frontend no mesmo repo

## 🎯 Benefícios do Monorepo

1. ✅ **Tasks centralizadas** - Uma interface para gerenciar tudo
2. ✅ **Startup simplificado** - Um comando inicia tudo
3. ✅ **Configuração unificada** - Settings e extensões compartilhadas
4. ✅ **Git simplificado** - Um repo, um histórico
5. ✅ **Versionamento sincronizado** - Backend e frontend sempre compatíveis
6. ✅ **CI/CD simplificado** - Pipeline único
7. ✅ **Documentação centralizada** - README e COMANDOS.md na raiz

## 🔧 Configurações Aplicadas

### VS Code Settings
- Python interpreter aponta para `backend/.venv`
- Format on save ativado
- ESLint auto-fix ativado
- Pastas desnecessárias excluídas do search

### VS Code Tasks
- **🐘 Docker: Iniciar PostgreSQL**
- **🚀 Backend: Iniciar FastAPI** (cwd: backend)
- **🎨 Frontend: Iniciar Next.js** (cwd: frontend)
- **📦 Backend: Aplicar migrações**
- **✅ Backend: Rodar testes**
- **🧪 Frontend: Rodar testes**
- **🚀 STARTUP COMPLETO** (sequencial)

### Scripts Shell
- `start.sh` - Inicia tudo automaticamente
- `stop.sh` - Para todos os serviços

## 🆘 Problemas Comuns

### "Tasks não aparecem"

```bash
# Reload VS Code
Ctrl+Shift+P → Developer: Reload Window
```

### "Backend não encontra .venv"

```bash
cd ~/Documents/financas/backend
uv sync
```

### "Frontend não encontra node_modules"

```bash
cd ~/Documents/financas/frontend
npm install
```

### "Erro ao importar módulos Python"

Verifique se o Python interpreter está correto:
1. `Ctrl+Shift+P`
2. `Python: Select Interpreter`
3. Selecione: `backend/.venv/bin/python`

---

**Qualquer dúvida, consulte:**
- `README.md` - Documentação completa
- `COMANDOS.md` - Referência rápida de comandos
