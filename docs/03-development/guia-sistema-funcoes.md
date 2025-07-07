# Guia de Desenvolvimento - Sistema de Funções

## Visão Geral Técnica

Este guia documenta a implementação técnica do sistema de funções, fornecendo informações essenciais para desenvolvedores que precisam entender, manter ou estender o sistema.

## Arquitetura do Sistema

### 1. Stack Tecnológico
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Estado**: React Query (TanStack Query)
- **Validação**: Zod + TypeScript
- **UI**: Tailwind CSS + Lucide Icons + Framer Motion

### 2. Estrutura de Pastas
```
├── app/api/functions/              # API endpoints
│   ├── route.ts                    # GET /api/functions, POST /api/functions
│   └── [id]/route.ts              # GET, PUT, DELETE /api/functions/[id]
├── components/functions/           # Componentes UI
│   ├── FunctionsTab.tsx           # Container principal
│   ├── FunctionModal.tsx          # Modal criar/editar
│   ├── FunctionViewModal.tsx      # Modal visualização
│   ├── FunctionSelector.tsx       # Seletor para formulários
│   ├── FunctionsList.tsx          # Lista/tabela
│   ├── FunctionFilters.tsx        # Filtros avançados
│   └── FunctionStats.tsx          # Estatísticas
├── lib/useFunctions.ts             # Hooks e tipos
└── prisma/schema.prisma            # Modelo de dados
```

## Implementação Backend

### 1. Modelo de Dados (Prisma)

```prisma
// Enum para tipo de mão de obra
enum LaborType {
  DIRETO    // Mão de obra direta
  INDIRETO  // Mão de obra indireta
}

// Modelo principal de funções
model CompanyFunction {
  id          String    @id @default(cuid())
  name        String    @unique // Nome único da função
  laborType   LaborType // Tipo de mão de obra
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relacionamentos
  employees   Employee[] @relation("EmployeeCompanyFunction")
}

// Relacionamento com Employee
model Employee {
  // ... outros campos
  companyFunctionId String?
  companyFunction   CompanyFunction? @relation("EmployeeCompanyFunction", fields: [companyFunctionId], references: [id])
}
```

### 2. API Endpoints

#### GET /api/functions
```typescript
// Parâmetros de query suportados
interface QueryParams {
  search?: string;           // Busca por nome
  laborType?: 'DIRETO' | 'INDIRETO'; // Filtro por tipo
  isActive?: 'true' | 'false';       // Filtro por status
}

// Resposta
interface Response {
  id: string;
  name: string;
  laborType: 'DIRETO' | 'INDIRETO';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    employees: number;
  };
}[]
```

#### POST /api/functions
```typescript
// Body da requisição
interface CreateFunctionRequest {
  name: string;              // Obrigatório, único
  laborType: 'DIRETO' | 'INDIRETO'; // Obrigatório
}

// Validações aplicadas:
// - Nome único (case-insensitive)
// - Nome convertido para maiúsculas
// - LaborType deve ser enum válido
```

#### PUT /api/functions/[id]
```typescript
// Body da requisição
interface UpdateFunctionRequest {
  name?: string;             // Opcional
  laborType?: 'DIRETO' | 'INDIRETO'; // Opcional
  isActive?: boolean;        // Opcional
}

// Validações aplicadas:
// - ID deve existir
// - Nome único se fornecido
// - Não permite inativar função com funcionários ativos
```

#### DELETE /api/functions/[id]
```typescript
// Validações aplicadas:
// - ID deve existir
// - Função não pode ter funcionários associados
// - Retorna erro 400 se houver dependências
```

### 3. Validações de Segurança

```typescript
// Middleware de autenticação (aplicado em todas as rotas)
function validateAuth(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Validação de permissões para mutações
function validatePermissions(user: User, action: 'CREATE' | 'UPDATE' | 'DELETE') {
  if (!validateUserAccess(user, 'MANAGE_EMPLOYEES')) {
    throw new Error('Insufficient permissions');
  }
}

// Sanitização de entrada
function sanitizeInput(data: any) {
  return {
    ...data,
    name: data.name?.trim().toUpperCase(),
    laborType: data.laborType?.toUpperCase()
  };
}
```

## Implementação Frontend

### 1. Hooks de Estado (React Query)

```typescript
// lib/useFunctions.ts

// Hook para listagem com filtros
export function useFunctionsQuery(filters: FunctionFilters = {}) {
  return useQuery({
    queryKey: ['functions', filters],
    queryFn: () => fetchFunctions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para mutação de criação
export function useCreateFunction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['functions'] });
      toast.success('Função criada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar função: ${error.message}`);
    },
  });
}

