---
applyTo: "frontend/**"
description: "Instruções de arquitetura e padrões para o frontend Next.js"
name: "Frontend - Finanças Pessoais"
---

# Instruções para o GitHub Copilot - Frontend de Finanças Pessoais

## Contexto do Projeto

Este é o frontend de uma aplicação de gerenciamento de finanças pessoais, construído com:

- **Next.js 14+**: Framework React com App Router (Server Components)
- **TypeScript**: Tipagem estática obrigatória
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Cliente HTTP para comunicação com API
- **React Hook Form**: Gerenciamento de formulários com validação
- **Recharts**: Biblioteca de gráficos responsivos
- **React Hot Toast**: Notificações toast
- **date-fns**: Manipulação de datas
- **Jest + Testing Library**: Framework de testes (cobertura mínima 80%)

## Arquitetura e Estrutura

```
src/
├── app/                    # App Router (Next.js 14+)
│   ├── page.tsx            # Dashboard principal (Server Component)
│   ├── layout.tsx          # Layout raiz com providers
│   ├── globals.css         # Estilos globais e Tailwind
│   ├── transacoes/         # Rotas de transações
│   ├── importar/           # Rotas de importação
│   └── configuracoes/      # Rotas de configurações
├── components/             # Componentes reutilizáveis
│   ├── Dashboard/          # Componentes do dashboard
│   ├── Transacao/          # Componentes de transações
│   ├── Forms/              # Formulários reutilizáveis
│   └── UI/                 # Componentes de UI base
├── services/               # Camada de serviços
│   └── api.service.ts      # Cliente API (Axios)
├── hooks/                  # Custom React Hooks
│   └── usePeriodo.ts       # Hook de período com localStorage
├── types/                  # Definições TypeScript
│   └── index.ts            # Tipos principais (espelham backend)
├── utils/                  # Funções utilitárias
│   └── format.ts           # Formatação (datas, moedas)
└── lib/                    # Configurações
    └── api.ts              # Setup do Axios
```

## Princípios Fundamentais

### 1. Server Components First (Next.js App Router)

**REGRA DE OURO**: Use **Server Components** por padrão. Adicione `"use client"` APENAS quando absolutamente necessário.

#### ✅ Use Server Components para:

- **Buscar dados do servidor** (fetch API, database)
- **Renderizar conteúdo estático** ou baseado em dados
- **Reduzir bundle JavaScript** do cliente
- **Acessar recursos backend** (secrets, APIs)
- **Componentes sem interatividade**

```typescript
// ✅ PERFEITO: Server Component busca dados
export default async function TransacoesPage({ searchParams }: PageProps) {
  const { mes, ano } = searchParams;
  const transacoes = await fetch(`${API_URL}/transacoes?mes=${mes}&ano=${ano}`);

  return <ListaTransacoes transacoes={transacoes} />;
}

// ✅ PERFEITO: Componente sem interatividade
export default function TransacaoCard({ transacao }: Props) {
  return (
    <div>
      <h3>{transacao.descricao}</h3>
      <p>{formatarMoeda(transacao.valor)}</p>
    </div>
  );
}
```

#### ❌ Use Client Components APENAS quando precisar de:

1. **Hooks de estado**: `useState`, `useReducer`, `useEffect`
2. **Event handlers**: `onClick`, `onChange`, `onSubmit`
3. **Browser APIs**: `localStorage`, `window`, `document`
4. **Hooks de navegação**: `useRouter`, `useSearchParams`, `usePathname`
5. **Bibliotecas client-only**: React Hook Form, bibliotecas de animação

```typescript
// ✅ Client Component necessário: usa useState e onClick
"use client";

export default function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return <button onClick={() => setIsOpen(!isOpen)}>Menu</button>;
}

// ✅ Client Component necessário: usa localStorage
("use client");

export function usePeriodo() {
  const [periodo, setPeriodo] = useState(() => {
    if (typeof window === "undefined") return { mes: 1, ano: 2024 };
    return JSON.parse(localStorage.getItem("periodo") || "{}");
  });

  // ...
}
```

#### 🎯 Estratégia: Composição Server + Client

**MELHOR PRÁTICA**: Mantenha Client Components pequenos e focados. Use Server Components como wrapper.

