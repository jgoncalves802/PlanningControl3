---
id: plan-006
title: Implementação do Sistema de Controle de Permissões e Licenças
createdAt: 2025-08-15
author: Junior Silva
status: draft
---

## 🧩 Scope

Implementar um sistema robusto e escalável de controle de permissões que garanta segurança, flexibilidade e controle de acesso granular para diferentes tipos de usuários (SUPER_ADMIN, COMPANY_ADMIN, USER). O sistema deve incluir controle de licenças por empresa, restrições de criação de SUPER_ADMIN e configurações pessoais universalmente acessíveis.

## ✅ Functional Requirements

### 1. Verificação e Análise Completa da Aplicação
- Análise de todas as páginas e componentes para verificar implementação de permissões
- Mapeamento de acesso por tipo de usuário (SUPER_ADMIN, COMPANY_ADMIN, USER)
- Identificação de pontos de vulnerabilidade e inconsistências no controle de acesso

### 2. Sistema de Restrições para SUPER_ADMIN
- Apenas usuários SUPER_ADMIN podem criar outros usuários SUPER_ADMIN
- Validação em APIs e interfaces de criação de usuários
- Auditoria completa de ações administrativas críticas

### 3. Sistema de Planos e Licenças por Empresa
- Configuração de planos com limites de usuários (Básico: 5, Profissional: 20, Enterprise: 100+)
- Interface de gestão de planos para SUPER_ADMIN
- Controle automático de limites de usuários por empresa

### 4. Controle de Licenças e Criação de Usuários
- COMPANY_ADMIN pode criar usuários do tipo USER dentro do limite de licenças
- Validação automática de limites antes da criação de usuários
- Dashboard de uso de licenças com alertas de limite

### 5. Configurações Pessoais Universais
- Página de configurações pessoais acessível para todos os usuários
- Configurações de interface (tema, idioma, avatar)
- Configurações de notificações e preferências

### 6. Permissões Granulares por Página
- Controle detalhado de acesso por funcionalidade (visualizar, editar, criar, excluir, exportar, importar)
- Sistema de permissões personalizadas por usuário
- Validação em tempo real de permissões

## ⚙️ Non-Functional Requirements

### Performance
- Cache de permissões para otimizar consultas frequentes
- Queries otimizadas com índices apropriados
- Lazy loading de componentes baseado em permissões
- Tempo de resposta < 200ms para validações de permissão

### Security
- Validação server-side de todas as permissões
- Row Level Security (RLS) no Supabase para isolamento de dados
- Auditoria completa de ações administrativas
- Proteção contra elevação de privilégios
- Validação de JWT tokens em todas as operações críticas

### Scalability
- Suporte a múltiplas empresas (multi-tenant)
- Sistema de permissões escalável para grandes volumes de usuários
- Arquitetura modular para fácil extensão
- Suporte a diferentes tipos de planos e recursos

## 📚 Guidelines & Packages

### Guidelines do Projeto
- Seguir padrões de arquitetura MCP estabelecidos
- Manter compatibilidade com sistema de autenticação Supabase existente
- Usar TypeScript para tipagem forte em todas as implementações
- Seguir padrões de nomenclatura e estrutura de arquivos existentes
- Implementar testes automatizados para todas as funcionalidades críticas

### Pacotes e Dependências
- **@prisma/client**: ORM para operações de banco de dados
- **@supabase/supabase-js**: Cliente Supabase para autenticação
- **react-hot-toast**: Notificações de feedback ao usuário
- **lucide-react**: Ícones para interface
- **@radix-ui/react-***: Componentes de UI acessíveis
- **zod**: Validação de schemas e dados

## 🔐 Threat Model

### Ameaças Identificadas
1. **Elevação de Privilégios**: Usuários tentando acessar funcionalidades não autorizadas
   - *Mitigação*: Validação server-side rigorosa e auditoria completa

2. **Criação Não Autorizada de SUPER_ADMIN**: Tentativas de criar usuários com privilégios elevados
   - *Mitigação*: Validação dupla (frontend e backend) e logs de auditoria

3. **Excesso de Licenças**: Empresas criando mais usuários que o permitido
   - *Mitigação*: Validação automática de limites e alertas em tempo real

4. **Vazamento de Dados Entre Empresas**: Acesso cruzado a dados de diferentes empresas
   - *Mitigação*: Row Level Security e filtros automáticos por companyId

5. **Manipulação de Permissões**: Tentativas de modificar permissões via API
   - *Mitigação*: Validação de autorização e logs de auditoria

## 🔢 Execution Plan

### Fase 1: Análise e Preparação (2-3 dias)

