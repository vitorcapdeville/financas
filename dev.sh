#!/bin/bash

# 🔥 Quick Start - Abre VS Code e inicia tudo automaticamente

cd /home/vitor/Documents/financas

echo "🏦 Iniciando ambiente de desenvolvimento Finanças..."
echo ""

# Abre VS Code
code . &

# Aguarda VS Code abrir
sleep 2

# Inicia os serviços
./scripts/start.sh

echo ""
echo "✅ Ambiente pronto!"
echo "   VS Code: Aberto"
echo "   Serviços: Iniciando..."
echo ""