```typescript
// ✅ EXCELENTE: Server Component wrapper
export default async function PaginaTransacao({ params }: Props) {
  // Busca dados no servidor
  const transacao = await fetchTransacao(params.id);
  const tags = await fetchTags();

  return (
    <main>
      {/* Server Components para conteúdo estático */}
      <Header titulo={transacao.descricao} />
      <DetalhesTransacao transacao={transacao} />

      {/* Client Component APENAS para interatividade */}
      <SeletorTags
        transacaoId={transacao.id}
        tagsAtuais={transacao.tags}
        todasTags={tags}  // Dados do servidor
      />
    </main>
  );
}

// Client Component pequeno e focado
'use client';

export function SeletorTags({ transacaoId, tagsAtuais, todasTags }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  // Apenas lógica de UI interativa
  return (/* ... */);
}
```

#### ❌ Anti-padrões Comuns

```typescript
// ❌ ERRADO: Buscar dados em Client Component com useEffect
"use client";

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    fetch("/api/transacoes").then((res) => setTransacoes(res.json()));
  }, []);

  return <Lista items={transacoes} />;
}

// ✅ CORRETO: Buscar dados em Server Component
export default async function Transacoes() {
  const transacoes = await fetch("/api/transacoes").then((r) => r.json());
  return <Lista items={transacoes} />;
}
```

### 2. Type Safety com TypeScript

**Tipagem obrigatória** em todas as funções, componentes e variáveis.

```typescript
// ✅ Props tipadas com interface
interface TransacaoCardProps {
  transacao: Transacao;
  onEditar?: (id: number) => void;
  className?: string;
}

export default function TransacaoCard({
  transacao,
  onEditar,
  className,
}: TransacaoCardProps) {
  // ...
}

// ✅ Funções utilitárias tipadas
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// ✅ Custom hooks tipados
export function usePeriodo(): {
  periodo: Periodo;
  setPeriodo: (p: Periodo) => void;
  diaInicio: number;
  setDiaInicio: (dia: number) => void;
} {
  // ...
}
```

#### Tipos Principais (espelham backend)

```typescript
// types/index.ts
export type TipoTransacao = "ENTRADA" | "SAIDA";

export type Categoria =
  | "ALIMENTACAO"
  | "TRANSPORTE"
  | "LAZER"
  | "SAUDE"
  | "MORADIA"
  | "EDUCACAO"
  | "OUTROS";

export interface Transacao {
  id: number;
  data: string; // ISO format: "2024-01-15"
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria?: Categoria;
  origem: string;
  observacoes?: string;
  tags?: Tag[];
}

export interface ResumoMensal {
  mes: number;
  ano: number;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  entradas_por_categoria: Record<Categoria, number>;
  saidas_por_categoria: Record<Categoria, number>;
}

export interface Tag {
  id: number;
  nome: string;
  cor?: string;
}
```

### 3. Camada de Serviços (API Client)

**SEMPRE** use a camada de serviços para chamadas API. Não faça `fetch` direto nos componentes.

```typescript
// services/api.service.ts
import { api } from "@/lib/api"; // Axios instance
import type { Transacao, ResumoMensal, Tag } from "@/types";

export const transacoesService = {
  async listar(params?: {
    mes?: number;
    ano?: number;
    data_inicio?: string;
    data_fim?: string;
    categoria?: Categoria;
  }): Promise<Transacao[]> {
    const { data } = await api.get<Transacao[]>("/transacoes", { params });
    return data;
  },

  async criar(transacao: Omit<Transacao, "id">): Promise<Transacao> {
    const { data } = await api.post<Transacao>("/transacoes", transacao);
    return data;
  },

  async atualizar(
    id: number,
    transacao: Partial<Transacao>
  ): Promise<Transacao> {
    const { data } = await api.patch<Transacao>(`/transacoes/${id}`, transacao);
    return data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/transacoes/${id}`);
  },

  async obterResumo(mes: number, ano: number): Promise<ResumoMensal> {
    const { data } = await api.get<ResumoMensal>("/transacoes/resumo/mensal", {
      params: { mes, ano },
    });
    return data;
  },
};

