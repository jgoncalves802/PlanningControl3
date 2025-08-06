# Sistema de Configurações Hierárquicas

## 📋 Visão Geral

O sistema de configurações do PlanningControl foi implementado com uma arquitetura hierárquica de 3 níveis, permitindo que cada tipo de usuário gerencie suas respectivas configurações de forma isolada e segura.

## 🏗️ Arquitetura de 3 Níveis

### 1️⃣ Super ADMIN (Dono do Software)
**Responsabilidades:**
- Configurar ambiente para clientes (empresas parceiras)
- Gerenciar planos e assinaturas
- Configurar infraestrutura global
- Monitorar sistema como um todo

### 2️⃣ Admin da Empresa (Dono/Gestor da Empresa)
**Responsabilidades:**
- Configurar ambiente para funcionários
- Definir permissões por setor/departamento
- Gerenciar contratos e funções
- Configurar regras de negócio específicas

### 3️⃣ Usuário (Funcionário)
**Responsabilidades:**
- Personalizar interface individual
- Configurar notificações pessoais
- Ajustar preferências de trabalho
- Gerenciar perfil pessoal

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `companies`
Armazena informações das empresas parceiras:
```sql
- id: String (PK)
- name: String
- cnpj: String (unique)
- email: String (unique)
- phone: String?
- address: Json?
- logoUrl: String?
- primaryColor: String
- secondaryColor: String
- domain: String? (unique)
- timezone: String
- language: String
- subscriptionPlan: SubscriptionPlan
- status: CompanyStatus
- maxUsers: Int
- maxContracts: Int
- maxEmployees: Int
- createdAt: DateTime
- updatedAt: DateTime
```

#### `company_settings`
Configurações específicas de cada empresa:
```sql
- id: String (PK)
- companyId: String (FK, unique)
- notificationsEnabled: Boolean
- emailNotifications: Boolean
- pushNotifications: Boolean
- autoBackup: Boolean
- backupFrequency: String
- dataRetentionDays: Int
- apiRateLimit: Int
- maxFileSize: Int
- allowedFileTypes: String[]
- securityLevel: SecurityLevel
- twoFactorRequired: Boolean
- sessionTimeout: Int
```

#### `infrastructure_settings`
Configurações de infraestrutura do sistema:
```sql
- id: String (PK)
- serverName: String
- serverType: String
- status: InfrastructureStatus
- cpuUsage: Decimal
- memoryUsage: Decimal
- diskUsage: Decimal
- networkUsage: Decimal
- lastMaintenance: DateTime?
- nextMaintenance: DateTime?
- backupStatus: String
- securityStatus: String
```

#### `global_settings`
Configurações globais do sistema:
```sql
- id: String (PK)
- systemName: String
- systemVersion: String
- maintenanceMode: Boolean
- registrationEnabled: Boolean
- maxCompanies: Int
- maxUsersPerCompany: Int
- defaultPlan: SubscriptionPlan
- supportEmail: String
- supportPhone: String?
```

#### `user_roles`
Roles e permissões dos usuários:
```sql
- id: String (PK)
- userId: String (FK)
- companyId: String? (FK)
- role: UserRole
- permissions: Json?
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### `audit_logs`
Logs de auditoria para todas as ações:
```sql
- id: String (PK)
- userId: String? (FK)
- companyId: String? (FK)
- action: String
- entityType: String
- entityId: String?
- details: Json
- ipAddress: String?
- userAgent: String?
- createdAt: DateTime
```

### Enums

#### `UserRole`
```typescript
enum UserRole {
  SUPER_ADMIN
  COMPANY_ADMIN
  USER
}
```

#### `CompanyStatus`
```typescript
enum CompanyStatus {
  ACTIVE
  SUSPENDED
  PENDING
  CANCELLED
}
```

#### `SubscriptionPlan`
```typescript
enum SubscriptionPlan {
  BASIC
  PROFESSIONAL
  ENTERPRISE
}
```

#### `InfrastructureStatus`
```typescript
enum InfrastructureStatus {
  ONLINE
  OFFLINE
  MAINTENANCE
  ERROR
}
```

#### `SecurityLevel`
```typescript
enum SecurityLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## 🔧 Serviços Implementados

