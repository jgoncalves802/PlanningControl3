# Sistema de Funções e Cargos

## Visão Geral

O Sistema de Funções permite gerenciar as funções/cargos da empresa e associá-las aos funcionários, incluindo classificação por tipo de mão de obra (Direta/Indireta). Este sistema oferece controle completo sobre as funções organizacionais e facilita a gestão de recursos humanos.

## Localização

O sistema está integrado na página de **Funcionários** (`/dashboard/employees`) através de um sistema de abas:
- **Aba "Funcionários"**: Gestão de funcionários (existente)
- **Aba "Funções"**: Gestão de funções e cargos (novo)

## Funcionalidades Principais

### 1. Gerenciamento de Funções

#### 1.1 Criar Nova Função
- **Acesso**: Botão "Nova Função" na aba Funções
- **Campos obrigatórios**:
  - Nome da função (único, convertido automaticamente para maiúsculas)
  - Tipo de mão de obra (Direta/Indireta)
- **Validações**:
  - Nome único no sistema
  - Comprimento entre 2-100 caracteres
  - Tipo de mão de obra obrigatório

#### 1.2 Editar Função
- **Acesso**: Botão "Editar" na lista de funções ou modal de visualização
- **Campos editáveis**:
  - Nome da função
  - Tipo de mão de obra
  - Status (Ativo/Inativo)
- **Restrições**: Não é possível excluir funções com funcionários associados

#### 1.3 Visualizar Função
- **Acesso**: Botão "Visualizar" na lista de funções
- **Informações exibidas**:
  - Dados básicos da função
  - Tipo de mão de obra com descrição
  - Número de funcionários associados
  - Informações de auditoria (criação/atualização)
  - Status atual

#### 1.4 Excluir Função
- **Acesso**: Botão "Excluir" (apenas para funções sem funcionários)
- **Validações**: Impede exclusão de funções com funcionários associados
- **Confirmação**: Solicitada antes da exclusão

### 2. Classificação de Mão de Obra

#### 2.1 Mão de Obra Direta
- **Definição**: Funções operacionais, diretamente envolvidas na produção
- **Exemplos**: Pedreiro, Soldador, Operador de Máquinas
- **Cor de identificação**: Laranja
- **Código**: `DIRETO`

#### 2.2 Mão de Obra Indireta
- **Definição**: Funções administrativas ou de suporte
- **Exemplos**: Engenheiro Civil, Supervisor, Assistente Administrativo
- **Cor de identificação**: Azul
- **Código**: `INDIRETO`

### 3. Integração com Funcionários

#### 3.1 Seleção de Função
- **Local**: Formulários de criação/edição de funcionários (Step 4: Profissional)
- **Componente**: `FunctionSelector` com busca e filtros
- **Funcionalidades**:
  - Busca em tempo real
  - Filtro por status (ativo/inativo)
  - Preenchimento automático do tipo de mão de obra
  - Interface dropdown responsiva

#### 3.2 Associação Automática
- **Processo**: Ao selecionar uma função, o sistema automaticamente:
  - Define o `companyFunctionId` no funcionário
  - Preenche o campo `mo` (tipo de mão de obra)
  - Atualiza o campo `cargo` com o nome da função

### 4. Filtros e Busca

#### 4.1 Filtros Disponíveis
- **Busca por nome**: Pesquisa em tempo real
- **Tipo de mão de obra**: Direta, Indireta ou Todas
- **Status**: Ativas, Inativas ou Todas
- **Funcionários**: Com ou sem funcionários associados

#### 4.2 Indicadores Visuais
- **Chips de filtro ativo**: Mostram filtros aplicados
- **Contador de resultados**: Exibe número de funções encontradas
- **Botão limpar filtros**: Remove todos os filtros aplicados

### 5. Estatísticas

#### 5.1 Cards de Estatísticas
- **Total de Funções**: Contador geral
- **Funções Ativas**: Funções disponíveis para uso
- **Mão de Obra Direta**: Contador específico
- **Funções com Funcionários**: Funções em uso

#### 5.2 Animações
- **Contadores animados**: Efeito de incremento progressivo
- **Ícones coloridos**: Identificação visual por tipo
- **Responsividade**: Adaptação para diferentes telas

### 6. Exportação de Dados