export const tagsService = {
  async listar(): Promise<Tag[]> {
    const { data } = await api.get<Tag[]>("/tags");
    return data;
  },

  async adicionarATransacao(transacaoId: number, tagId: number): Promise<void> {
    await api.post(`/transacoes/${transacaoId}/tags/${tagId}`);
  },
};
```

**Configuração do Axios:**

```typescript
// lib/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para tratamento de erros global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logging, toast de erro, etc.
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
```

### 4. Gerenciamento de Estado

#### Estado Local (useState)

Para estado simples de UI (dropdowns, modais, toggles):

```typescript
"use client";

export function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

#### Estado Persistente (localStorage)

Para dados que devem persistir entre sessões:

```typescript
"use client";

export function usePeriodo() {
  const [periodo, setPeriodo] = useState<Periodo>(() => {
    // SSR safety check
    if (typeof window === "undefined") {
      return { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() };
    }

    const saved = localStorage.getItem("periodo");
    return saved ? JSON.parse(saved) : { mes: 1, ano: 2024 };
  });

  useEffect(() => {
    localStorage.setItem("periodo", JSON.stringify(periodo));
  }, [periodo]);

  return { periodo, setPeriodo };
}
```

**IMPORTANTE: SSR Safety**

- Sempre verifique `typeof window !== 'undefined'` antes de acessar `localStorage`
- Use lazy initialization no `useState` para evitar erros de hidratação

#### Estado do Servidor (Server Components)

Para dados da API, prefira buscar em Server Components:

```typescript
// ✅ PREFERIDO: Server Component
export default async function Dashboard() {
  const resumo = await transacoesService.obterResumo(1, 2024);
  return <ResumoCard resumo={resumo} />;
}

// ❌ EVITE: Client Component com useEffect
("use client");

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    transacoesService.obterResumo(1, 2024).then(setResumo);
  }, []);

  return resumo ? <ResumoCard resumo={resumo} /> : <Loading />;
}
```

### 5. Formulários com React Hook Form

```typescript
"use client";

import { useForm } from "react-hook-form";
import { transacoesService } from "@/services/api.service";
import toast from "react-hot-toast";

interface TransacaoFormData {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria?: Categoria;
  data: string;
}

export default function FormTransacao() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransacaoFormData>();

  const onSubmit = async (data: TransacaoFormData) => {
    try {
      await transacoesService.criar({
        ...data,
        origem: "MANUAL",
      });
      toast.success("Transação criada com sucesso!");
      // Revalidar/redirecionar
    } catch (error) {
      toast.error("Erro ao criar transação");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("descricao", { required: "Descrição é obrigatória" })}
        placeholder="Descrição"
      />
      {errors.descricao && <span>{errors.descricao.message}</span>}

      <input
        type="number"
        step="0.01"
        {...register("valor", {
          required: "Valor é obrigatório",
          min: { value: 0.01, message: "Valor deve ser maior que zero" },
        })}
        placeholder="Valor"
      />
      {errors.valor && <span>{errors.valor.message}</span>}

      <select {...register("tipo", { required: true })}>
        <option value="ENTRADA">Entrada</option>
        <option value="SAIDA">Saída</option>
      </select>

      <button type="submit">Criar</button>
    </form>
  );
}
```

### 6. Tratamento de Erros e Feedback

```typescript
"use client";

import toast from "react-hot-toast";

export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  successMessage?: string
): Promise<T | null> {
  try {
    const result = await apiCall();
    if (successMessage) {
      toast.success(successMessage);
    }
    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      toast.error("Recurso não encontrado");
    } else if (error.response?.status === 400) {
      toast.error(error.response.data.detail || "Dados inválidos");
    } else {
      toast.error("Erro ao processar requisição");
    }
    console.error("API Error:", error);
    return null;
  }
}

// Uso
const transacao = await handleApiCall(
  () => transacoesService.criar(data),
  "Transação criada com sucesso!"
);
```

### 7. Styling com Tailwind CSS

**Use classes utilitárias do Tailwind. Evite CSS inline ou CSS modules.**

