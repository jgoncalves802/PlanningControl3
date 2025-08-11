const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPermissionsToggle() {
  const userId = '7b31ab25-aa54-46b9-85ed-323d3757002c'
  
  console.log('🧪 Testando toggle de permissões para userId:', userId)
  
  try {
    // 1. Verificar estado atual
    console.log('\n1. Verificando estado atual...')
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })
    
    if (!userRole) {
      console.log('❌ Usuário não tem role assignment')
      return
    }
    
    console.log('✅ Estado atual:', {
      id: userRole.id,
      role: userRole.role,
      hasCustomPermissions: !!userRole.permissions,
      permissionsCount: Object.keys(userRole.permissions || {}).length
    })
    
    // 2. Simular toggle de permissões
    console.log('\n2. Simulando toggles de permissões...')
    
    // Estado inicial - sem permissões customizadas
    let currentPermissions = null
    console.log('📝 Estado inicial - sem permissões customizadas')
    
    // Toggle 1: Ativar permissão de visualizar dashboard
    console.log('\n🔄 Toggle 1: Ativar canView para dashboard')
    currentPermissions = {
      dashboard: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      }
    }
    
    await prisma.userRoleAssignment.update({
      where: { id: userRole.id },
      data: { permissions: currentPermissions, updatedAt: new Date() }
    })
    console.log('✅ Toggle 1 aplicado')
    
    // Toggle 2: Ativar permissão de editar funcionários
    console.log('\n🔄 Toggle 2: Ativar canEdit para employees')
    currentPermissions = {
      ...currentPermissions,
      employees: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      }
    }
    
    await prisma.userRoleAssignment.update({
      where: { id: userRole.id },
      data: { permissions: currentPermissions, updatedAt: new Date() }
    })
    console.log('✅ Toggle 2 aplicado')
    
    // Toggle 3: Desativar permissão de visualizar dashboard
    console.log('\n🔄 Toggle 3: Desativar canView para dashboard')
    currentPermissions = {
      ...currentPermissions,
      dashboard: {
        ...currentPermissions.dashboard,
        canView: false
      }
    }
    
    await prisma.userRoleAssignment.update({
      where: { id: userRole.id },
      data: { permissions: currentPermissions, updatedAt: new Date() }
    })
    console.log('✅ Toggle 3 aplicado')
    
    // Toggle 4: Ativar múltiplas permissões
    console.log('\n🔄 Toggle 4: Ativar múltiplas permissões')
    currentPermissions = {
      dashboard: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canCreate: false,
        canExport: true,
        canImport: false
      },
      employees: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canCreate: true,
        canExport: true,
        canImport: false
      },
      contracts: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      }
    }
    
    await prisma.userRoleAssignment.update({
      where: { id: userRole.id },
      data: { permissions: currentPermissions, updatedAt: new Date() }
    })
    console.log('✅ Toggle 4 aplicado')
    
    // 3. Verificar estado final
    console.log('\n3. Verificando estado final...')
    const finalUserRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })
    
    console.log('✅ Estado final:', {
      id: finalUserRole.id,
      role: finalUserRole.role,
      hasCustomPermissions: !!finalUserRole.permissions,
      permissionsCount: Object.keys(finalUserRole.permissions || {}).length,
      permissions: finalUserRole.permissions
    })
    
    // 4. Simular reset
    console.log('\n4. Simulando reset de permissões...')
    await prisma.userRoleAssignment.update({
      where: { id: userRole.id },
      data: { permissions: null, updatedAt: new Date() }
    })
    
    const resetUserRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })
    
    console.log('✅ Estado após reset:', {
      id: resetUserRole.id,
      role: resetUserRole.role,
      hasCustomPermissions: !!resetUserRole.permissions,
      permissions: resetUserRole.permissions
    })
    
    console.log('\n🎉 Teste de toggle de permissões concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    
    if (error instanceof Error) {
      console.error('Erro detalhado:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  } finally {
    await prisma.$disconnect()
  }
}

testPermissionsToggle() 