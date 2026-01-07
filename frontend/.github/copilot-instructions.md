# Instruções para o GitHub Copilot - Frontend de Finanças Pessoais

## Contexto do Projeto

Este é o frontend de uma aplicação de gerenciamento de finanças pessoais, construído com:
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Para tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Para comunicação com a API
- **React Hook Form**: Gerenciamento de formulários
- **Recharts**: Biblioteca de gráficos

## Arquitetura e Fluxo de Dados

- **Service layer**: Todas as chamadas à API organizadas em `services/api.service.ts` (transacoesService, importacaoService, configuracoesService)
- **Custom period**: Dashboard permite definir dia de início do período mensal (1-31) armazenado via API `/configuracoes`
- **Date handling**: Frontend calcula `data_inicio/data_fim` baseado em dia customizado e envia para API (prioridade sobre mes/ano)
- **Type safety**: Interfaces TypeScript em `types/index.ts` espelham modelos backend (Pydantic schemas)
- **API base URL**: Configurável via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
- **State persistence**: Hook `usePeriodo` em `hooks/usePeriodo.ts` gerencia período e dia de início usando localStorage para persistência entre sessões
- **SSR handling**: Sempre use `typeof window !== 'undefined'` antes de acessar localStorage para evitar erros de hidratação

## Objetivo

Fornecer uma interface intuitiva para que o usuário possa:
1. Visualizar resumo mensal de entradas e saídas
2. Ver transações categorizadas
3. Adicionar, editar e excluir transações
4. Importar extratos bancários e faturas
5. Categorizar transações
6. Visualizar gráficos e insights financeiros

## Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── page.tsx            # Dashboard principal
│   ├── layout.tsx          # Layout raiz
│   ├── globals.css         # Estilos globais
│   ├── transacoes/         # Página de transações
│   └── importar/           # Página de importação
├── components/             # Componentes reutilizáveis
│   ├── Dashboard/
│   ├── Transacao/
│   ├── Forms/
│   └── UI/
├── services/               # Camada de serviços
│   └── api.service.ts      # Comunicação com API
├── types/                  # Tipos TypeScript
│   └── index.ts
├── utils/                  # Utilitários
│   └── format.ts           # Formatação de dados
└── lib/                    # Configurações
    └── api.ts              # Setup do Axios
```

## Tipos TypeScript

### Principais Interfaces

```typescript
interface Transacao {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria?: string;
  origem: string;
  observacoes?: string;
}

interface ResumoMensal {
  mes: number;
  ano: number;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  entradas_por_categoria: Record<string, number>;
  saidas_por_categoria: Record<string, number>;
}
```

## Padrões de Código

### 1. Componentes: Server Components vs Client Components

**REGRA DE OURO**: Use Server Components por padrão. Adicione `"use client"` APENAS quando absolutamente necessário.

#### ✅ Quando usar Server Components (PADRÃO)

Server Components devem ser sua primeira escolha para:
- Buscar dados do servidor (fetch, database queries)
- Acessar recursos backend (APIs, arquivos, secrets)
- Renderizar conteúdo estático ou baseado em dados
- Reduzir bundle JavaScript do cliente
- Manter lógica sensível no servidor

**Exemplos de uso**:
```typescript
// ✅ PERFEITO: Server Component busca dados
export default async function TransacoesPage({ searchParams }: PageProps) {
  const transacoes = await transacoesServerService.listar(searchParams);
  return <ListaTransacoes transacoes={transacoes} />;
}

// ✅ PERFEITO: Componente reutilizável sem interatividade
export default function TransacaoCard({ transacao }: Props) {
  return (
    <div>
      <h3>{transacao.descricao}</h3>
      <p>{formatarMoeda(transacao.valor)}</p>
    </div>
  );
}
```

#### ❌ Quando você PRECISA usar Client Components

Adicione `"use client"` APENAS se precisar de:

1. **Hooks React de estado/lifecycle**: `useState`, `useReducer`, `useEffect`, `useLayoutEffect`
2. **Event handlers**: `onClick`, `onChange`, `onSubmit`, etc
3. **Browser APIs**: `localStorage`, `sessionStorage`, `window`, `document`, `navigator`
4. **Hooks de navegação client-side**: `useRouter` (para navegação programática), `useSearchParams` (para ler/atualizar)
5. **Hooks de contexto**: `useContext` (mas considere props drilling em Server Components)
6. **Bibliotecas client-only**: React Hook Form, bibliotecas de animação, etc

**Exemplos de uso**:
```typescript
// ✅ Client Component necessário: usa useState e onClick
'use client';

export default function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  return <button onClick={() => setIsOpen(!isOpen)}>Menu</button>;
}

// ✅ Client Component necessário: usa useRouter para navegação
'use client';

export default function BotaoVoltar() {
  const router = useRouter();
  return <button onClick={() => router.back()}>← Voltar</button>;
}
```

#### 🎯 Estratégia: Composição Server + Client

**MELHOR PRÁTICA**: Mantenha Client Components pequenos e focados. Use Server Components como wrapper.

```typescript
// ✅ EXCELENTE: Server Component wrapper
export default async function PaginaTransacao({ params }: Props) {
  const transacao = await fetchTransacao(params.id);
  const todasTags = await fetchTags(); // Busca no servidor
  
  return (
    <main>
      {/* Server Components para conteúdo estático */}
      <Header transacao={transacao} />
      <DetalhesTransacao transacao={transacao} />
      
      {/* Client Component APENAS para interatividade */}
      <SeletorTags 
        transacaoId={transacao.id}
        tagsAtuais={transacao.tags}
        todasTags={todasTags} // Passa dados do servidor
      />
    </main>
  );
}

// Client Component pequeno e focado
'use client';
export default function SeletorTags({ transacaoId, tagsAtuais, todasTags }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  // Apenas lógica de UI interativa
}
```

#### ❌ Anti-padrões Comuns

```typescript
// ❌ ERRADO: Buscar dados em Client Component
'use client';

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([]);
  
  useEffect(() => {
    fetch('/api/transacoes').then(res => setTransacoes(res.json()));
  }, []);
  
  return <Lista items={transacoes} />;
}

