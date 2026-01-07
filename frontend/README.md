# Frontend de Finanças Pessoais

Interface web para gerenciamento de finanças pessoais, construída com Next.js, TypeScript e Tailwind CSS.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o .env se necessário
```

3. Execute em modo de desenvolvimento:
```bash
npm run dev
```

4. Acesse: http://localhost:3000

## Estrutura

```
src/
├── app/              # Páginas do Next.js (App Router)
│   ├── page.tsx      # Dashboard principal
│   ├── layout.tsx    # Layout global
│   └── globals.css   # Estilos globais
├── components/       # Componentes reutilizáveis
├── services/         # Serviços de API
├── types/            # Tipos TypeScript
├── utils/            # Funções utilitárias
└── lib/              # Configurações (axios, etc)
```

## Tecnologias

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **Axios**: Cliente HTTP
- **React Hook Form**: Formulários
- **Recharts**: Gráficos
- **date-fns**: Manipulação de datas
- **react-hot-toast**: Notificações

## Funcionalidades

- ✅ Dashboard com resumo mensal
- ✅ Visualização de entradas e saídas por categoria
- 🚧 Listagem de transações com filtros
- 🚧 Formulário para adicionar/editar transações
- 🚧 Upload de extratos e faturas
- 🚧 Gráficos interativos

## Próximos Passos

1. Criar página de listagem de transações
2. Criar formulário de nova transação
3. Criar página de importação
4. Adicionar gráficos com Recharts
5. Implementar filtros avançados
