# 🎨 Financial Serenity Design System

Sistema de design premium para o aplicativo de Finanças Pessoais.

## Filosofia de Design

**Conceito**: Minimalismo refinado com toques de luxo financeiro. Inspiração em apps bancários premium misturado com dashboard de dados editorial.

**Princípios**:

- ✨ Elegância sem ostentação
- 📊 Clareza na apresentação de dados financeiros
- 🎯 Hierarquia visual forte
- 🌊 Transições suaves e micro-interações
- 🏛️ Confiança através da estabilidade visual

---

## Paleta de Cores

### Cores Principais

```css
/* Emerald - Cor principal do branding */
--color-emerald-dark: #0f3d3e   /* Títulos, elementos principais */
--color-emerald: #156064         /* Botões, links ativos */
--color-emerald-light: #2a7c7f   /* Hover states */

/* Bronze/Gold - Acentos de luxo */
--color-bronze: #b8860b          /* Destaques, decorações */
--color-bronze-light: #daa520    /* Hover em acentos */
--color-gold: #d4af37            /* Indicadores especiais */

/* Neutros Quentes */
--color-cream: #faf8f5           /* Background principal */
--color-taupe: #d4c5b9           /* Bordas, divisores */
--color-stone: #8b8378           /* Texto secundário */
--color-charcoal: #2d2d2d        /* Texto principal */

/* Estados Semânticos */
--color-success: #2d8659         /* Entradas, positivo */
--color-error: #c44536           /* Saídas, negativo */
--color-warning: #e67e22         /* Alertas */
```

### Uso das Cores

- **Backgrounds**: `#faf8f5` (cream) com gradientes radiais sutis
- **Cards**: White com bordas `#d4c5b9` (taupe)
- **Títulos principais**: Gradient emerald (`#0f3d3e` → `#156064`)
- **Valores positivos**: `#2d8659` (success)
- **Valores negativos**: `#c44536` (error)
- **Acentos decorativos**: `#b8860b` (bronze)

---

## Tipografia

### Fontes

```css
/* Display (Títulos) */
--font-display: 'DM Serif Display', serif

/* Sans (Corpo) */
--font-sans: 'DM Sans', sans-serif
```

### Hierarquia

```tsx
/* Título principal de página */
<h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">

/* Título de seção */
<h2 className="text-2xl font-bold text-display text-[#0f3d3e]">

/* Subtítulo */
<h3 className="text-xl font-semibold text-[#2d2d2d]">

/* Labels */
<label className="text-sm font-semibold text-[#0f3d3e] uppercase tracking-wider">

/* Corpo */
<p className="text-base text-[#2d2d2d]">

/* Secundário */
<p className="text-sm text-[#8b8378]">

/* Valores financeiros - SEMPRE usar text-financial */
<span className="text-3xl font-bold text-financial">
```

### Utilitários de Tipografia

```css
/* Para valores financeiros (números tabulares) */
.text-financial {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" on, "lnum" on;
}

/* Para títulos display */
.text-display {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

/* Gradientes de texto */
.text-gradient-emerald {
  background: linear-gradient(135deg, #0f3d3e, #2a7c7f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-gold {
  background: linear-gradient(135deg, #b8860b, #d4af37);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Componentes

### Cards Premium

Todos os cards principais devem usar a classe `card-premium`:

```tsx
<div className="card-premium p-8">{/* Conteúdo */}</div>
```

**Características**:

- Background branco
- Border radius: `16px` (`var(--radius-lg)`)
- Shadow: `var(--shadow-md)`
- Hover: Elevação + borda superior dourada animada
- Transição suave de 250ms

### Botões

#### Primário (CTA)

```tsx
<button
  className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
  style={{
    background: "linear-gradient(135deg, #0f3d3e 0%, #156064 100%)",
    boxShadow: "0 4px 12px rgba(15, 61, 62, 0.25)",
  }}
>
  Ação Principal