// ✅ CORRETO: Buscar dados em Server Component
export default async function Transacoes() {
  const transacoes = await transacoesServerService.listar();
  return <Lista items={transacoes} />;
}

// ❌ ERRADO: Todo componente como Client Component
'use client';

export default function Card({ title, valor }: Props) {
  return <div><h3>{title}</h3><p>{valor}</p></div>; // Sem interatividade!
}

// ✅ CORRETO: Componente sem 'use client' (Server Component)
export default function Card({ title, valor }: Props) {
  return <div><h3>{title}</h3><p>{valor}</p></div>;
}
```

### 2. Server Actions: Mutações de Dados

**Server Actions** são funções assíncronas executadas no servidor, usadas para mutações (POST, PUT, DELETE).

#### Quando usar Server Actions

Use Server Actions para:
- Criar, atualizar ou deletar dados
- Submeter formulários
- Executar lógica server-side após ação do usuário
- Revalidar cache do Next.js

#### Como criar Server Actions

**Opção 1 - Arquivo separado** (RECOMENDADO para reutilização):
```typescript
// app/transacao/[id]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function adicionarTagAction(transacaoId: number, tagId: number) {
  const res = await fetch(`${API_URL}/transacoes/${transacaoId}/tags/${tagId}`, {
    method: 'POST',
  });
  
  if (!res.ok) throw new Error('Erro ao adicionar tag');
  
  revalidatePath(`/transacao/${transacaoId}`); // Revalida página
  return { success: true };
}
```

**Opção 2 - Inline em Server Component** (para ações específicas):
```typescript
// Server Component
export default function MeuComponente({ id }: Props) {
  async function deletarAction() {
    'use server';
    await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });
    revalidatePath('/items');
  }
  
  return <form action={deletarAction}>
    <button type="submit">Deletar</button>
  </form>;
}
```

#### Usar Server Actions em Client Components

```typescript
// app/transacao/[id]/actions.ts
'use server';
export async function adicionarTagAction(transacaoId: number, tagId: number) {
  // ... implementação
  revalidatePath(`/transacao/${transacaoId}`);
}

// components/DropdownTags.tsx
'use client';

import { useTransition } from 'react';
import { adicionarTagAction } from '@/app/transacao/[id]/actions';

export default function DropdownTags({ transacaoId, tags }: Props) {
  const [isPending, startTransition] = useTransition();
  
  function handleAdicionar(tagId: number) {
    startTransition(async () => {
      await adicionarTagAction(transacaoId, tagId);
    });
  }
  
  return <button onClick={() => handleAdicionar(1)} disabled={isPending}>
    Adicionar {isPending && '...'}
  </button>;
}
```

#### Benefícios de Server Actions vs API Routes

**Server Actions**:
- ✅ Menos código (sem criar API route separado)
- ✅ Type-safe (TypeScript end-to-end)
- ✅ Revalidação automática com `revalidatePath()`
- ✅ Progressive Enhancement (funciona sem JS)
- ✅ Menos bundle JS (lógica fica no servidor)

**API Routes** (usar apenas quando):
- Expor endpoint público/externo
- Webhook de terceiros
- Necessita de middlewares complexos

#### Organização de Server Actions

```
app/
├── transacao/
│   └── [id]/
│       ├── page.tsx           # Server Component
│       └── actions.ts         # Server Actions desta página
├── tags/
│   ├── page.tsx
│   └── actions.ts
└── actions/                   # Actions globais (se reutilizáveis)
    ├── transacoes.ts
    └── tags.ts
```

**Recomendação**: Comece com actions por página (`app/[rota]/actions.ts`). Se houver reutilização, mova para `app/actions/`.

### 3. Estado na URL vs useState

**PRIORIDADE: Estado na URL**

- **Sempre prefira gerenciar estado através de URL params/searchParams** ao invés de useState
- Estado na URL permite compartilhamento de links e bookmarks preservando o estado da aplicação
- Use `searchParams` em Server Components ou `useSearchParams` + `useRouter` em Client Components
- useState é permitido apenas para estado efêmero de UI (modais abertos, campos de formulário, etc)

### 4. Preservação de Parâmetros de URL em Navegação

**REGRA CRÍTICA**: TODAS as páginas do aplicativo devem preservar os filtros de período (`periodo`, `diaInicio`, `tags`) ao navegar entre elas.

**Por quê?** O contexto temporal é fundamental - o usuário escolhe um período (ex: "25 de nov. até 24 de dez.") e espera que esse período seja mantido ao navegar entre diferentes seções do app (Dashboard → Tags → Regras → Configurações → etc).

**Implementação Padrão**: Use Client Component com `useSearchParams()` na navegação global para construir queryString e preservar filtros em TODOS os links.

**Exceção**: Use `router.back()` apenas para botões "Voltar" dentro de fluxos específicos (ex: voltar dos detalhes de uma transação para a lista).

**Cenário: Navegação Global (Menu Superior/Sidebar)**

Quando criar navegação global que conecta todas as páginas do app:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function NavegacaoGlobal() {
  const searchParams = useSearchParams();

  // TODAS as páginas preservam filtros de período
  const construirQueryString = () => {
    const params = new URLSearchParams();
    const periodo = searchParams.get('periodo');
    const diaInicio = searchParams.get('diaInicio');
    const tags = searchParams.get('tags');

    if (periodo) params.set('periodo', periodo);
    if (diaInicio) params.set('diaInicio', diaInicio);
    if (tags) params.set('tags', tags);

    return params.toString();
  };

  const queryString = construirQueryString();

  const links = [
    { href: '/', label: '🏠 Dashboard' },
    { href: '/transacoes', label: '💳 Transações' },
    { href: '/tags', label: '🏷️ Tags' },
    { href: '/regras', label: '⚙️ Regras' },
    { href: '/importar', label: '📤 Importar' },
    { href: '/configuracoes', label: '⚙️ Configurações' },
  ];

  return (
    <nav>
      {links.map(link => {
        const href = queryString ? `${link.href}?${queryString}` : link.href;
        return <Link key={link.href} href={href}>{link.label}</Link>;
      })}
    </nav>
  );
}
```

**Cenário 1 - Navegação DENTRO de páginas com filtros:**

