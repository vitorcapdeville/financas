# Feature: Importação Natural de Arquivos

## Filosofia

A importação de **um** arquivo é apenas um caso especial da importação de **múltiplos** arquivos. Por isso, unificamos tudo em uma única interface natural que aceita tanto um quanto múltiplos arquivos.

## Mudanças Implementadas

### Backend

**Endpoint Único:** `POST /importacao`

- Aceita `List[UploadFile]` (um ou mais arquivos)
- Sempre retorna `ResultadoImportacaoMultiplaResponse`
- Cada arquivo é processado independentemente
- Erros em um arquivo não interrompem os demais

**Removido:**

- ❌ Endpoint `/importacao/multiplos` (desnecessário)
- ❌ Dependency `get_importar_arquivo_use_case` (não usado mais)

**Mantido:**

- ✅ `ImportarArquivoUseCase` - Lógica de arquivo único
- ✅ `ImportarMultiplosArquivosUseCase` - Orquestrador (usa o anterior)
- ✅ Dependency `get_importar_multiplos_arquivos_use_case`

### Frontend

**Página Única:** `/importar`

- Input `<input type="file" multiple>` - aceita múltiplos arquivos nativamente
- Lista de arquivos selecionados com gerenciamento individual
- Detecção automática de senha por arquivo (faturas BTG)
- Botão dinâmico: "Importar 1 Arquivo" ou "Importar N Arquivos"

**Removido:**

- ❌ Página `/importar-multiplos` (desnecessária)
- ❌ Método `importarArquivo()` no service (substituído)
- ❌ Método `importarMultiplosArquivos()` (renomeado)

**Mantido:**

- ✅ Método `importarArquivos()` - único método que aceita array

## Como Usar

### Interface Web

1. Acesse http://localhost:3000/importar
2. Clique em "Escolher Arquivos"
3. Selecione **um ou mais** arquivos (Ctrl/Cmd + clique)
4. Preencha senhas para faturas BTG (detectadas automaticamente)
5. Remova arquivos individuais se necessário
6. Clique em "Importar N Arquivo(s)"

### API (curl)

**Arquivo único:**

```bash
curl -X POST "http://localhost:8000/importacao" \
  -F "arquivos=@extrato.csv"
```

**Múltiplos arquivos:**

```bash
curl -X POST "http://localhost:8000/importacao" \
  -F "arquivos=@extrato1.csv" \
  -F "arquivos=@fatura1.xlsx" \
  -F "arquivos=@extrato2.csv" \
  -F "passwords=,senha123,"  # senha apenas para fatura1
```

**Resposta (sempre o mesmo formato):**

```json
{
  "total_arquivos": 3,
  "arquivos_sucesso": 2,
  "arquivos_erro": 1,
  "total_transacoes_importadas": 150,
  "resultados": [
    {
      "nome_arquivo": "extrato1.csv",
      "sucesso": true,
      "total_importado": 50,
      "transacoes_ids": [1, 2, 3, ...],
      "mensagem": "50 transações importadas (parser: btg_extrato)",
      "erro": null
    },
    {
      "nome_arquivo": "fatura1.xlsx",
      "sucesso": true,
      "total_importado": 100,
      "transacoes_ids": [51, 52, ...],
      "mensagem": "100 transações importadas (parser: btg_fatura)",
      "erro": null
    },
    {
      "nome_arquivo": "extrato2.csv",
      "sucesso": false,
      "total_importado": 0,
      "transacoes_ids": [],
      "mensagem": "Erro ao processar arquivo",
      "erro": "Arquivo vazio"
    }
  ]
}
```

## UX Melhorada

### Arquivo Único

- Selecione 1 arquivo
- Campo de senha aparece automaticamente se for fatura BTG
- Feedback simples: "50 transações importadas!"

### Múltiplos Arquivos

- Selecione vários arquivos de uma vez
- Lista mostra todos os arquivos
- Cada arquivo com senha tem seu próprio campo
- Remova arquivos individuais antes de enviar
- Feedback detalhado: "150 transações de 3 arquivos!"
- Erros não interrompem outros arquivos

## Benefícios da Solução Natural

✅ **Simplicidade:** Uma página, um endpoint, um conceito  
✅ **Flexibilidade:** Funciona para 1 ou N arquivos sem mudança de interface  
✅ **Consistência:** Sempre o mesmo formato de resposta  
✅ **Escalabilidade:** Fácil adicionar features (progresso, retry, etc)  
✅ **Manutenibilidade:** Menos código, menos bugs  
✅ **Usabilidade:** Usuário não precisa escolher "modo único" vs "modo múltiplo"

## Arquitetura

```
┌────────────────────────────────────────────┐
│         Frontend (/importar)               │
│  - Input aceita múltiplos arquivos        │
│  - Lista dinâmica de arquivos             │
│  - Gerenciamento de senhas por arquivo    │
└───────────────┬────────────────────────────┘
                │ HTTP POST
                │ FormData: arquivos[], passwords
                ↓
┌────────────────────────────────────────────┐
│    Backend: POST /importacao               │
│  - Aceita List[UploadFile]                │
│  - Processa cada arquivo independente     │
│  - Retorna ResultadoMultiplo (sempre)     │
└───────────────┬────────────────────────────┘
                │
                ↓
┌────────────────────────────────────────────┐
│  ImportarMultiplosArquivosUseCase          │
│  ┌──────────────────────────────────────┐  │
│  │ Para cada arquivo:                   │  │
│  │  1. ImportarArquivoUseCase.execute() │  │
│  │  2. Capturar resultado/erro          │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

## Migração

Se você estava usando a API antiga:

**Antes:**

```typescript
// Arquivo único
await importacaoService.importarArquivo(file, password);

// Múltiplos
await importacaoService.importarMultiplosArquivos(files, passwords);
```

**Depois:**

```typescript
// Ambos os casos
await importacaoService.importarArquivos(files, passwords);
```

**Resposta mudou:**

```typescript
// Antes (arquivo único)
{ total_importado: 50, transacoes_ids: [...], mensagem: "..." }

// Depois (sempre múltiplo, mesmo para 1 arquivo)
{
  total_arquivos: 1,
  arquivos_sucesso: 1,
  arquivos_erro: 0,
  total_transacoes_importadas: 50,
  resultados: [{ nome_arquivo, sucesso, total_importado, ... }]
}
```

## Próximos Passos (Melhorias Futuras)

1. **Progress Bar:** Mostrar progresso arquivo por arquivo
2. **Paralelização:** Processar arquivos em paralelo (backend asyncio)
3. **Retry:** Permitir reenviar apenas arquivos com erro
4. **Validação Prévia:** Validar formato antes de processar
5. **Drag & Drop:** Interface de arrastar e soltar arquivos
6. **Histórico:** Salvar logs de importação no banco

## Conformidade

✅ Clean Architecture - Camadas respeitadas  
✅ SOLID - SRP, OCP, DIP aplicados  
✅ DRY - Reuso de código (composição)  
✅ Fail-Safe - Erros isolados por arquivo  
✅ Type-Safe - TypeScript + type hints  
✅ RESTful - Endpoint semântico e consistente