</button>
```

#### Secundário

```tsx
<button className="px-6 py-3 rounded-xl font-medium text-[#2d2d2d] bg-white border-2 border-[#d4c5b9] hover:border-[#156064] transition-all duration-300">
  Ação Secundária
</button>
```

### Navegação

Sempre usar o componente `<NavegacaoPrincipal />` que inclui:

- Ícones geométricos únicos (◆ ⟡ ◇ ◈)
- Estado ativo com gradient emerald
- Animações de hover com shimmer
- Indicador ativo em dourado
- Preservação de query params

### Inputs

```tsx
<input
  type="text"
  className="w-full border-2 border-[#d4c5b9] rounded-xl px-5 py-3.5 text-[#2d2d2d] bg-[#faf8f5] focus:outline-none focus:border-[#156064] focus:bg-white transition-all duration-300 font-medium"
/>
```

### Indicadores de Valor

```tsx
{
  /* Entradas */
}
<div
  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
  style={{ background: "linear-gradient(135deg, #2d8659, #38a169)" }}
>
  ↗
</div>;

{
  /* Saídas */
}
<div
  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
  style={{ background: "linear-gradient(135deg, #c44536, #e56b5d)" }}
>
  ↘
</div>;
```

---

## Animações

### Entradas de Página

Sempre usar para elementos principais:

```tsx
{/* Fade in com movimento vertical */}
<div className="animate-fade-in-up">

{/* Com delay orquestrado */}
<div className="animate-fade-in-up delay-100">
<div className="animate-fade-in-up delay-200">
<div className="animate-fade-in-up delay-300">

{/* Fade in com scale */}
<div className="animate-fade-in-scale">
```

### Delays Disponíveis

```css
.delay-100 {
  animation-delay: 100ms;
}
.delay-200 {
  animation-delay: 200ms;
}
.delay-300 {
  animation-delay: 300ms;
}
.delay-400 {
  animation-delay: 400ms;
}
.delay-500 {
  animation-delay: 500ms;
}
```

### Animação de Flutuação

Para elementos decorativos:

```tsx
<div className="animate-float">
  <div className="w-2 h-2 rounded-full bg-[#b8860b]"></div>
</div>
```

### Transições

```css
/* Padrões disponíveis */
var(--transition-fast)  /* 150ms - Hover states */
var(--transition-base)  /* 250ms - Padrão */
var(--transition-slow)  /* 350ms - Animações complexas */
```

---

## Layouts

### Container Principal

```tsx
<main className="min-h-screen px-6 py-8 md:px-12 md:py-12">
  <div className="max-w-[1400px] mx-auto">{/* Conteúdo */}</div>