```typescript
// ✅ CORRETO: Link preserva searchParams
'use client';

import { useSearchParams } from 'next/navigation';
imExemplo: Links em Componentes Client-Side**

```typescript
// ✅ CORRETO: Sempre preserva filtros
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function MeuComponente() {
  const searchParams = useSearchParams();
  
  // Construir queryString para preservar filtros
  const params = new URLSearchParams();
  const periodo = searchParams.get('periodo');
  const diaInicio = searchParams.get('diaInicio');
  const tags = searchParams.get('tags');
  
  if (periodo) params.set('periodo', periodo);
  if (diaInicio) params.set('diaInicio', diaInicio);
  if (tags) params.set('tags', tags);
  
  const queryString = params.toString();

  return (
    <div>
      {/* ✅ CORRETO: Todos os links preservam filtros */}
      <Link href={queryString ? `/?${queryString}` : '/'}>Dashboard</Link>
      <Link href={queryString ? `/transacoes?${queryString}` : '/transacoes'}>Transações</Link>
      <Link href={queryString ? `/tags?${queryString}` : '/tags'}>Tags</Link>
      <Link href={queryString ? `/regras?${queryString}` : '/regras'}>Regras</Link>
    </div>
  );
}
```

**Exemplo: Botão Voltar (Navegação com Preservação de Filtros)**

**IMPORTANTE**: O componente `<BotaoVoltar>` usa `Link` ao invés de `router.back()` para garantir preservação de filtros.

**Sistema de Origem**: Páginas que navegam para detalhes devem adicionar parâmetro `origem` na URL:

```typescript
// ✅ CORRETO: Adiciona origem ao navegar para detalhes
const queryParams = new URLSearchParams();
if (periodo) queryParams.set('periodo', periodo);
if (diaInicio) queryParams.set('diaInicio', diaInicio.toString());
if (searchParams.tags) queryParams.set('tags', searchParams.tags);
queryParams.set('origem', 'transacoes'); // ← Define de onde veio
const queryString = queryParams.toString();

<Link href={`/transacao/${id}?${queryString}`}>Ver Detalhes</Link>
```

**Valores válidos para `origem`**:
- `transacoes` - Volta para /transacoes
- `categoria:NomeCategoria` - Volta para /categoria/NomeCategoria
- Sem origem - Volta para / (dashboard)

```typescript
// ✅ CORRETO: Usa componente BotaoVoltar (já existe no projeto)
import BotaoVoltar from '@/components/BotaoVoltar';

export default function PaginaDetalhes() {
  return (
    <div>
      {/* ✅ CORRETO: Componente reutilizável que usa router.back() */}
      <BotaoVoltar>← Voltar ao Dashboard</BotaoVoltar>
      
      {/* ✅ TAMBÉM CORRETO: Com classes customizadas */}
      <BotaoVoltar className="bg-gray-200 px-6 py-3 rounded-lg">
        ← Voltar
      </BotaoVoltar>
    </div>
  );
}

// ❌ ERRADO: Link direto perde filtros da página anterior
<Link href="/">Voltar ao Dashboard</Link>

// ❌ ERRADO: Implementar router.back() inline (use o componente!)
'use client';
const router = useRouter();
<button onClick={() => router.back()}>Voltar</button>
```

**NUNCA faça:**
```typescript
// ❌ ERRADO: Link direto sem preservar filtros
<Link href="/">Dashboard</Link>
<Link href="/tags">Tags</Link>
<Link href="/regras">Regras</Link>

// ❌ ERRADO: Usar router.back() em navegação global (perde controle do destino)
<button onClick={() => router.back()}>Ir para Dashboard</button>
```

**Componente BotaoVoltar:**
- Localização: [src/components/BotaoVoltar.tsx](src/components/BotaoVoltar.tsx)
- Uso: Client Component que faz `router.back()` preservando histórico completo
- Props: `children` (texto do botão), `className` (estilos customizados)
- Quando usar: Páginas sem filtros próprios (tags, regras, importar, configurações)

**Páginas do Aplicativo (TODAS preservam filtros via navegação global):**
- ✅ [src/app/page.tsx](src/app/page.tsx) - Dashboard
- ✅ [src/app/transacoes/page.tsx](src/app/transacoes/page.tsx) - Lista de transações
- ✅ [src/app/categoria/[nome]/page.tsx](src/app/categoria/[nome]/page.tsx) - Transações por categoria
- ✅ [src/app/tags/page.tsx](src/app/tags/page.tsx) - Gerenciar tags (usa BotaoVoltar)
- ✅ [src/app/regras/page.tsx](src/app/regras/page.tsx) - Gerenciar regras (usa BotaoVoltar)
- ✅ [src/app/importar/page.tsx](src/app/importar/page.tsx) - Importar dados (usa BotaoVoltar)
- ✅ [src/app/configuracoes/page.tsx](src/app/configuracoes/page.tsx) - Configurações (usa BotaoVoltar)
- ⚪ [src/app/transacao/[id]/page.tsx](src/app/transacao/[id]/page.tsx) - Detalhes de transação (usa BotaoVoltar)

**Checklist antes de criar navegação:**
1. ✅ É navegação global (menu/sidebar)? → SEMPRE preserve filtros com queryString
2. ✅ É botão "Voltar" em página sem filtros? → Use componente `<BotaoVoltar>`
3. ✅ É link pontual dentro de conteúdo? → Preserve filtros com queryString
4. ❌ NUNCA use `<Link href="/">` direto em páginas sem filtros - use `<BotaoVoltar>`

**Cenário 1 - Navegação DENTRO de páginas com filtros:**

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaginaComFiltros() {
  const searchParams = useSearchParams();
  const periodo = searchParams.get('periodo') || '';
  const diaInicio = searchParams.get('diaInicio') || '1';
  
  // Construir queryString para preservar filtros
  const queryString = new URLSearchParams({
    periodo,
    diaInicio,
  }).toString();

  return (
    <div>
      {/* ✅ CORRETO: Link preserva parâmetros */}
      <Link href={`/?${queryString}`}>Voltar ao Dashboard</Link>
    </div>
  );
}
```

