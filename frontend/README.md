# 🎨 Frontend - Financial Serenity Design

Sistema de gerenciamento de finanças pessoais com design premium e elegante.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev          # http://localhost:3000

# Build
npm run build

# Testes
npm run test
```

## 📖 Documentação Completa

- **[Design System](./DESIGN_SYSTEM.md)** - Guia completo de cores, tipografia, componentes e animações
- **[Showcase de Cores](./src/components/ColorPaletteShowcase.tsx)** - Componente visual da paleta

## 🎨 Design Philosophy: Financial Serenity

Sistema de design premium que combina:

- ✨ **Minimalismo refinado** - Sem elementos desnecessários
- 🏛️ **Estabilidade visual** - Inspirado em apps bancários premium
- 📊 **Clareza de dados** - Hierarquia forte e tipografia financeira
- 🌊 **Micro-interações** - Animações suaves e elegantes

### Cores Principais

```css
/* Emerald (Branding) */
#0f3d3e  /* Dark - Títulos */
#156064  /* Default - CTAs */

/* Bronze/Gold (Acentos) */
#b8860b  /* Bronze - Decorações */
#d4af37  /* Gold - Destaques */

/* Semânticos */
#2d8659  /* Success - Entradas */
#c44536  /* Error - Saídas */

/* Neutros */
#faf8f5  /* Cream - Background */
#2d2d2d  /* Charcoal - Texto */
```

### Tipografia

- **DM Serif Display** - Títulos elegantes
- **DM Sans** - Corpo de texto
- Fonte tabular para valores financeiros

## 📦 Componentes Base

```tsx
/* Card Premium */
<div className="card-premium p-8">

/* Botão Primário */
<button style={{
  background: 'linear-gradient(135deg, #0f3d3e, #156064)'
}}>

/* Animações */
<div className="animate-fade-in-up delay-200">
```

## 🛠️ Tech Stack

- **Next.js 16** - App Router, Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **date-fns** - Date utilities

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