#### 1.1 Auditoria Completa do Sistema Atual
```bash
# Análise de todas as páginas e componentes
- Dashboard principal (/dashboard)
- Gestão de funcionários (/dashboard/employees)
- Contratos (/dashboard/contracts)
- Orçamentos (/dashboard/budgets)
- Planejamento (/dashboard/planning)
- Transferências (/dashboard/transfers)
- Controle de efetivo (/dashboard/workforce-control)
- Gestão NFC (/dashboard/nfc-management)
- Analytics (/dashboard/analytics)
- Backup (/dashboard/backup)
```

#### 1.2 Mapeamento de Permissões Existentes
```typescript
// Análise dos arquivos:
- lib/auth-client.ts
- lib/types/permissions.ts
- prisma/schema.prisma (modelos de permissão)
- APIs de configurações existentes
```

#### 1.3 Identificação de Gaps e Vulnerabilidades
- Documentar pontos de falha no controle de acesso
- Identificar rotas não protegidas
- Mapear inconsistências entre frontend e backend

### Fase 2: Implementação de Restrições SUPER_ADMIN (1 dia)

#### 2.1 Validação de Criação de SUPER_ADMIN
```typescript
// Modificar: app/api/settings/super-admin/users/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  
  const { role } = await request.json()
  if (role === 'SUPER_ADMIN') {
    // Log de auditoria
    await logAuditAction(session.user.id, 'SUPER_ADMIN_CREATION_ATTEMPT', { targetRole: role })
  }
}
```

#### 2.2 Interface de Proteção
```typescript
// Modificar: app/dashboard/settings/components/SuperAdminSettings/UserManagement.tsx
const canCreateSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

// Ocultar opção para não-SUPER_ADMIN
{canCreateSuperAdmin && (
  <SelectItem value="SUPER_ADMIN">Super Administrador</SelectItem>
)}
```

### Fase 3: Sistema de Planos e Licenças (3-4 dias)

#### 3.1 Extensão do Schema do Banco
```sql
-- Migration: prisma/migrations/YYYYMMDDHHMMSS_add_subscription_plans/
-- Adicionar ao modelo Tenant
ALTER TABLE "Tenant" ADD COLUMN "maxUsers" INTEGER DEFAULT 5;
ALTER TABLE "Tenant" ADD COLUMN "currentUserCount" INTEGER DEFAULT 0;
ALTER TABLE "Tenant" ADD COLUMN "planFeatures" JSONB;
ALTER TABLE "Tenant" ADD COLUMN "planExpiryDate" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN "isTrial" BOOLEAN DEFAULT true;
ALTER TABLE "Tenant" ADD COLUMN "trialExpiryDate" TIMESTAMP(3);

-- Novo modelo para planos
CREATE TABLE "SubscriptionPlan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "maxUsers" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "features" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");
```

#### 3.2 APIs de Gestão de Planos
```typescript
// Criar: app/api/settings/plans/route.ts
export async function GET() {
  // Listar planos disponíveis
}

export async function POST() {
  // Criar novo plano (apenas SUPER_ADMIN)
}

// Criar: app/api/settings/plans/[planId]/route.ts
export async function PUT() {
  // Atualizar plano
}

export async function DELETE() {
  // Deletar plano
}
```

#### 3.3 Interface de Gestão de Planos
```typescript
// Criar: app/dashboard/settings/plans/page.tsx
// Criar: app/dashboard/settings/components/PlanManagement.tsx
// Criar: app/dashboard/settings/components/PlanCard.tsx
// Criar: app/dashboard/settings/components/LicenseUsage.tsx
```

### Fase 4: Controle de Licenças (2-3 dias)

#### 4.1 Validação de Limites
```typescript
// Criar: lib/validations/license.ts
export async function validateUserLimit(companyId: string) {
  const company = await prisma.tenant.findUnique({
    where: { id: companyId }
  })
  
  const currentUsers = await prisma.userRoleAssignment.count({
    where: { companyId, isActive: true }
  })
  
  return {
    canCreate: currentUsers < company.maxUsers,
    current: currentUsers,
    limit: company.maxUsers
  }
}
```

#### 4.2 Integração com APIs de Criação de Usuários
```typescript
// Modificar: app/api/settings/super-admin/users/route.ts
// Modificar: app/api/settings/company-admin/users/route.ts

export async function POST(request: NextRequest) {
  const { companyId } = await request.json()
  
  const licenseCheck = await validateUserLimit(companyId)
  if (!licenseCheck.canCreate) {
    return NextResponse.json({
      error: 'Limite de usuários atingido',
      current: licenseCheck.current,
      limit: licenseCheck.limit
    }, { status: 400 })
  }
}
```

#### 4.3 Dashboard de Licenças
```typescript
// Criar: app/dashboard/settings/components/LicenseDashboard.tsx
// Componente para mostrar uso atual vs. limite
// Alertas de limite próximo
// Botão para upgrade de plano
```

### Fase 5: Configurações Pessoais Universais (1 dia)

#### 5.1 Página de Configurações Pessoais
```typescript
// Modificar: app/dashboard/settings/components/UserSettings/PersonalSettings.tsx
// Garantir acesso para todos os usuários
// Configurações de tema, idioma, avatar
// Configurações de notificações
```