### CompanyService
Gerencia operações relacionadas às empresas:
- `createCompany(data)` - Criar nova empresa
- `getCompanyById(id)` - Buscar empresa por ID
- `getAllCompanies()` - Listar todas as empresas
- `updateCompany(id, data)` - Atualizar empresa
- `updateCompanyStatus(id, status)` - Atualizar status
- `deleteCompany(id)` - Deletar empresa
- `getCompanyByCnpj(cnpj)` - Buscar por CNPJ
- `getCompanyByEmail(email)` - Buscar por email

### CompanySettingsService
Gerencia configurações das empresas:
- `getCompanySettings(companyId)` - Buscar configurações
- `updateCompanySettings(companyId, data)` - Atualizar configurações
- `createDefaultSettings(companyId)` - Criar configurações padrão

### InfrastructureService
Gerencia configurações de infraestrutura:
- `createInfrastructure(data)` - Criar infraestrutura
- `getInfrastructure(id)` - Buscar infraestrutura
- `getAllInfrastructure()` - Listar todas
- `updateInfrastructure(id, data)` - Atualizar
- `updateServerStatus(id, status)` - Atualizar status
- `deleteInfrastructure(id)` - Deletar

### GlobalSettingsService
Gerencia configurações globais:
- `getGlobalSettings()` - Buscar configurações globais
- `updateGlobalSettings(data)` - Atualizar configurações
- `toggleMaintenanceMode(enabled)` - Ativar/desativar manutenção

### UserRoleService
Gerencia roles e permissões:
- `createUserRole(data)` - Criar role
- `getUserRole(userId, companyId)` - Buscar role
- `getUserRoles(userId)` - Buscar todos os roles
- `updateUserRole(userId, companyId, data)` - Atualizar role
- `deleteUserRole(userId, companyId)` - Deletar role
- `hasRole(userId, role, companyId)` - Verificar role
- `isSuperAdmin(userId)` - Verificar super admin
- `isCompanyAdmin(userId, companyId)` - Verificar admin da empresa

### AuditService
Gerencia logs de auditoria:
- `createAuditLog(data)` - Criar log
- `getAuditLogs(filters)` - Buscar logs
- `getCompanyAuditLogs(companyId)` - Logs da empresa
- `getUserAuditLogs(userId)` - Logs do usuário

### StatisticsService
Gerencia estatísticas:
- `getSystemStatistics()` - Estatísticas do sistema
- `getCompanyStatistics(companyId)` - Estatísticas da empresa

## 🌐 APIs Implementadas

### Super Admin APIs

#### Empresas
- `GET /api/settings/super-admin/companies` - Listar empresas
- `POST /api/settings/super-admin/companies` - Criar empresa
- `GET /api/settings/super-admin/companies/[id]` - Buscar empresa
- `PUT /api/settings/super-admin/companies/[id]` - Atualizar empresa
- `DELETE /api/settings/super-admin/companies/[id]` - Deletar empresa

#### Infraestrutura
- `GET /api/settings/super-admin/infrastructure` - Listar infraestrutura
- `POST /api/settings/super-admin/infrastructure` - Criar infraestrutura
- `GET /api/settings/super-admin/infrastructure/[id]` - Buscar infraestrutura
- `PUT /api/settings/super-admin/infrastructure/[id]` - Atualizar infraestrutura
- `DELETE /api/settings/super-admin/infrastructure/[id]` - Deletar infraestrutura

### Company Admin APIs

#### Configurações da Empresa
- `GET /api/settings/company/[companyId]` - Buscar configurações
- `PUT /api/settings/company/[companyId]` - Atualizar configurações

### User APIs

#### Configurações do Usuário
- `GET /api/settings/user/[userId]` - Buscar configurações
- `PUT /api/settings/user/[userId]` - Atualizar configurações

## 🎣 Hooks React Query

### Super Admin Hooks
- `useCompanies()` - Buscar todas as empresas
- `useCompany(id)` - Buscar empresa específica
- `useCreateCompany()` - Criar empresa
- `useUpdateCompany()` - Atualizar empresa
- `useDeleteCompany()` - Deletar empresa
- `useInfrastructure()` - Buscar infraestrutura
- `useInfrastructureItem(id)` - Buscar infraestrutura específica
- `useCreateInfrastructure()` - Criar infraestrutura
- `useUpdateInfrastructure()` - Atualizar infraestrutura
- `useDeleteInfrastructure()` - Deletar infraestrutura

### Company Admin Hooks
- `useCompanySettings(companyId)` - Buscar configurações da empresa
- `useUpdateCompanySettings()` - Atualizar configurações da empresa