**Cenário 2 - Páginas SEM filtros (tags, importar, etc):**

Use `router.back()` para voltar à página anterior preservando TODO o estado:

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function PaginaSemFiltros() {
  const router = useRouter();

  return (
    <div>
      {/* ✅ CORRETO: Usa histórico do navegador */}
      <button onClick={() => router.back()}>← Voltar</button>
      
      {/* ❌ ERRADO: Link direto perde estado da página anterior */}
      <Link href="/">Voltar</Link>
    </div>
  );
}
```

**Aplicação por página**:
- [src/app/categoria/[nome]/page.tsx](src/app/categoria/[nome]/page.tsx) ✅ Preserva searchParams (tem filtros)
- [src/app/tags/page.tsx](src/app/tags/page.tsx) ✅ Usa router.back() (sem filtros)
- [src/app/importar/page.tsx](src/app/importar/page.tsx) → Deve usar router.back() (sem filtros)

### 5. Serviços de API

**IMPORTANTE**: Prefira Server Actions para mutações. Use serviços API apenas em Client Components quando necessário.

- Centralize todas as chamadas à API client-side em `services/api.service.ts`
- Para Server Components, use `services/*.server.ts` com fetch nativo
- Use async/await
- Trate erros adequadamente
- Use tipos TypeScript para requisições e respostas

```typescript
// Client-side service (api.service.ts)
export const meuService = {
  async listar(): Promise<MeuTipo[]> {
    const { data } = await api.get('/endpoint');
    return data;
  },
};

// Server-side service (meu.server.ts)
export const meuServerService = {
  async listar(): Promise<MeuTipo[]> {
    const res = await fetch(`${API_URL}/endpoint`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },
};
```

### 6. Formulários

- Prefira Server Actions para submissão de formulários
- Use React Hook Form apenas quando necessário (validação complexa client-side)
- Para formulários simples, use formulários nativos com Server Actions
- Valide dados no frontend e backend
- Forneça feedback visual de erros

```typescript
// ✅ PREFERIDO: Formulário com Server Action
'use server';
async function criarAction(formData: FormData) {
  const nome = formData.get('nome');
  // ... lógica
  revalidatePath('/items');
}

export default function Form() {
  return (
    <form action={criarAction}>
      <input name="nome" required />
      <button type="submit">Criar</button>
    </form>
  );
}

// ✅ OK: React Hook Form quando necessário
'use client';
const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data: FormData) => {
  try {
    await service.criar(data);
    toast.success('Sucesso!');
  } catch (error) {
    toast.error('Erro!');
  }
};
```

### 7. Estilização (Tailwind CSS)

- Use classes Tailwind para estilização
- Mantenha consistência com o design system
- Use componentes reutilizáveis para UI comum
- Cores principais: blue (ações primárias), gray (secundárias), red (destrutivas), green (entradas)

```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">Título</h2>
</div>
```

**REGRA CRÍTICA - Cores de Botões:**

**SEMPRE use `bg-blue-600 hover:bg-blue-700`** para botões primários. NUNCA use `bg-primary-*`:

```tsx
// ✅ CORRETO: Botão primário (azul)
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
  Salvar
</button>

// ✅ CORRETO: Botão secundário (cinza)
<button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
  Cancelar
</button>

// ✅ CORRETO: Botão destrutivo (vermelho)
<button className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
  Deletar
</button>

// ❌ ERRADO: NUNCA use bg-primary
<button className="bg-primary-600 hover:bg-primary-700"> // ❌ PROIBIDO
  Botão
</button>

// ❌ ERRADO: NUNCA use bg-green para botões primários
<button className="bg-green-600 hover:bg-green-700"> // ❌ Use blue
  Salvar
</button>
```

**Paleta de cores padrão:**
- **Azul (`blue-600`)**: Ações primárias, salvar, confirmar, criar
- **Cinza (`gray-200`)**: Cancelar, ações secundárias
- **Vermelho (`red-600`)**: Deletar, remover, ações destrutivas
- **Verde (`green-600`)**: APENAS para valores positivos/entradas em dados financeiros, NÃO para botões

**REGRA CRÍTICA - Estados Disabled:**

**SEMPRE inclua `disabled:opacity-50`** em TODOS botões que usam `disabled`:

```tsx
// ✅ CORRETO: Botão com estado disabled
<button
  onClick={handleClick}
  disabled={isPending}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
>
  {isPending ? 'Salvando...' : 'Salvar'}
</button>

// ❌ ERRADO: Sem disabled:opacity-50
<button
  disabled={isPending}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
>
  Salvar
</button>
```

**Classes obrigatórias para botões:**
- Cor de fundo: `bg-blue-600`, `bg-gray-200`, `bg-red-600`
- Texto: `text-white` (azul/vermelho) ou `text-gray-700` (cinza)
- Padding: `px-4 py-2` (pequeno) ou `px-6 py-3` (normal)
- Bordas: `rounded-lg` ou `rounded-md`
- Hover: `hover:bg-blue-700`, `hover:bg-gray-300`, etc
- Transição: `transition-colors`
- Disabled: `disabled:opacity-50` (OBRIGATÓRIO se usar disabled)

**REGRA CRÍTICA - Contraste de Inputs:**

**SEMPRE inclua `text-gray-900` em TODOS inputs e selects** para garantir contraste adequado:

```tsx
// ✅ CORRETO: Input com cor de texto explícita
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Digite aqui..."
/>

// ✅ CORRETO: Select com cor de texto explícita
<select
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="1">Opção 1</option>
</select>

// ❌ ERRADO: Sem text-gray-900 (texto invisível em alguns navegadores)
<input
  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

**Classes obrigatórias para inputs/selects:**
- `text-gray-900` - Cor do texto (OBRIGATÓRIO)
- `border border-gray-300` - Borda
- `rounded-md` - Bordas arredondadas
- `px-4 py-2` ou `px-3 py-2` - Padding
- `focus:outline-none focus:ring-2 focus:ring-blue-500` - Estado de foco

### 8. Estados e Loading

- Sempre mostre estados de loading
- Use `useTransition()` em Client Components com Server Actions
- Forneça feedback para ações do usuário
- Trate estados vazios (empty states)
- Use skeleton loaders quando apropriado

### 9. Notificações e Confirmações

**REGRA CRÍTICA**: NUNCA use `alert()`, `confirm()` ou `prompt()` nativos do navegador. Use sempre toast e modais.

#### **Sistema de Notificações (react-hot-toast)**

Biblioteca instalada: `react-hot-toast` com `<Toaster />` configurado em [layout.tsx](src/app/layout.tsx).

**Quando usar toast:**
- ✅ Feedback de sucesso após ações (criar, editar, deletar)
- ✅ Erros de API ou validação
- ✅ Mensagens informativas para o usuário
- ❌ NUNCA use `alert()` - sempre `toast.success/error()`

**Padrões de uso:**

```tsx
'use client';

import { toast } from 'react-hot-toast';

// ✅ CORRETO: Sucesso
toast.success('Configuração salva com sucesso!');
toast.success(`✅ Regra aplicada! ${count} transações modificadas.`);

// ✅ CORRETO: Erro
toast.error('Erro ao salvar. Tente novamente.');
toast.error(`Erro ao deletar: ${error}`);

// ✅ CORRETO: Validação
toast.error('Digite uma categoria');
toast.error('Selecione ao menos uma tag');

// ❌ ERRADO: NUNCA use alert
alert('Sucesso!'); // ❌ PROIBIDO
alert('Erro!');    // ❌ PROIBIDO
```

**Import obrigatório:**
```tsx
import { toast } from 'react-hot-toast';
```

**Métodos disponíveis:**
- `toast.success(mensagem)` - Ações bem-sucedidas
- `toast.error(mensagem)` - Erros e validações
- `toast.loading(mensagem)` - Estado de carregamento (raramente usado)
- ⚠️ `toast.warning()` **NÃO EXISTE** - use `toast.error()` para validações

#### **Sistema de Confirmações (ModalConfirmacao)**

Componente reutilizável: [src/components/ModalConfirmacao.tsx](src/components/ModalConfirmacao.tsx)

**Quando usar ModalConfirmacao:**
- ✅ Confirmações antes de ações destrutivas (deletar, aplicar em massa)
- ✅ Perguntas importantes ao usuário
- ❌ NUNCA use `confirm()` nativo

**Padrão de uso:**

```tsx
'use client';

import { useState, useTransition } from 'react';
import { ModalConfirmacao } from '@/components/ModalConfirmacao';

export default function MeuComponente() {
  const [itemParaDeletar, setItemParaDeletar] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeletar = () => {
    if (!itemParaDeletar) return;
    
    startTransition(async () => {
      try {
        await deletarAction(itemParaDeletar);
        toast.success('Item deletado com sucesso!');
        setItemParaDeletar(null);
      } catch (error) {
        toast.error('Erro ao deletar item');
        setItemParaDeletar(null);
      }
    });
  };

  return (
    <>
      {/* Botão que abre modal */}
      <button onClick={() => setItemParaDeletar(item.id)}>
        Deletar
      </button>

      {/* Modal de confirmação */}
      {itemParaDeletar && (
        <ModalConfirmacao
          titulo="Deletar Item"
          mensagem="Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
          onConfirmar={handleDeletar}
          onCancelar={() => setItemParaDeletar(null)}
          textoBotaoConfirmar="Deletar"
          textoBotaoCancelar="Cancelar"
          isPending={isPending}
          tipo="danger" // 'danger' | 'warning' | 'info'
        />
      )}
    </>
  );
}

