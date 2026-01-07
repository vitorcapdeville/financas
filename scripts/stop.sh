#!/bin/bash

# 🛑 Script para parar todos os serviços do Monorepo Finanças

set -e

echo "🛑 Parando serviços Finanças..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parar processos nas portas 8000 e 3000
echo -e "${YELLOW}🔍 Procurando processos...${NC}"

# Backend (porta 8000)
BACKEND_PID=$(lsof -ti:8000 || echo "")
if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${RED}⏹️  Parando Backend (PID: $BACKEND_PID)...${NC}"
    kill -9 $BACKEND_PID
    echo -e "${GREEN}✅ Backend parado${NC}"
else
    echo -e "${YELLOW}ℹ️  Backend não está rodando${NC}"
fi

# Frontend (porta 3000)
FRONTEND_PID=$(lsof -ti:3000 || echo "")
if [ ! -z "$FRONTEND_PID" ]; then
    echo -e "${RED}⏹️  Parando Frontend (PID: $FRONTEND_PID)...${NC}"
    kill -9 $FRONTEND_PID
    echo -e "${GREEN}✅ Frontend parado${NC}"
else
    echo -e "${YELLOW}ℹ️  Frontend não está rodando${NC}"
fi

echo ""
echo -e "${GREEN}✅ Todos os serviços foram parados${NC}"
echo ""
echo -e "${YELLOW}💡 Para parar o PostgreSQL:${NC}"
echo "   docker container stop financas_postgres"
echo ""