#### 6.1 Formato CSV
- **Campos exportados**:
  - Nome da função
  - Tipo de mão de obra (texto legível)
  - Status (Ativo/Inativo)
  - Número de funcionários associados
  - Data de criação
  - Data de atualização

#### 6.2 Processo
- **Acesso**: Botão "Exportar" na aba Funções
- **Formato**: CSV com codificação UTF-8
- **Nome do arquivo**: `funcoes-YYYY-MM-DD.csv`

## Estrutura Técnica

### 1. Banco de Dados

#### 1.1 Modelo CompanyFunction
```sql
CREATE TABLE "CompanyFunction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "laborType" "LaborType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CompanyFunction_pkey" PRIMARY KEY ("id")
);
```

#### 1.2 Enum LaborType
```sql
CREATE TYPE "LaborType" AS ENUM ('DIRETO', 'INDIRETO');
```

#### 1.3 Relacionamento com Employee
```sql
-- Campo adicionado na tabela Employee
"companyFunctionId" TEXT,
FOREIGN KEY ("companyFunctionId") REFERENCES "CompanyFunction"("id")
```

### 2. APIs

#### 2.1 Endpoints Disponíveis
- `GET /api/functions` - Listar funções com filtros
- `POST /api/functions` - Criar nova função
- `GET /api/functions/[id]` - Buscar função específica
- `PUT /api/functions/[id]` - Atualizar função
- `DELETE /api/functions/[id]` - Excluir função

#### 2.2 Parâmetros de Filtro (GET)
- `search`: Busca por nome
- `laborType`: Filtro por tipo (DIRETO/INDIRETO)
- `isActive`: Filtro por status (true/false)

#### 2.3 Validações de API
- **Nome único**: Verifica duplicatas
- **Funcionários associados**: Impede exclusão se houver relacionamentos
- **Campos obrigatórios**: Nome e laborType
- **Sanitização**: Conversão automática para maiúsculas

### 3. Componentes Frontend

#### 3.1 Componentes Principais
- **FunctionsTab**: Container principal com todas as funcionalidades
- **FunctionModal**: Modal para criar/editar funções
- **FunctionViewModal**: Modal para visualizar detalhes
- **FunctionSelector**: Seletor para formulários de funcionários
- **FunctionsList**: Tabela responsiva com ações
- **FunctionFilters**: Filtros avançados
- **FunctionStats**: Cards de estatísticas

#### 3.2 Hooks e Estado
- **useFunctionsQuery**: Listagem com filtros
- **useFunctionQuery**: Busca individual
- **useCreateFunction**: Criação com validação
- **useUpdateFunction**: Atualização
- **useDeleteFunction**: Exclusão com verificações
- **useFunctionStats**: Estatísticas em tempo real

### 4. Tipagem TypeScript

#### 4.1 Interfaces Principais
```typescript
interface CompanyFunction {
  id: string;
  name: string;
  laborType: 'DIRETO' | 'INDIRETO';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
}

interface CreateFunctionData {
  name: string;
  laborType: 'DIRETO' | 'INDIRETO';
}

interface UpdateFunctionData {
  name?: string;
  laborType?: 'DIRETO' | 'INDIRETO';
  isActive?: boolean;
}

interface FunctionFilters {
  search?: string;
  laborType?: 'DIRETO' | 'INDIRETO';
  isActive?: boolean;
}
```

## Permissões e Segurança

### 1. Controle de Acesso
- **Visualização**: Todos os usuários autenticados
- **Criação/Edição/Exclusão**: Apenas usuários com permissão `MANAGE_EMPLOYEES`
- **Validação**: Server-side e client-side

### 2. Validações de Segurança
- **Sanitização de entrada**: Prevenção de XSS
- **Validação de tipos**: TypeScript + Zod
- **Autorização**: Verificação de permissões em todas as operações
- **Auditoria**: Logs de criação e atualização

## Interface do Usuário

### 1. Design System
- **Cores**: Seguem o tema do projeto (primary, secondary, etc.)
- **Tipografia**: Consistente com o design system
- **Espaçamento**: Grid system responsivo
- **Ícones**: Lucide React icons
- **Animações**: Framer Motion para transições

### 2. Responsividade
- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm, md, lg, xl
- **Grid adaptativo**: Colunas se ajustam ao tamanho da tela
- **Navegação touch**: Otimizada para touch screens

### 3. Acessibilidade
- **ARIA labels**: Descrições para screen readers
- **Contraste**: Cores com contraste adequado
- **Navegação por teclado**: Suporte completo
- **Foco visual**: Indicadores claros de foco