// ❌ ERRADO: NUNCA use confirm nativo
if (!confirm('Deseja deletar?')) return; // ❌ PROIBIDO
```

**Props do ModalConfirmacao:**
- `titulo: string` - Título do modal
- `mensagem: string` - Mensagem de confirmação (pode usar `\n` para quebras de linha)
- `onConfirmar: () => void` - Callback ao confirmar
- `onCancelar: () => void` - Callback ao cancelar
- `textoBotaoConfirmar?: string` - Texto do botão (default: "Confirmar")
- `textoBotaoCancelar?: string` - Texto do botão (default: "Cancelar")
- `isPending?: boolean` - Desabilita botões durante loading
- `tipo?: 'danger' | 'warning' | 'info'` - Estilo visual (default: "info")

**Tipos visuais:**
- `danger` - Ações destrutivas (deletar, remover permanentemente) - vermelho
- `warning` - Ações com impacto significativo (aplicar regras em massa) - amarelo
- `info` - Perguntas/confirmações gerais - azul

**Referências:**
- Exemplo completo: [src/components/ListaTags.tsx](src/components/ListaTags.tsx)
- Modal com múltiplos estados: [src/components/ListaRegras.tsx](src/components/ListaRegras.tsx)
- Modal após criar regra: [src/components/BotoesAcaoTransacao.tsx](src/components/BotoesAcaoTransacao.tsx)

### 10. Botão Voltar Padronizado

**REGRA CRÍTICA**: SEMPRE use o componente `<BotaoVoltar>` para navegação de retorno. NUNCA crie botões de voltar customizados.

**Componente padrão**: [src/components/BotaoVoltar.tsx](src/components/BotaoVoltar.tsx)

**Posicionamento**: SEMPRE no canto superior esquerdo da página, antes do título

**Estilo padrão**:
- Fundo cinza: `bg-gray-600 hover:bg-gray-700`
- Texto branco: `text-white`
- Padding: `px-6 py-3`
- Bordas arredondadas: `rounded-lg`
- Transição suave: `transition-colors`

**Comportamento**: Usa `Link` para navegar preservando filtros. Detecta automaticamente a origem (dashboard, transacoes, categoria) através do parâmetro `origem` na URL.

**Como usar**:

```tsx
// ✅ CORRETO: Uso padrão com texto default "← Voltar"
import BotaoVoltar from '@/components/BotaoVoltar';

<div className="mb-4">
  <BotaoVoltar />
</div>

// ✅ CORRETO: Com texto customizado
<div className="mb-4">
  <BotaoVoltar>← Voltar ao Dashboard</BotaoVoltar>
</div>

// ✅ CORRETO: Com classes adicionais (raramente necessário)
<BotaoVoltar className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors mb-2">
  ← Voltar
