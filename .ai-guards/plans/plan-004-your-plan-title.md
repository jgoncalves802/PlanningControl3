---
id: plan-004
title: Página de Configurações do Sistema - 3 Níveis de Acesso
createdAt: 2025-07-23
author: Junior Silva
status: draft
---

## 🧩 Scope

Criar uma página de configurações centralizada com 3 níveis de acesso hierárquicos, permitindo que cada tipo de usuário gerencie suas respectivas configurações no sistema PlanningControl.

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

## ✅ Functional Requirements

### 🎯 Nível 1: Super ADMIN

#### Configurações de Infraestrutura
- Configuração de servidores e ambientes
- Configuração de banco de dados
- Configuração de backup global
- Monitoramento de performance do sistema
- Configuração de logs globais

#### Configurações de Clientes (Empresas)
- Gerenciamento de empresas parceiras
- Configuração de planos e assinaturas
- Configuração de domínios personalizados
- Configuração de limites por empresa
- Monitoramento de uso por empresa

#### Configurações de Segurança Global
- Políticas de segurança globais
- Configuração de autenticação global
- Configuração de criptografia
- Configuração de compliance
- Auditoria global do sistema

#### Configurações de Integração Global
- Configuração de APIs globais
- Configuração de webhooks globais
- Integração com sistemas externos
- Configuração de sincronização global
- Configuração de backup global

### 🏢 Nível 2: Admin da Empresa

#### Configurações da Empresa
- Informações da empresa (nome, CNPJ, endereço)
- Logo e identidade visual da empresa
- Configuração de cores do tema
- Configuração de domínio da empresa
- Configuração de fuso horário e idioma

#### Configurações de Usuários e Permissões
- Gerenciamento de usuários da empresa
- Criação e configuração de roles
- Definição de permissões por setor
- Configuração de hierarquia organizacional
- Gerenciamento de sessões ativas

#### Configurações de Contratos e Funções
- Gerenciamento de contratos
- Configuração de funções e cargos
- Definição de regras de negócio
- Configuração de centros de custo
- Configuração de obras e projetos

#### Configurações de Notificações da Empresa
- Configuração de notificações corporativas
- Templates de email da empresa
- Configuração de alertas empresariais
- Configuração de relatórios automáticos
- Configuração de lembretes corporativos

#### Configurações de Integração da Empresa
- Configuração de APIs da empresa
- Configuração de webhooks da empresa
- Integração com sistemas da empresa
- Configuração de backup da empresa
- Configuração de sincronização de dados

### 👤 Nível 3: Usuário (Funcionário)

#### Configurações Pessoais
- Informações pessoais do usuário
- Foto de perfil
- Configuração de idioma pessoal
- Configuração de fuso horário pessoal
- Configuração de tema pessoal

#### Configurações de Interface
- Personalização do dashboard
- Configuração de widgets
- Configuração de layout
- Configuração de atalhos
- Configuração de visualizações

#### Configurações de Notificações Pessoais
- Configuração de notificações push
- Configuração de notificações por email
- Configuração de alertas pessoais
- Configuração de lembretes pessoais
- Configuração de horários de notificação

#### Configurações de Trabalho
- Configuração de turno de trabalho
- Configuração de localização de trabalho
- Configuração de equipamentos
- Configuração de preferências de trabalho
- Configuração de disponibilidade

#### Configurações de Segurança Pessoal
- Configuração de senha
- Configuração de 2FA
- Configuração de sessões
- Configuração de dispositivos autorizados
- Configuração de backup pessoal

## ⚙️ Non-Functional Requirements

### Performance
- Carregamento da página em menos de 2 segundos
- Salvamento de configurações em menos de 1 segundo
- Interface responsiva para desktop, tablet e mobile
- Otimização de imagens e assets
- Cache inteligente por nível de acesso

### Security
- Autenticação obrigatória para acesso
- Validação de permissões por nível hierárquico
- Criptografia de dados sensíveis
- Logs de auditoria para todas as alterações
- Proteção contra CSRF e XSS
- Isolamento de dados entre empresas

### Scalability
- Arquitetura modular para fácil expansão
- Suporte a múltiplos tenants (empresas)
- Configurações específicas por ambiente
- Cache de configurações para melhor performance
- Escalabilidade horizontal

## 📚 Guidelines & Packages

### Guidelines do Projeto
- Seguir padrões de design do sistema atual
- Usar componentes UI existentes (shadcn/ui)
- Implementar validação com Zod
- Seguir padrões de TypeScript do projeto
- Usar TanStack Query para gerenciamento de estado
- Implementar tratamento de erros consistente
- Implementar sistema de permissões hierárquico

### Pacotes Necessários
- `@hookform/resolvers` - Integração Zod com React Hook Form
- `react-hook-form` - Gerenciamento de formulários
- `lucide-react` - Ícones (já instalado)
- `react-hot-toast` - Notificações (já instalado)
- `@radix-ui/react-tabs` - Abas (já instalado)
- `@radix-ui/react-switch` - Switches para toggles
- `@radix-ui/react-select` - Selects para opções
- `@radix-ui/react-accordion` - Acordeões para organizar seções

## 🔐 Threat Model

### Ameaças de Segurança
- **Acesso não autorizado**: Implementar verificação de roles hierárquicos
- **Elevação de privilégios**: Validação rigorosa de permissões
- **Vazamento de dados entre empresas**: Isolamento completo de dados
- **Injeção de dados maliciosos**: Validação rigorosa de inputs com Zod
- **Exposição de dados sensíveis**: Criptografia de configurações críticas
- **CSRF attacks**: Implementar tokens CSRF
- **XSS attacks**: Sanitização de dados de entrada