</main>
```

### Grid de Cards (Dashboard)

```tsx
{/* Grid assimétrico para resumo */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
  <div className="md:col-span-5"> {/* Card maior */}
  <div className="md:col-span-4"> {/* Card médio */}
  <div className="md:col-span-3"> {/* Card menor */}
</div>

{/* Grid simétrico para categorias */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div className="card-premium">
  <div className="card-premium">
</div>
```

### Headers de Página

```tsx
<header className="mb-10 animate-fade-in-up">
  <div className="flex items-baseline gap-4 mb-3">
    <h1 className="text-5xl md:text-6xl font-bold text-display text-gradient-emerald">
      Título
    </h1>
    <div className="h-2 w-2 rounded-full bg-[#b8860b] animate-float"></div>
  </div>
  <p className="text-lg text-[#8b8378]">Descrição da página</p>
</header>
```

---

## Elementos Decorativos

### Linhas de Acento

```tsx
{
  /* Linha horizontal decorativa */
}
<div className="h-[2px] w-32 bg-gradient-to-r from-[#b8860b] to-transparent opacity-50"></div>;

{
  /* Linha vertical em listas */
}
<div className="w-1 h-8 rounded-full bg-[#2d8659] opacity-0 group-hover:opacity-100 transition-opacity"></div>;
```

### Círculos de Background

```tsx
{
  /* Para criar profundidade */
}
<div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white"></div>;
```

### Gradientes Radiais

```tsx
{
  /* Background sutil */
}
<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#156064]/5 to-transparent rounded-full"></div>;
```

### Pontos Decorativos

```tsx
<span className="w-1 h-1 rounded-full bg-[#b8860b]"></span>
<span className="w-2 h-2 rounded-full bg-[#b8860b]"></span>
```

---

## Estados e Feedback

### Loading States

```tsx
<div className="animate-shimmer">{/* Conteúdo carregando */}</div>
```

### Empty States

```tsx
<div className="text-center py-12">
  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#156064]/10 to-[#b8860b]/10 flex items-center justify-center">
    <span className="text-2xl opacity-30">◇</span>
  </div>
  <p className="text-[#8b8378]">Nenhum dado disponível</p>
</div>
```

### Toasts (react-hot-toast)

Já configurado no layout com estilo premium:

- Background branco
- Borda taupe
- Shadow suave
- Ícones coloridos (verde/vermelho)

---

## Responsividade

### Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px` (prefixo `md:`)
- Desktop: `> 1024px` (prefixo `lg:`)

### Padrões Responsivos

```tsx
{/* Texto */}
<h1 className="text-4xl md:text-5xl lg:text-6xl">

{/* Padding */}
<main className="px-6 py-8 md:px-12 md:py-12">

{/* Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

{/* Flex */}
<div className="flex flex-col md:flex-row">
```

---

## Checklist de Implementação

Ao criar uma nova página/componente:

- [ ] Usar `card-premium` para cards principais
- [ ] Aplicar `text-financial` para valores monetários
- [ ] Usar `text-display` para títulos principais
- [ ] Adicionar animações `animate-fade-in-up` com delays orquestrados
- [ ] Incluir elementos decorativos (pontos, linhas, gradientes)
- [ ] Aplicar cores da paleta (não usar cores arbitrárias)
- [ ] Testar responsividade em mobile
- [ ] Adicionar micro-interações (hover, focus)
- [ ] Usar transições suaves (`transition-all duration-300`)
- [ ] Preservar consistência com páginas existentes

---

## Exemplos de Código

### Card de Resumo Financeiro

```tsx
<div className="md:col-span-5 card-premium p-8 animate-fade-in-up delay-300">
  <div className="flex items-start justify-between mb-6">
    <div>
      <p className="text-sm font-medium text-[#8b8378] uppercase tracking-wider mb-2">
        Total de Entradas
      </p>
      <h3
        className="text-4xl font-bold text-financial"
        style={{ color: "#2d8659" }}
      >
        {formatarMoeda(valor)}
      </h3>
    </div>
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
      style={{ background: "linear-gradient(135deg, #2d8659, #38a169)" }}
    >
      <span className="text-white">↗</span>
    </div>
  </div>
  <div
    className="h-2 w-24 rounded-full"
    style={{ background: "linear-gradient(90deg, #2d8659, #38a169)" }}
  ></div>
</div>
```

### Link com Hover Elegante

```tsx
<Link
  href={url}
  className="group flex justify-between items-center py-4 px-4 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#2d8659]/5 hover:to-transparent border-b border-[#d4c5b9]/30"
>
  <div className="flex items-center gap-3 flex-1">
    <div className="w-1 h-8 rounded-full bg-[#2d8659] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <span className="font-medium text-[#2d2d2d] group-hover:text-[#2d8659] transition-colors">
      {texto}
    </span>
  </div>
  <span className="font-bold text-financial text-[#2d8659] text-lg">
    {valor}
  </span>
</Link>
```

---

## Manutenção

Este design system deve ser mantido atualizado conforme o aplicativo evolui. Sempre consulte este documento ao adicionar novos componentes ou páginas.

**Última atualização**: Janeiro 2026
**Versão**: 1.0.0 - Financial Serenity