</BotaoVoltar>

// ❌ ERRADO: Criar botão de voltar customizado
<button onClick={() => router.back()}>Voltar</button>

// ❌ ERRADO: Link direto sem preservar histórico
<Link href="/">Voltar</Link>

// ❌ ERRADO: Estilo diferente do padrão
<BotaoVoltar className="text-blue-600 hover:text-blue-800">
  Voltar
</BotaoVoltar>
```

**Estrutura HTML recomendada em páginas**:

```tsx
export default function MinhaPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Botão Voltar - SEMPRE primeiro */}
        <div className="mb-4">
          <BotaoVoltar />
        </div>

        {/* Header da página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Título da Página</h1>
          <p className="text-gray-600 mt-2">Descrição</p>
        </div>

        {/* Conteúdo */}
      </div>
    </main>
  );
}
```

**Páginas que DEVEM ter BotaoVoltar**:
- ✅ [src/app/tags/page.tsx](src/app/tags/page.tsx)
- ✅ [src/app/regras/page.tsx](src/app/regras/page.tsx)
- ✅ [src/app/importar/page.tsx](src/app/importar/page.tsx)
- ✅ [src/app/configuracoes/page.tsx](src/app/configuracoes/page.tsx)
- ✅ [src/app/transacao/[id]/page.tsx](src/app/transacao/[id]/page.tsx)
- ✅ [src/app/transacoes/page.tsx](src/app/transacoes/page.tsx)
- ✅ [src/app/categoria/[nome]/page.tsx](src/app/categoria/[nome]/page.tsx)

**Páginas que NÃO precisam de BotaoVoltar**:
- ❌ [src/app/page.tsx](src/app/page.tsx) - Dashboard principal
- ❌ Páginas que já têm navegação dedicada no NavegacaoPrincipal

**Props do BotaoVoltar**:
- `children?: React.ReactNode` - Texto do botão (default: "← Voltar")
- `className?: string` - Classes CSS customizadas (raramente necessário)

### 11. Navegação

- Use `<Link>` do Next.js para navegação
- Mantenha URLs semânticas
- Use query params para filtros

### 12. Formatação de Dados

- Use funções utilitárias de `utils/format.ts`
- `formatarMoeda()`: Para valores em R$
- `formatarData()`: Para datas em DD/MM/YYYY
- `formatarMes()`: Para nomes de meses

```typescript
import { formatarMoeda, formatarData } from '@/utils/format';

const valorFormatado = formatarMoeda(1500.50); // "R$ 1.500,50"
const dataFormatada = formatarData('2024-01-15'); // "15/01/2024"
```

## Custom Hooks

### usePeriodo (hooks/usePeriodo.ts)

Gerencia o período selecionado e dia de início com persistência em localStorage:

```typescript
const { periodo, setPeriodo, diaInicio, setDiaInicio } = usePeriodo();

// periodo: string no formato "YYYY-MM"
// diaInicio: número de 1-31 indicando dia de início do mês
```

**Importante**: 
- Sempre verifica `typeof window !== 'undefined'` antes de acessar localStorage
- Valores são sincronizados automaticamente com localStorage via useEffect
- Inicialização usa valores salvos ou defaults (mês atual, dia 1)

## Componentes Reutilizáveis

Ao criar componentes, considere:

### Card
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  {/* conteúdo */}
</div>
```

### Button
```tsx
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
  Texto
</button>
```

### Input
```tsx
<input
  type="text"
  className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

## Configuração de Ambiente

### Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
```

O arquivo `.env` deve conter:
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**IMPORTANTE**: A API backend deve estar rodando em `http://localhost:8000` antes de iniciar o frontend.

## Comunicação com a API

Base URL: `http://localhost:8000` (configurável via `NEXT_PUBLIC_API_URL`)

### Endpoints Principais

- `GET /transacoes`: Lista transações
- `POST /transacoes`: Cria transação
- `PATCH /transacoes/{id}`: Atualiza transação
- `DELETE /transacoes/{id}`: Deleta transação
- `GET /transacoes/resumo/mensal`: Resumo mensal
- `POST /importacao/extrato`: Importa extrato
- `POST /importacao/fatura`: Importa fatura

## Tratamento de Erros

```typescript
try {
  const data = await service.executar();
  toast.success('Operação concluída!');
} catch (error) {
  console.error('Erro:', error);
  toast.error('Erro ao executar operação');
}
```

## Responsividade

- Use grid do Tailwind: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Teste em mobile, tablet e desktop
- Use breakpoints do Tailwind: `sm:`, `md:`, `lg:`, `xl:`

## Acessibilidade

- Use tags semânticas (header, main, nav, etc)
- Adicione labels aos inputs
- Use aria-labels quando necessário
- Garanta contraste adequado

## Performance

- Use `loading.tsx` para estados de loading
- Implemente infinite scroll para listas longas
- Otimize imagens com `next/image`
- Use React.memo para componentes pesados

## Próximas Funcionalidades

Ao adicionar features, considere:
- Página de listagem de transações com filtros
- Formulário de nova transação com validação
- Upload de arquivos (drag & drop)
- Gráficos interativos com Recharts
- Modo escuro (dark mode)
- Exportação de relatórios
- Notificações push
- PWA (Progressive Web App)

## Convenções de Nomenclatura

- **Componentes**: PascalCase (TransacaoCard)
- **Arquivos**: kebab-case (transacao-card.tsx)
- **Funções**: camelCase (formatarMoeda)
- **Constantes**: UPPER_CASE (API_URL)
- **Tipos/Interfaces**: PascalCase (Transacao, ResumoMensal)

## Commits