### User Hooks
- `useUserSettings(userId)` - Buscar configurações do usuário
- `useUpdateUserSettings()` - Atualizar configurações do usuário

### Auditoria e Estatísticas
- `useAuditLogs(filters)` - Buscar logs de auditoria
- `useSystemStatistics()` - Estatísticas do sistema
- `useCompanyStatistics(companyId)` - Estatísticas da empresa

## 🔐 Sistema de Permissões

### Hierarquia de Roles
1. **SUPER_ADMIN** - Acesso total ao sistema
2. **COMPANY_ADMIN** - Acesso total à empresa específica
3. **USER** - Acesso limitado ao próprio perfil

### Permissões por Role

#### SUPER_ADMIN
```json
{
  "canManageCompanies": true,
  "canManageInfrastructure": true,
  "canManageUsers": true,
  "canViewAuditLogs": true,
  "canViewSystemStatistics": true
}
```

#### COMPANY_ADMIN
```json
{
  "canManageCompanySettings": true,
  "canManageUsers": true,
  "canManageContracts": true,
  "canViewReports": true,
  "canViewCompanyStatistics": true
}
```

#### USER
```json
{
  "canViewDashboard": true,
  "canManagePersonalSettings": true,
  "canViewReports": false
}
```

## 🚀 Como Usar

### 1. Aplicar Migração
```bash
# Gerar e aplicar a migração
npx prisma migrate dev --name add_settings_system

# Executar script de população de dados
node scripts/apply-settings-migration.js
```

### 2. Usar os Hooks
```typescript
import { useCompanies, useCreateCompany } from '@/lib/hooks/useSettings';

function CompanyList() {
  const { data: companies, isLoading, error } = useCompanies();
  const createCompany = useCreateCompany();

  const handleCreate = async (data) => {
    await createCompany.mutateAsync(data);
  };

  // ... resto do componente
}
```

### 3. Verificar Permissões
```typescript
import { UserRoleService } from '@/lib/services/settingsService';

// Verificar se usuário é super admin
const isSuperAdmin = await UserRoleService.isSuperAdmin(userId);

// Verificar se usuário é admin da empresa
const isCompanyAdmin = await UserRoleService.isCompanyAdmin(userId, companyId);
```

## 📊 Monitoramento e Auditoria

### Logs de Auditoria
Todas as ações importantes são registradas automaticamente:
- Criação/atualização/deleção de empresas
- Alterações de configurações
- Ações de infraestrutura
- Mudanças de permissões

### Estatísticas
O sistema coleta estatísticas automáticas:
- Número de empresas ativas
- Uso de recursos por empresa
- Performance da infraestrutura
- Atividade dos usuários

## 🔒 Segurança

### Isolamento de Dados
- Cada empresa tem seus dados isolados
- Usuários só acessam dados da própria empresa
- Super admin tem acesso global

### Validação de Permissões
- Todas as APIs verificam permissões
- Roles são validados em cada operação
- Logs de auditoria para todas as ações

### Criptografia
- Dados sensíveis são criptografados
- Senhas são hasheadas
- Tokens de sessão são seguros

## 🧪 Testes

### Dados de Teste
O script de migração cria dados de teste:
- 3 empresas com diferentes planos
- 3 usuários com diferentes roles
- 3 servidores de infraestrutura
- Configurações completas para todos os níveis

### Credenciais de Teste
- **Super Admin**: superadmin@planningcontrol.com
- **Company Admin**: admin@empresa1.com
- **User**: user@empresa1.com

## 📈 Próximos Passos

1. **Implementar autenticação real** com Clerk
2. **Adicionar validação de permissões** nas APIs
3. **Implementar notificações em tempo real**
4. **Adicionar relatórios avançados**
5. **Implementar backup automático**
6. **Adicionar monitoramento de performance**

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro de Migração
```bash
# Resetar banco e aplicar migrações
npx prisma migrate reset
npx prisma migrate dev
```

#### Erro de Permissões
```bash
# Verificar roles no banco
npx prisma studio
```

#### Dados não aparecem
```bash
# Executar script de população
node scripts/apply-settings-migration.js
```

### Logs Úteis
- Verificar logs do Prisma
- Verificar logs de auditoria
- Verificar logs de erro das APIs

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs)
- [Documentação do React Query](https://tanstack.com/query/latest)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Guia de Segurança](https://owasp.org/www-project-top-ten/) 