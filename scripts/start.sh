#!/bin/bash

# 🚀 Script de Startup do Monorepo Finanças
# Inicia Docker, Backend e Frontend automaticamente

set -e

echo "🏦 Iniciando ambiente Finanças..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Iniciar Docker PostgreSQL
echo -e "${BLUE}🐘 Iniciando PostgreSQL...${NC}"
docker container start financas_postgres
echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"
echo ""

# 2. Aguardar PostgreSQL estar pronto
echo -e "${YELLOW}⏳ Aguardando PostgreSQL estar pronto...${NC}"
sleep 3
docker exec financas_postgres pg_isready -U financas_user > /dev/null 2>&1 && echo -e "${GREEN}✅ PostgreSQL pronto${NC}" || echo -e "${YELLOW}⚠️  PostgreSQL pode não estar pronto${NC}"
echo ""

# 3. Iniciar Backend em background
echo -e "${BLUE}🚀 Iniciando Backend (porta 8000)...${NC}"
cd backend
uv run uvicorn app.main:app --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
cd ..
echo ""

# 4. Aguardar backend iniciar
echo -e "${YELLOW}⏳ Aguardando Backend iniciar...${NC}"
sleep 5
echo -e "${GREEN}✅ Backend deve estar rodando${NC}"
echo ""

# 5. Iniciar Frontend em background
echo -e "${BLUE}🎨 Iniciando Frontend (porta 3000)...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
cd ..
echo ""

# Resumo
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Ambiente iniciado com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo -e "${BLUE}📋 PIDs:${NC}"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo -e "${BLUE}📄 Logs:${NC}"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Para parar os serviços:${NC}"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   ou use: ./scripts/stop.sh"
echo ""