**IMPORTANTE**: Todos os commits devem seguir o padrão **Conventional Commits** (https://www.conventionalcommits.org/en/v1.0.0/)

**CRÍTICO**: Use sempre o **MCP GitKraken** para fazer commits. NUNCA use comandos git diretamente no terminal.

### Como Fazer Commits

Use as ferramentas MCP do GitKraken:
```
1. mcp_gitkraken_git_add_or_commit - para adicionar arquivos e fazer commit
2. mcp_gitkraken_git_push - para enviar para o repositório remoto
```

### Formato
```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos Comuns
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Mudanças de formatação (sem alteração de código)
- **refactor**: Refatoração de código (sem nova feature ou fix)
- **perf**: Melhorias de performance
- **test**: Adição ou correção de testes
- **build**: Mudanças no sistema de build ou dependências
- **chore**: Tarefas de manutenção

### Exemplos
```bash
feat: adiciona seletor de período customizado
feat(dashboard): implementa gráfico de gastos por categoria
fix: corrige erro de hidratação do React ao usar localStorage
style: ajusta espaçamento dos cards no dashboard
refactor: extrai lógica de formatação para utils
build: atualiza Next.js para versão 14.1
```

### Commits Breaking Changes
Para mudanças que quebram compatibilidade, adicione `!` após o tipo ou `BREAKING CHANGE:` no rodapé:
```bash
feat!: migra para App Router do Next.js 14
# ou
feat: atualiza estrutura de pastas

BREAKING CHANGE: Pages Router não é mais suportado
```

## Verificação Pós-Modificação

**CRÍTICO**: Após QUALQUER modificação no código:

1. **Execute em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Verifique no terminal**:
   - Sem erros de compilação TypeScript
   - Sem erros de build do Next.js
   - Servidor iniciou corretamente

3. **Teste no navegador**:
   - Acesse http://localhost:3000
   - Navegue pelas páginas modificadas
   - Teste interações (formulários, botões, etc)
   - Verifique console do navegador (F12)

4. **Verifique integração com API**:
   - API deve estar rodando
   - Requests devem funcionar
   - Dados devem ser exibidos corretamente

**Nunca deixe código quebrado sem testar!**

## Boas Práticas

1. **Sempre use TypeScript** - Tipagem previne bugs
2. **Prefira Server Components** - Melhor performance e SEO
3. **Estado na URL** - Permite compartilhamento e bookmarks
4. **Componentize** - Reutilize código
5. **Separe lógica de UI** - Use hooks customizados
6. **Feedback visual** - Loading, erros, sucesso
7. **Validação** - Cliente e servidor
8. **Mensagens claras** - Para o usuário
9. **Código limpo** - Legível e manutenível
10. **Teste imediatamente** - Execute em dev mode após cada mudança
11. **Testes** - Considere adicionar testes

## Exemplos de Implementação

### Exemplo 1: Server Component com filtros na URL (PREFERIDO)

```tsx
// app/transacoes/page.tsx
import { transacoesService } from '@/services/api.service';
import { ListaTransacoes } from '@/components/ListaTransacoes';
import { FiltrosTransacoes } from '@/components/FiltrosTransacoes';

interface PageProps {
  searchParams: {
    categoria?: string;
    mes?: string;
    ano?: string;
  };
}

export default async function TransacoesPage({ searchParams }: PageProps) {
  const transacoes = await transacoesService.listar({
    categoria: searchParams.categoria,
    mes: searchParams.mes ? parseInt(searchParams.mes) : undefined,
    ano: searchParams.ano ? parseInt(searchParams.ano) : undefined,
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Transações</h1>
      <FiltrosTransacoes /> {/* Client Component para interação */}
      <ListaTransacoes transacoes={transacoes} /> {/* Server Component */}
    </main>
  );
}
```

### Exemplo 2: Client Component para UI interativa

```tsx
// components/FiltrosTransacoes.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function FiltrosTransacoes() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoriaChange = (categoria: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoria) {
      params.set('categoria', categoria);
    } else {
      params.delete('categoria');
    }
    router.push(`/transacoes?${params.toString()}`);
  };

  return (
    <select 
      value={searchParams.get('categoria') || ''} 
      onChange={(e) => handleCategoriaChange(e.target.value)}
      className="border rounded-md px-4 py-2"
    >
      <option value="">Todas as categorias</option>
      <option value="alimentacao">Alimentação</option>
      <option value="transporte">Transporte</option>
    </select>
  );
}
```

### Exemplo 3: useState para estado efêmero de UI

```tsx
// components/ModalConfirmacao.tsx
'use client';

import { useState } from 'react';

export function ModalConfirmacao({ onConfirmar }) {
  // ✅ useState OK para estado de UI efêmero
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Excluir</button>
      {isOpen && (
        <dialog className="modal">
          <p>Tem certeza que deseja excluir?</p>
          <button onClick={() => { onConfirmar(); setIsOpen(false); }}>Confirmar</button>
          <button onClick={() => setIsOpen(false)}>Cancelar</button>
        </dialog>
      )}
    </>
  );
}
```
### Exemplo 4: Migração de Client Component para Server Component + Server Actions

**ANTES (Client Component com Axios + router.refresh):**
```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tagsService } from '@/services/api.service';

export default function SeletorTags({ transacaoId, tagsAtuais }) {
  const router = useRouter();
  const [todasTags, setTodasTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tagsService.listar().then(setTodasTags);
  }, []);

  async function removerTag(tagId) {
    setLoading(true);
    await tagsService.removerTag(transacaoId, tagId);
    router.refresh(); // ❌ Revalida Client-side
    setLoading(false);
  }

  return (
    <div>
      {tagsAtuais.map(tag => (
        <button onClick={() => removerTag(tag.id)} disabled={loading}>
          {tag.nome} ✕
        </button>
      ))}
    </div>
  );
}
```

**DEPOIS (Server Component + Server Actions):**
```tsx
// app/transacao/[id]/actions.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function removerTagAction(transacaoId: number, tagId: number) {
  await fetch(`${API_URL}/transacoes/${transacaoId}/tags/${tagId}`, {
    method: 'DELETE',
  });
  revalidatePath(`/transacao/${transacaoId}`); // ✅ Revalida Server-side
}

// components/SeletorTags.tsx (Server Component)
import { removerTagAction } from '@/app/transacao/[id]/actions';