### Medidas de Mitigação
- Autenticação e autorização robustas por nível
- Validação de entrada em todas as APIs
- Criptografia de dados sensíveis
- Logs de auditoria detalhados
- Headers de segurança apropriados
- Isolamento de dados por tenant

## 🔢 Execution Plan

### Fase 1: Estrutura Base e Sistema de Permissões (3-4 dias)
1. **Criar sistema de permissões hierárquico**
   - Implementar roles: SUPER_ADMIN, COMPANY_ADMIN, USER
   - Criar middleware de validação de permissões
   - Implementar isolamento de dados por empresa

2. **Criar estrutura base da página**
   - Criar `/app/dashboard/settings/page.tsx`
   - Implementar layout com abas por nível
   - Criar componentes base de configuração

3. **Implementar sistema de navegação por nível**
   - Abas específicas para cada nível de acesso
   - Redirecionamento baseado em permissões
   - Interface adaptativa por nível

### Fase 2: Configurações Super ADMIN (4-5 dias)
1. **Configurações de Infraestrutura**
   - Dashboard de monitoramento global
   - Configuração de servidores e ambientes
   - Configuração de backup global

2. **Gerenciamento de Clientes**
   - Lista de empresas parceiras
   - Configuração de planos e assinaturas
   - Monitoramento de uso por empresa

3. **Configurações de Segurança Global**
   - Políticas de segurança globais
   - Configuração de autenticação global
   - Auditoria global do sistema

### Fase 3: Configurações Admin da Empresa (4-5 dias)
1. **Configurações da Empresa**
   - Informações da empresa
   - Logo e identidade visual
   - Configuração de tema e cores

2. **Gerenciamento de Usuários e Permissões**
   - Lista de usuários da empresa
   - Criação e configuração de roles
   - Definição de permissões por setor

3. **Configurações de Contratos e Funções**
   - Gerenciamento de contratos
   - Configuração de funções e cargos
   - Definição de regras de negócio

### Fase 4: Configurações de Usuário (2-3 dias)
1. **Configurações Pessoais**
   - Informações pessoais
   - Foto de perfil
   - Configurações de idioma e tema

2. **Configurações de Interface**
   - Personalização do dashboard
   - Configuração de widgets
   - Configuração de layout

3. **Configurações de Notificações Pessoais**
   - Configuração de notificações push
   - Configuração de notificações por email
   - Configuração de alertas pessoais

### Fase 5: APIs e Backend (3-4 dias)
1. **APIs Super ADMIN**
   - `GET /api/settings/super-admin/infrastructure`
   - `GET /api/settings/super-admin/clients`
   - `GET /api/settings/super-admin/security`

2. **APIs Admin da Empresa**
   - `GET /api/settings/company/[companyId]`
   - `GET /api/settings/company/[companyId]/users`
   - `GET /api/settings/company/[companyId]/contracts`

3. **APIs Usuário**
   - `GET /api/settings/user/[userId]`
   - `PUT /api/settings/user/[userId]`
   - `GET /api/settings/user/[userId]/notifications`

### Fase 6: Testes e Refinamentos (2-3 dias)
1. **Testes de funcionalidade**
   - Testar todas as configurações por nível
   - Validar permissões hierárquicas
   - Testar isolamento de dados

2. **Testes de segurança**
   - Testar validações de permissões
   - Verificar isolamento entre empresas
   - Testar proteções CSRF/XSS

3. **Refinamentos**
   - Ajustes de UX/UI por nível
   - Otimizações de performance
   - Documentação

## 📁 Estrutura de Arquivos

```
app/dashboard/settings/
├── page.tsx                           # Página principal
├── components/
│   ├── SettingsLayout.tsx            # Layout base com navegação
│   ├── SuperAdminSettings/
│   │   ├── InfrastructureSettings.tsx
│   │   ├── ClientManagement.tsx
│   │   └── GlobalSecuritySettings.tsx
│   ├── CompanyAdminSettings/
│   │   ├── CompanyInfoSettings.tsx
│   │   ├── UserManagementSettings.tsx
│   │   └── ContractSettings.tsx
│   └── UserSettings/
│       ├── PersonalSettings.tsx
│       ├── InterfaceSettings.tsx
│       └── NotificationSettings.tsx
└── api/
    ├── settings/
    │   ├── super-admin/
    │   │   ├── infrastructure/route.ts
    │   │   ├── clients/route.ts
    │   │   └── security/route.ts
    │   ├── company/
    │   │   ├── [companyId]/route.ts
    │   │   ├── [companyId]/users/route.ts
    │   │   └── [companyId]/contracts/route.ts
    │   └── user/
    │       ├── [userId]/route.ts
    │       └── [userId]/notifications/route.ts

lib/hooks/
├── useSettings.ts
├── useSettingsForm.ts
├── useSettingsValidation.ts
└── usePermissions.ts

lib/validations/
├── settings.ts
└── permissions.ts

lib/middleware/
└── settingsPermissions.ts
```

## 🎯 Critérios de Sucesso

- ✅ Sistema de permissões hierárquico funcionando
- ✅ Isolamento de dados entre empresas
- ✅ Interface adaptativa por nível de acesso
- ✅ Todas as configurações são salvas corretamente
- ✅ Validações funcionam adequadamente
- ✅ Interface responsiva em todos os dispositivos
- ✅ Logs de auditoria são gerados
- ✅ Permissões são respeitadas
- ✅ Feedback visual é claro e consistente
- ✅ Performance otimizada para cada nível