## Dark Mode

### 1. Suporte Completo
- **Cores adaptativas**: Todas as cores se ajustam ao tema
- **Ícones**: Cores apropriadas para cada tema
- **Contrastes**: Mantidos em ambos os temas
- **Transições**: Suaves entre temas

### 2. Classes CSS
- **Padrão**: `dark:` prefix para estilos do dark mode
- **Variáveis CSS**: Uso de custom properties
- **Fallbacks**: Cores de fallback para compatibilidade

## Internacionalização

### 1. Estrutura de Tradução
- **Chaves**: Organizadas por contexto (`form.cargo`, `form.turno`)
- **Função t()**: Sistema de tradução compatível
- **Fallbacks**: Exibição da chave se tradução não encontrada

### 2. Textos Traduzíveis
- **Labels de formulário**: Todos os campos
- **Mensagens de erro**: Validações e feedback
- **Botões e ações**: Textos de interface
- **Placeholders**: Textos de ajuda

## Performance

### 1. Otimizações Implementadas
- **React Query**: Cache inteligente de dados
- **Lazy Loading**: Componentes carregados sob demanda
- **Debounce**: Busca com delay para reduzir requests
- **Memoização**: Componentes e cálculos otimizados

### 2. Estratégias de Cache
- **Invalidação automática**: Cache atualizado após mutações
- **Stale time**: Dados considerados frescos por período definido
- **Background refetch**: Atualização em background
- **Offline support**: Funcionalidade básica offline

## Testes e Qualidade

### 1. Validações
- **TypeScript**: Tipagem estrita
- **ESLint**: Linting de código
- **Prettier**: Formatação consistente
- **Validação de schema**: Zod para runtime validation

### 2. Error Handling
- **Try/catch**: Tratamento de erros em todas as operações
- **Toast notifications**: Feedback visual de erros/sucessos
- **Logging**: Console logs para debugging
- **Fallbacks**: Estados de erro graceful

## Exemplos de Uso

### 1. Criar Nova Função
```typescript
// Exemplo de criação via API
const newFunction = {
  name: "ENGENHEIRO CIVIL",
  laborType: "INDIRETO" as const
};

const result = await createFunction(newFunction);
```

### 2. Filtrar Funções
```typescript
// Exemplo de filtros
const filters = {
  search: "engenheiro",
  laborType: "INDIRETO" as const,
  isActive: true
};

const functions = await getFunctions(filters);
```

### 3. Integração com Funcionário
```typescript
// Exemplo de associação
const employeeData = {
  name: "João Silva",
  companyFunctionId: "func-123",
  // outros campos...
};
```

## Roadmap e Melhorias Futuras

### 1. Funcionalidades Planejadas
- **Hierarquia de funções**: Níveis organizacionais
- **Competências**: Habilidades requeridas por função
- **Faixas salariais**: Ranges por função
- **Histórico de mudanças**: Auditoria completa

### 2. Integrações
- **Sistema de avaliação**: Performance por função
- **Planejamento de carreira**: Progressão entre funções
- **Relatórios avançados**: Analytics de RH
- **API externa**: Integração com sistemas de RH

### 3. Melhorias de UX
- **Drag & drop**: Reorganização de funções
- **Bulk operations**: Operações em massa
- **Templates**: Funções pré-definidas por setor
- **Favoritos**: Funções mais utilizadas

## Troubleshooting

### 1. Problemas Comuns

#### Erro: "Função já existe"
- **Causa**: Nome duplicado
- **Solução**: Usar nome único ou editar função existente

#### Erro: "Não é possível excluir"
- **Causa**: Funcionários associados à função
- **Solução**: Remover associações antes de excluir

#### Seletor não carrega funções
- **Causa**: Problemas de conectividade ou cache
- **Solução**: Recarregar página ou limpar cache

### 2. Logs e Debug
- **Console do navegador**: Erros de frontend
- **Network tab**: Problemas de API
- **Server logs**: Erros de backend
- **Database logs**: Problemas de persistência

## Conclusão

O Sistema de Funções oferece uma solução completa para gerenciamento de cargos organizacionais, com interface moderna, performance otimizada e integração perfeita com o sistema de funcionários existente. A arquitetura modular permite fácil manutenção e extensão de funcionalidades futuras. 