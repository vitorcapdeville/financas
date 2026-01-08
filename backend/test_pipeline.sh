#!/bin/bash
set -e

ARQUIVO="/home/vitor/Documents/organizar-gastos/data/Extrato_2025-01-01_a_2025-12-13_12664507770.xls"

echo "🧪 Testando Pipeline Unificada de Importação"
echo "============================================="
echo ""

# Teste 1: Detecção automática (sem banco_id)
echo "📤 Teste 1: Detecção automática do BTG"
echo "Arquivo: $(basename "$ARQUIVO")"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "http://localhost:8000/importacao" \
  -H "accept: application/json" \
  -F "arquivo=@$ARQUIVO")

HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "📊 Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCESSO!"
    echo "$HTTP_BODY" | python3 -m json.tool | head -20
else
    echo "❌ ERRO:"
    echo "$HTTP_BODY" | python3 -m json.tool || echo "$HTTP_BODY"
fi

echo ""
echo "============================================="
echo ""

# Teste 2: Forçar parser BTG
echo "📤 Teste 2: Forçando parser BTG (banco_id=btg)"
echo "Arquivo: $(basename "$ARQUIVO")"
echo ""

RESPONSE2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "http://localhost:8000/importacao?banco_id=btg" \
  -H "accept: application/json" \
  -F "arquivo=@$ARQUIVO")

HTTP_BODY2=$(echo "$RESPONSE2" | sed -e 's/HTTP_STATUS:.*//g')
HTTP_STATUS2=$(echo "$RESPONSE2" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "📊 Status: $HTTP_STATUS2"

if [ "$HTTP_STATUS2" -eq 200 ]; then
    echo "✅ SUCESSO!"
    echo "$HTTP_BODY2" | python3 -m json.tool | head -20
else
    echo "❌ ERRO:"
    echo "$HTTP_BODY2" | python3 -m json.tool || echo "$HTTP_BODY2"
fi

