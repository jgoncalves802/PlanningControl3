# 🔐 Configuração do Supabase Auth

Este guia explica como configurar o Supabase Auth no projeto Planning Control.

## 📋 Pré-requisitos

1. **Projeto Supabase criado** em [supabase.com](https://supabase.com)
2. **Variáveis de ambiente configuradas**

## 🚀 Configuração Rápida

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Database
DATABASE_URL=sua_url_do_banco
```

### 2. Executar Migrações

```bash
npx prisma migrate dev
```

### 3. Configurar Supabase Auth

```bash
npm run supabase:setup
```

### 4. Iniciar o Projeto

```bash
npm run dev
```

## 🔧 Componentes Criados

### 1. Cliente Supabase (`lib/supabase.ts`)
- Cliente principal para operações do cliente
- Cliente admin para operações do servidor

### 2. Hook de Autenticação (`lib/hooks/useSupabaseAuth.ts`)
- Gerenciamento de estado de autenticação
- Funções de login, registro e logout
- Transformação de dados do Supabase para nosso formato

### 3. Contexto de Autenticação (`lib/contexts/AuthContext.tsx`)
- Contexto React para estado global de autenticação
- Hook `useAuth()` para acessar dados do usuário

### 4. Página de Login (`app/login/page.tsx`)
- Interface de login/registro
- Integração com Supabase Auth
- Redirecionamento automático

### 5. Middleware (`middleware.ts`)
- Proteção de rotas
- Redirecionamento automático baseado em autenticação

### 6. Componente de Proteção (`components/auth/ProtectedRoute.tsx`)
- Proteção de componentes React
- Verificação de roles/permissões

## 🔄 Migração do Sistema Atual

### Antes (Mock Auth)
```typescript
// lib/auth.ts
export const getCurrentUser = (): User => {
  return {
    id: '1',
    name: 'Admin Geral',
    email: 'admin@demo-company.com',
    role: UserRole.TENANT_ADMIN,
    isActive: true
  }
}
```

### Depois (Supabase Auth)
```typescript
// lib/hooks/useSupabaseAuth.ts
const { user, signIn, signOut } = useAuth()
```

## 🔐 Funcionalidades Implementadas

### ✅ Autenticação
- Login com email/senha
- Registro de novos usuários
- Logout
- Recuperação de senha

### ✅ Proteção de Rotas
- Middleware automático
- Redirecionamento baseado em autenticação
- Proteção de componentes

### ✅ Gerenciamento de Estado
- Contexto React global
- Sincronização automática
- Persistência de sessão

### ✅ Integração com Banco
- Mapeamento de usuários do Supabase para nosso schema
- Suporte a roles e permissões
- Dados de perfil personalizados

## 🎯 Credenciais Padrão

Após executar `npm run supabase:setup`:

- **Email**: `admin@demo-company.com`
- **Senha**: `123456`
- **Role**: `TENANT_ADMIN`

## 🔧 Personalização

### Adicionar Novos Roles

1. Atualizar enum `UserRole` em `lib/auth.ts`
2. Atualizar função `mapRoleFromDatabase` em `lib/hooks/useSupabaseAuth.ts`
3. Atualizar permissões em `getUserPermissions`

### Customizar Interface de Login

Editar `app/login/page.tsx` para:
- Adicionar campos personalizados
- Modificar validações
- Customizar design

### Adicionar Provedores OAuth

```typescript
// Em lib/hooks/useSupabaseAuth.ts
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
  })
}
```

## 🚨 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"
- Verificar se `.env.local` existe
- Confirmar valores das variáveis do Supabase

### Erro: "Tabela users não encontrada"
- Executar `npx prisma migrate dev`
- Verificar se as migrações foram aplicadas

### Erro: "Usuário não autenticado"
- Verificar se o middleware está funcionando
- Confirmar se as rotas estão protegidas corretamente

## 📚 Recursos Adicionais

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Middleware Next.js](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## ✅ Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas
- [ ] Script de setup executado
- [ ] Login funcionando
- [ ] Proteção de rotas ativa
- [ ] Usuário admin criado
- [ ] Testes realizados

---

**🎉 Configuração concluída!** O sistema agora usa Supabase Auth mantendo toda a interface existente. 