#### 5.2 Componente de Avatar Universal
```typescript
// Criar: components/ui/avatar-upload.tsx
// Upload e edição de avatar
// Integração com perfil do usuário
// Configurações de exibição
```

### Fase 6: Permissões Granulares (2-3 dias)

#### 6.1 Extensão do Sistema de Permissões
```typescript
// Modificar: lib/types/permissions.ts
// Adicionar permissões mais granulares
// Suporte a permissões personalizadas por usuário
```

#### 6.2 Validação em Tempo Real
```typescript
// Modificar: lib/auth-client.ts
// Funções de validação granular
// Cache de permissões para performance
```

#### 6.3 Componentes de Proteção
```typescript
// Criar: components/auth/PermissionGuard.tsx
// Wrapper para componentes que precisam de permissão específica
// Fallback para usuários sem permissão
```

### Fase 7: Testes e Validação (2-3 dias)

#### 7.1 Testes Automatizados
```typescript
// Criar: tests/permissions.test.ts
// Testes de validação de permissões
// Testes de criação de SUPER_ADMIN
// Testes de limites de licenças
```

#### 7.2 Testes de Interface
```typescript
// Criar: tests/ui/permissions.test.tsx
// Testes de componentes protegidos
// Testes de fluxos de criação de usuários
// Testes de configurações de planos
```

#### 7.3 Testes Manuais
- Cenários de criação de usuários com diferentes roles
- Teste de limites de licenças
- Configurações pessoais para todos os usuários
- Validação de permissões em todas as páginas

### Fase 8: Documentação e Deploy (1 dia)

#### 8.1 Documentação
```markdown
// Atualizar: docs/05-features/permissions.md
// Documentar novo sistema de permissões
// Guias de uso para diferentes tipos de usuário
// Troubleshooting comum
```

#### 8.2 Deploy e Monitoramento
```bash
# Deploy gradual
1. Deploy das migrações de banco
2. Deploy das APIs
3. Deploy do frontend
4. Monitoramento de logs e métricas
```

## 📊 Cronograma Detalhado

| Fase | Duração | Responsável | Entregáveis | Status |
|------|---------|-------------|-------------|--------|
| 1. Análise e Preparação | 2-3 dias | Desenvolvedor | Relatório de auditoria | ⏳ |
| 2. Restrições SUPER_ADMIN | 1 dia | Desenvolvedor | APIs e interface protegidas | ⏳ |
| 3. Sistema de Planos | 3-4 dias | Desenvolvedor | Schema, APIs e interface | ⏳ |
| 4. Controle de Licenças | 2-3 dias | Desenvolvedor | Validações e dashboard | ⏳ |
| 5. Configurações Pessoais | 1 dia | Desenvolvedor | Interface universal | ⏳ |
| 6. Permissões Granulares | 2-3 dias | Desenvolvedor | Sistema granular | ⏳ |
| 7. Testes e Validação | 2-3 dias | QA/Dev | Testes automatizados | ⏳ |
| 8. Documentação e Deploy | 1 dia | Desenvolvedor | Docs e deploy | ⏳ |

**Total Estimado: 14-19 dias**

## 🎯 Critérios de Aceitação

### Funcionais
- [ ] Todas as páginas respeitam permissões de acesso configuradas
- [ ] Apenas SUPER_ADMIN pode criar outros usuários SUPER_ADMIN
- [ ] Sistema de planos permite configuração de limites de usuários
- [ ] Empresas respeitam automaticamente limites de licenças
- [ ] Configurações pessoais acessíveis para todos os usuários
- [ ] Permissões granulares funcionando em todas as funcionalidades

### Não Funcionais
- [ ] Performance mantida com validações (tempo de resposta < 200ms)
- [ ] Segurança reforçada com auditoria completa
- [ ] Interface intuitiva e responsiva
- [ ] Logs de auditoria para todas as ações críticas
- [ ] Escalabilidade para múltiplas empresas e usuários

## 🚨 Riscos e Mitigações

### Riscos Técnicos
1. **Complexidade do Sistema**: Pode ficar muito complexo
   - *Mitigação*: Implementação gradual e documentação clara

2. **Performance**: Validações podem impactar performance
   - *Mitigação*: Cache de permissões e otimização de queries

3. **Compatibilidade**: Mudanças podem quebrar funcionalidades existentes
   - *Mitigação*: Testes extensivos e plano de rollback

### Riscos de Negócio
1. **Usabilidade**: Interface pode ficar confusa
   - *Mitigação*: UX/UI cuidadoso e feedback dos usuários

2. **Adoção**: Usuários podem resistir às mudanças
   - *Mitigação*: Comunicação clara e treinamento

3. **Escalabilidade**: Sistema pode não suportar crescimento
   - *Mitigação*: Arquitetura modular e testes de carga