```typescript
// ✅ CORRETO: Tailwind classes
export default function Card({ children }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {children}
    </div>
  );
}

// ✅ Classes condicionais com template literals
export function Badge({ tipo }: { tipo: TipoTransacao }) {
  return (
    <span
      className={`
      px-3 py-1 rounded-full text-sm font-medium
      ${
        tipo === "ENTRADA"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }
    `}
    >
      {tipo}
    </span>
  );
}

// ✅ Variantes complexas com objeto
const badgeVariants = {
  ENTRADA: "bg-green-100 text-green-800",
  SAIDA: "bg-red-100 text-red-800",
};

export function Badge({ tipo }: { tipo: TipoTransacao }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${badgeVariants[tipo]}`}
    >
      {tipo}
    </span>
  );
}
```

### 8. Formatação e Utilitários

```typescript
// utils/format.ts

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: string | Date): string {
  const date = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatarDataISO(data: Date): string {
  return data.toISOString().split("T")[0]; // "2024-01-15"
}

export function calcularPeriodo(
  mes: number,
  ano: number,
  diaInicio: number = 1
): {
  data_inicio: string;
  data_fim: string;
} {
  const inicio = new Date(ano, mes - 1, diaInicio);
  const fim = new Date(ano, mes, diaInicio - 1);

  return {
    data_inicio: formatarDataISO(inicio),
    data_fim: formatarDataISO(fim),
  };
}
```

### 9. Testes

**Cobertura mínima: 80%**

```typescript
// __tests__/components/TransacaoCard.test.tsx
import { render, screen } from "@testing-library/react";
import TransacaoCard from "@/components/Transacao/TransacaoCard";

describe("TransacaoCard", () => {
  const mockTransacao: Transacao = {
    id: 1,
    descricao: "Salário",
    valor: 5000,
    tipo: "ENTRADA",
    categoria: "OUTROS",
    data: "2024-01-15",
    origem: "MANUAL",
  };

  it("deve renderizar corretamente", () => {
    render(<TransacaoCard transacao={mockTransacao} />);

    expect(screen.getByText("Salário")).toBeInTheDocument();
    expect(screen.getByText("R$ 5.000,00")).toBeInTheDocument();
  });

  it("deve aplicar classe correta para entrada", () => {
    const { container } = render(<TransacaoCard transacao={mockTransacao} />);
    expect(container.querySelector(".text-green-600")).toBeInTheDocument();
  });
});

// __tests__/services/api.service.test.ts
import { transacoesService } from "@/services/api.service";
import { api } from "@/lib/api";

jest.mock("@/lib/api");

describe("transacoesService", () => {
  it("deve listar transações", async () => {
    const mockTransacoes = [mockTransacao];
    (api.get as jest.Mock).mockResolvedValue({ data: mockTransacoes });

    const result = await transacoesService.listar({ mes: 1, ano: 2024 });

    expect(api.get).toHaveBeenCalledWith("/transacoes", {
      params: { mes: 1, ano: 2024 },
    });
    expect(result).toEqual(mockTransacoes);
  });
});
```

### 10. Convenções de Nomenclatura

- **Componentes**: PascalCase (`TransacaoCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`usePeriodo.ts`)
- **Utilitários**: camelCase (`formatarMoeda`)
- **Tipos/Interfaces**: PascalCase (`Transacao`, `TipoTransacao`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Arquivos de páginas**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

## Checklist para Novos Componentes

- [ ] Determinar se é Server ou Client Component (padrão: Server)
- [ ] Adicionar `"use client"` apenas se necessário
- [ ] Definir interface TypeScript para props
- [ ] Usar Tailwind CSS para estilos
- [ ] Extrair lógica reutilizável em hooks/utils
- [ ] Adicionar tratamento de erros
- [ ] Escrever testes (mínimo 80% cobertura)
- [ ] Validar acessibilidade (a11y)
- [ ] Testar responsividade (mobile/desktop)

## Ferramentas de Desenvolvimento

- **Dev server**: `npm run dev` (http://localhost:3000)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Testes**: `npm run test`
- **Cobertura**: `npm run test:coverage`

## Observações Importantes

1. **SEMPRE** prefira Server Components sobre Client Components
2. **NÃO** busque dados com `useEffect` em Client Components
3. **USE** a camada de serviços para todas as chamadas API
4. **VALIDE** tipos TypeScript em todos os componentes
5. **TESTE** componentes e hooks (mínimo 80% cobertura)
6. **VERIFIQUE** SSR safety ao usar browser APIs
7. **FORMATE** datas e moedas com funções utilitárias
8. **NOTIFIQUE** usuário com toasts em ações importantes

## Recursos Adicionais

- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Testing Library**: https://testing-library.com/react
