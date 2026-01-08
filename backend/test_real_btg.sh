#!/bin/bash
set -e

ARQUIVO="/home/vitor/Documents/organizar-gastos/data/Extrato_2025-01-01_a_2025-12-13_12664507770.xls"

if [ ! -f "$ARQUIVO" ]; then
    echo "❌ Arquivo não encontrado: $ARQUIVO"
    exit 1
fi

echo "📤 Enviando arquivo BTG para API..."
echo "Arquivo: $(basename "$ARQUIVO")"
echo "Tamanho: $(ls -lh "$ARQUIVO" | awk '{print $5}')"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "http://localhost:8000/importacao/extrato-bruto?banco_id=btg" \
  -H "accept: application/json" \
  -F "arquivo=@$ARQUIVO")

HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "📊 Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCESSO!"
    echo "$HTTP_BODY" | python3 -m json.tool
else
    echo "❌ ERRO:"
    echo "$HTTP_BODY" | python3 -m json.tool || echo "$HTTP_BODY"
fi
