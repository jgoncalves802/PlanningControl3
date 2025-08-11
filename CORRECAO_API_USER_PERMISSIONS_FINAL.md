# Correção da API de Permissões de Usuário

## Problema Identificado

A API `/api/settings/user-permissions/[userId]` estava retornando erro 500 devido aos seguintes problemas:

1. **Campo `createdBy` inexistente**: A API tentava criar um `UserRoleAssignment` com o campo `createdBy`, mas este campo não existe no schema do Prisma.

2. **Referência incorreta ao campo `role`**: A API tentava acessar `user.role`, mas o modelo `User` não possui um campo `role` direto. O role é gerenciado através do modelo `UserRoleAssignment`.

3. **Tratamento inadequado de usuários sem role assignments**: A API não lidava adequadamente com usuários que não possuem role assignments ativos.

## Correções Implementadas

### 1. Remoção do campo `createdBy`

```typescript
// ANTES
userRole = await prisma.userRoleAssignment.create({
  data: {
    userId: userId,
    role: role || defaultRole,
    permissions: permissions,
    isActive: true,
    createdBy: session.user.id  // ❌ Campo inexistente
  }
})

// DEPOIS
userRole = await prisma.userRoleAssignment.create({
  data: {
    userId: userId,
    role: role || defaultRole,
    permissions: permissions,
    isActive: true
  }
})
```

### 2. Correção da lógica de role padrão

```typescript
// ANTES
const defaultRole = user.role || 'USER'  // ❌ user.role não existe

// DEPOIS
const defaultRole = 'USER'  // ✅ Usar role padrão fixo
```

### 3. Melhoria no tratamento de usuários sem role assignments

```typescript
// Se não há role assignment, retornar permissões padrão
if (!userRole) {
  console.log('⚠️ Usuário não tem role assignment ativo, usando permissões padrão...')
  
  const defaultRole = 'USER'
  const defaultPermissions = getDefaultPermissions(defaultRole as any)
  
  return NextResponse.json({
    userId,
    role: defaultRole,
    permissions: defaultPermissions,
    customPermissions: null,
    message: 'Usando permissões padrão (sem role assignment)'
  })
}
```

### 4. Melhoria no tratamento de erros

```typescript
catch (error) {
  console.error('❌ Erro ao obter permissões do usuário:', error)
  
  // Log detalhado do erro para debug
  if (error instanceof Error) {
    console.error('Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
  }
  
  return NextResponse.json(
    { 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    },
    { status: 500 }
  )
}
```

## Estrutura Correta do Sistema de Permissões

### Modelo User
- Não possui campo `role` direto
- Relacionamento com `UserRoleAssignment` através de `userRoles`

### Modelo UserRoleAssignment
```prisma
model UserRoleAssignment {
  id          String   @id @default(cuid())
  userId      String
  companyId   String?
  role        String   // Role do usuário (SUPER_ADMIN, COMPANY_ADMIN, USER)
  permissions Json?    // Permissões personalizadas (opcional)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company     Company? @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("user_roles")
}
```

## Fluxo de Funcionamento

1. **Usuário sem role assignment**: Retorna permissões padrão baseadas no role 'USER'
2. **Usuário com role assignment**: Retorna permissões mescladas (padrão + personalizadas)
3. **Criação de role assignment**: Apenas quando necessário (PUT request)
4. **Autenticação**: Requer SUPER_ADMIN ou COMPANY_ADMIN para acessar

## Testes Realizados

✅ **Teste de simulação**: API funciona corretamente sem role assignments
✅ **Teste de criação**: Role assignment criado com sucesso
✅ **Teste de autenticação**: Erro 401 esperado quando não autenticado
✅ **Teste de estrutura**: Schema do Prisma validado

## Status

🟢 **CORRIGIDO**: A API agora funciona corretamente e não retorna mais erro 500.

### Próximos Passos

1. Testar a API com autenticação real no frontend
2. Implementar interface de gerenciamento de permissões
3. Adicionar logs de auditoria mais detalhados
4. Considerar implementar cache para permissões frequentes 