export default function SeletorTags({ transacaoId, tagsAtuais, todasTags }) {
  // ✅ Recebe todasTags via props (buscadas no Server Component pai)
  
  return (
    <div>
      {tagsAtuais.map(tag => (
        <form key={tag.id} action={async () => {
          'use server';
          await removerTagAction(transacaoId, tag.id);
        }}>
          <button type="submit">{tag.nome} ✕</button>
        </form>
      ))}
    </div>
  );
}
```

**Benefícios da migração:**
- ✅ Menos JavaScript no bundle (sem Axios, router, useState, useEffect)
- ✅ Dados buscados no servidor (melhor performance)
- ✅ Revalidação automática com `revalidatePath()`
- ✅ Código mais simples e direto
- ✅ Progressive Enhancement (funciona sem JS)
## Gerenciamento de Configurações

**IMPORTANTE**: Configurações que afetam o comportamento do aplicativo são gerenciadas exclusivamente através da página `/configuracoes`.

### Página de Configurações

- **Rota**: `/configuracoes`
- **Componente**: [src/app/configuracoes/page.tsx](src/app/configuracoes/page.tsx)
- **Formulário**: [src/components/FormularioConfiguracoes.tsx](src/components/FormularioConfiguracoes.tsx)
- **Server Actions**: [src/app/configuracoes/actions.ts](src/app/configuracoes/actions.ts)
- **API Backend**: `POST /configuracoes/` com validações server-side

### Configurações Existentes

1. **`diaInicioPeriodo`** (número 1-28)
   - Define o dia de início do período mensal para cálculos
   - Exemplo: Dia 25 significa período de 25/out até 24/nov
   - Validação: Client-side e server-side (1-28)

2. **`criterio_data_transacao`** (enum)
   - Define como agrupar gastos do cartão de crédito
   - Valores: `data_transacao` ou `data_fatura`
   - Validação: Client-side e server-side (enum válido)

### Padrão para Adicionar Novas Configurações

Ao adicionar uma nova configuração, siga este padrão:

#### 1. Backend - Adicionar Validação

Em `app/routers/configuracoes.py`:

```python
elif configuracao.chave == "nova_configuracao":
    # Validar valor específico
    if configuracao.valor not in ["valor1", "valor2"]:
        raise HTTPException(
            status_code=400,
            detail="nova_configuracao deve ser valor1 ou valor2"
        )
```

#### 2. Frontend - Adicionar Tipo TypeScript

Em [src/types/index.ts](src/types/index.ts):

```typescript
export enum NovaConfigEnum {
  VALOR1 = 'valor1',
  VALOR2 = 'valor2',
}
```

#### 3. Frontend - Atualizar Server Service

Em [src/services/configuracoes.server.ts](src/services/configuracoes.server.ts):

```typescript
async listarTodas(): Promise<Record<string, string>> {
  const [diaInicio, criterio, novaConfig] = await Promise.all([
    this.obter('diaInicioPeriodo'),
    this.obter('criterio_data_transacao'),
    this.obter('nova_configuracao'), // Adicionar aqui
  ]);

  return {
    diaInicioPeriodo: diaInicio.valor || '1',
    criterio_data_transacao: criterio.valor || 'data_transacao',
    nova_configuracao: novaConfig.valor || 'valor1', // Default
  };
}
```

#### 4. Frontend - Criar Server Action

Em [src/app/configuracoes/actions.ts](src/app/configuracoes/actions.ts):

```typescript
export async function salvarNovaConfigAction(valor: string) {
  // Validação client-side
  const valoresValidos = Object.values(NovaConfigEnum);
  if (!valoresValidos.includes(valor as NovaConfigEnum)) {
    throw new Error('Valor inválido para nova_configuracao');
  }

  const res = await fetch(`${API_URL}/configuracoes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chave: 'nova_configuracao',
      valor: valor,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ao salvar: ${error}`);
  }

  revalidatePath('/configuracoes');
  revalidatePath('/'); // Se afetar dashboard
  return { success: true };
}
```

#### 5. Frontend - Adicionar ao Formulário

Em [src/components/FormularioConfiguracoes.tsx](src/components/FormularioConfiguracoes.tsx):

```tsx
interface FormularioConfiguracoesProps {
  diaInicioPeriodo: number;
  criterioDataTransacao: string;
  novaConfiguracao: string; // Adicionar prop
}

// Adicionar nova seção no JSX:
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-2">
    Título da Nova Configuração
  </h2>
  <p className="text-gray-600 mb-6">
    Descrição detalhada do que essa configuração faz e como afeta o app.
  </p>
  
  <form onSubmit={handleSalvarNovaConfig}>
    {/* Campos: select, radio, input, etc */}
    <button type="submit" disabled={isPending}>
      {isPending ? 'Salvando...' : 'Salvar'}
    </button>
  </form>
</div>
```

#### 6. Frontend - Atualizar Página de Configurações

Em [src/app/configuracoes/page.tsx](src/app/configuracoes/page.tsx):

```tsx
<FormularioConfiguracoes 
  diaInicioPeriodo={parseInt(configuracoes.diaInicioPeriodo)}
  criterioDataTransacao={configuracoes.criterio_data_transacao}
  novaConfiguracao={configuracoes.nova_configuracao} // Passar prop
/>
```

### Regras Importantes

1. **NUNCA adicione controles de configuração inline em outros componentes** - sempre use `/configuracoes`
2. **Sempre valide tanto client-side quanto server-side**
3. **Use `revalidatePath()` após salvar para atualizar a UI**
4. **Adicione descrições claras** explicando o propósito de cada configuração
5. **Use enums TypeScript** para valores fixos
6. **Valores padrão** devem estar em `listarTodas()` do server service
7. **Feedback visual** com `isPending` para desabilitar botões durante salvamento

### Visualização de Configurações em Outras Páginas

Se uma configuração precisa ser **visualizada** (mas não editada) em outra página:

```tsx
// ✅ CORRETO: Apenas visualização, sem controles
<p className="text-sm text-gray-500">
  📅 Gastos do cartão mostrados na data da transação
</p>

// ❌ ERRADO: Controles inline (select, radio, etc)
<select onChange={handleChange}>...</select>
```

Exemplo em [src/components/FiltrosPeriodo.tsx](src/components/FiltrosPeriodo.tsx):
- ✅ Mostra período calculado: "25 de out. até 24 de nov."
- ✅ Mostra critério atual: "📅 Gastos do cartão mostrados na data da transação"
- ❌ NÃO tem controles para alterar (removidos)