// Hook para estatísticas
export function useFunctionStats() {
  return useQuery({
    queryKey: ['function-stats'],
    queryFn: fetchFunctionStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
```

### 2. Componente Principal (FunctionsTab)

```typescript
// components/functions/FunctionsTab.tsx

export default function FunctionsTab({ currentUser }: FunctionsTabProps) {
  // Estados locais
  const [filters, setFilters] = useState<FunctionFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<CompanyFunction | null>(null);

  // Permissões
  const canManage = validateUserAccess(currentUser, 'MANAGE_EMPLOYEES');

  // Queries
  const { data: functions = [], isLoading } = useFunctionsQuery(filters);
  
  // Mutations
  const createMutation = useCreateFunction();
  const updateMutation = useUpdateFunction();
  const deleteMutation = useDeleteFunction();

  // Handlers
  const handleCreateFunction = async (data: CreateFunctionData) => {
    await createMutation.mutateAsync(data);
    setShowCreateModal(false);
  };

  // Render condicional baseado em permissões
  return (
    <div className="space-y-6">
      {/* Header com controles baseados em permissão */}
      {/* Estatísticas */}
      {/* Filtros */}
      {/* Lista */}
      {/* Modais */}
    </div>
  );
}
```

### 3. Componente de Seleção (FunctionSelector)

```typescript
// components/functions/FunctionSelector.tsx

export default function FunctionSelector({
  value,
  onChange,
  error,
  required = false,
  disabled = false
}: FunctionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Busca funções ativas com filtro de busca
  const { data: functions = [] } = useFunctionsQuery({ 
    isActive: true,
    search: searchTerm 
  });

  const selectedFunction = functions.find(func => func.id === value);

  const handleSelect = (func: CompanyFunction | null) => {
    onChange(func?.id || null, func);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Campo de seleção com preview */}
      {/* Dropdown com busca */}
      {/* Lista de opções */}
      {/* Overlay para fechar */}
    </div>
  );
}
```

### 4. Integração com Formulários

```typescript
// components/employees/EmployeeAddModal.tsx

// No step profissional (step 4)
<FunctionSelector
  value={formData.companyFunctionId || ''}
  onChange={(functionId, functionData) => {
    setFormData(prev => ({ 
      ...prev, 
      companyFunctionId: functionId,
      cargo: functionData?.name || '',
      mo: functionData?.laborType || ''
    }));
    // Limpar erro se existir
    if (errors.cargo) {
      setErrors(prev => ({ ...prev, cargo: '' }));
    }
  }}
  error={errors.cargo}
  placeholder="Selecione uma função"
  required={true}
/>
```

## Padrões de Código

### 1. Convenções de Nomenclatura

```typescript
// Interfaces - PascalCase com sufixos descritivos
interface CompanyFunction { }
interface CreateFunctionData { }
interface FunctionFilters { }

// Componentes - PascalCase
export default function FunctionModal() { }

// Hooks - camelCase com prefixo 'use'
export function useFunctionsQuery() { }

// Funções utilitárias - camelCase
function validateFunction() { }

// Constantes - SCREAMING_SNAKE_CASE
const LABOR_TYPE_OPTIONS = [ ];
```

### 2. Estrutura de Componentes

```typescript
// Padrão para componentes funcionais
export default function ComponentName({
  prop1,
  prop2,
  ...props
}: ComponentProps) {
  // 1. Estados locais
  const [state, setState] = useState();
  
  // 2. Hooks externos
  const { data } = useQuery();
  const mutation = useMutation();
  
  // 3. Efeitos
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  // 4. Handlers
  const handleAction = useCallback(() => {
    // handler logic
  }, [dependencies]);
  
  // 5. Early returns
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  // 6. Render principal
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 3. Tratamento de Erros

```typescript
// Padrão para APIs
export async function createFunction(data: CreateFunctionData) {
  try {
    const response = await fetch('/api/functions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar função');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na API createFunction:', error);
    throw error;
  }
}

// Padrão para componentes
const handleSubmit = async (data: FormData) => {
  try {
    setIsLoading(true);
    await createFunction(data);
    toast.success('Função criada com sucesso!');
    onClose();
  } catch (error) {
    console.error('Erro ao criar função:', error);
    toast.error(error.message || 'Erro inesperado');
  } finally {
    setIsLoading(false);
  }
};
```

## Testes e Debugging

### 1. Debugging Frontend

```typescript
// Logs estruturados para debugging
console.log('=== FUNCTION SELECTOR DEBUG ===');
console.log('Selected function ID:', value);
console.log('Available functions:', functions);
console.log('Search term:', searchTerm);
console.log('Is loading:', isLoading);

// React Query Devtools (development)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Adicionar ao app para debugging de queries
<ReactQueryDevtools initialIsOpen={false} />
```

### 2. Debugging Backend

```typescript
// Logs estruturados para APIs
console.log('=== API FUNCTIONS DEBUG ===');
console.log('Method:', req.method);
console.log('Query params:', req.url);
console.log('Body:', await req.json());
console.log('User:', getCurrentUser(req));

// Middleware de logging
function logRequest(req: NextRequest) {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
}
```

### 3. Validação de Tipos

```typescript
// Uso do Zod para validação runtime
import { z } from 'zod';

const CreateFunctionSchema = z.object({
  name: z.string().min(2).max(100),
  laborType: z.enum(['DIRETO', 'INDIRETO']),
});

// Validação em APIs
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validatedData = CreateFunctionSchema.parse(body);
  // ... resto da lógica
}
```

## Performance e Otimizações

### 1. Otimizações de Query

```typescript
// Debounce para busca
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

const { data: functions } = useFunctionsQuery({
  search: debouncedSearch, // Usa valor debounced
});

// Prefetch para melhor UX
const queryClient = useQueryClient();

const handleMouseEnter = (functionId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['function', functionId],
    queryFn: () => fetchFunction(functionId),
  });
};
```

### 2. Memoização

```typescript
// Memoização de computações pesadas
const filteredFunctions = useMemo(() => {
  return functions.filter(func => {
    if (filters.search && !func.name.includes(filters.search)) return false;
    if (filters.laborType && func.laborType !== filters.laborType) return false;
    if (filters.isActive !== undefined && func.isActive !== filters.isActive) return false;
    return true;
  });
}, [functions, filters]);

// Memoização de componentes
const FunctionCard = memo(({ function: func }: { function: CompanyFunction }) => {
  return <div>{func.name}</div>;
});
```

### 3. Lazy Loading

```typescript
// Componentes carregados sob demanda
const FunctionModal = lazy(() => import('./FunctionModal'));
const FunctionViewModal = lazy(() => import('./FunctionViewModal'));

// Uso com Suspense
<Suspense fallback={<Loading />}>
  {showModal && <FunctionModal />}
</Suspense>
```

## Deploy e Ambiente

### 1. Variáveis de Ambiente

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Migrações

```bash
# Gerar migração
npx prisma migrate dev --name add_company_function_model

# Aplicar em produção
npx prisma migrate deploy

# Reset (desenvolvimento)
npx prisma migrate reset
```

### 3. Build e Deploy

```bash
# Build local
npm run build

# Verificar tipos
npm run type-check

# Lint
npm run lint

# Deploy (exemplo Vercel)
vercel --prod
```

## Troubleshooting Comum

### 1. Problemas de Cache

```typescript
// Forçar refetch
queryClient.invalidateQueries({ queryKey: ['functions'] });

// Limpar cache específico
queryClient.removeQueries({ queryKey: ['function', functionId] });

// Reset completo
queryClient.clear();
```

### 2. Problemas de Estado

```typescript
// Debug de estado React Query
const { data, isLoading, error, isFetching } = useFunctionsQuery();

console.log('Query state:', {
  data: data?.length,
  isLoading,
  error: error?.message,
  isFetching
});
```

### 3. Problemas de Permissão

```typescript
// Debug de permissões
const user = getCurrentUser();
const canManage = validateUserAccess(user, 'MANAGE_EMPLOYEES');

console.log('User permissions:', {
  user: user?.email,
  role: user?.role,
  canManage
});
```

## Extensões Futuras

### 1. Novos Endpoints

```typescript
// Exemplo: Endpoint para estatísticas avançadas
// GET /api/functions/analytics
interface FunctionAnalytics {
  totalFunctions: number;
  byLaborType: Record<LaborType, number>;
  employeeDistribution: Array<{
    functionId: string;
    functionName: string;
    employeeCount: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    created: number;
  }>;
}
```

### 2. Novos Componentes

```typescript
// Exemplo: Componente de hierarquia
interface FunctionHierarchy {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  children: FunctionHierarchy[];
}

export function FunctionHierarchyTree({ functions }: Props) {
  // Implementação de árvore hierárquica
}
```

### 3. Integrações

```typescript
// Exemplo: Integração com sistema de competências
interface FunctionCompetency {
  functionId: string;
  competencyId: string;
  requiredLevel: 1 | 2 | 3 | 4 | 5;
  isRequired: boolean;
}

// Hook para competências por função
export function useFunctionCompetencies(functionId: string) {
  return useQuery({
    queryKey: ['function-competencies', functionId],
    queryFn: () => fetchFunctionCompetencies(functionId),
  });
}
```

## Conclusão

Este guia fornece uma base sólida para entender e trabalhar com o sistema de funções. A arquitetura modular e os padrões estabelecidos facilitam a manutenção e extensão do sistema conforme novas necessidades surgirem.

Para dúvidas específicas ou implementação de novas funcionalidades, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento. 