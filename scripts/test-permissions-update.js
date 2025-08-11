const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPermissionsUpdate() {
  const userId = '7b31ab25-aa54-46b9-85ed-323d3757002c'
  
  console.log('🧪 Testando atualização de permissões para userId:', userId)
  
  try {
    // 1. Verificar permissões atuais
    console.log('\n1. Verificando permissões atuais...')
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
    
    console.log('✅ Role assignment encontrado:', {
      id: userRole.id,
      role: userRole.role,
      permissions: userRole.permissions
    })
    
    // 2. Simular permissões personalizadas
    console.log('\n2. Simulando permissões personalizadas...')
    const customPermissions = {
      dashboard: {
        canView: true,
        canEdit: false,
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
      },
      budgets: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      safety: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      planning: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      transfers: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      employeeAssignment: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      workforceControl: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      nfcManagement: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      analytics: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: true,
        canImport: false
      },
      settings: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      backup: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      canManageUsers: false,
      canManageCompanies: false,
      canAccessSuperAdmin: false,
      canAccessCompanyAdmin: false,
      canViewAuditLogs: false,
      canManageSystemSettings: false,
      canAccessReports: true
    }
    
    // 3. Atualizar permissões no banco
    console.log('\n3. Atualizando permissões no banco...')
    const updatedUserRole = await prisma.userRoleAssignment.update({
      where: {
        id: userRole.id
      },
      data: {
        permissions: customPermissions,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Permissões atualizadas:', {
      id: updatedUserRole.id,
      role: updatedUserRole.role,
      permissions: updatedUserRole.permissions
    })
    
    // 4. Verificar se a API retorna as permissões corretas
    console.log('\n4. Verificando resposta da API...')
    
    // Simular a lógica da API
    const DEFAULT_PERMISSIONS = {
      SUPER_ADMIN: {
        dashboard: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        employees: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        contracts: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        budgets: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        safety: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        planning: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        transfers: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        employeeAssignment: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        workforceControl: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        nfcManagement: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        analytics: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        settings: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        backup: { canView: true, canEdit: true, canDelete: true, canCreate: true, canExport: true, canImport: true },
        canManageUsers: true,
        canManageCompanies: true,
        canAccessSuperAdmin: true,
        canAccessCompanyAdmin: true,
        canViewAuditLogs: true,
        canManageSystemSettings: true,
        canAccessReports: true
      }
    }
    
    function getDefaultPermissions(role) {
      return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.SUPER_ADMIN
    }
    
    function mergePermissions(defaultPermissions, customPermissions) {
      return {
        ...defaultPermissions,
        ...customPermissions,
        // Mesclar permissões de páginas individualmente
        dashboard: { ...defaultPermissions.dashboard, ...customPermissions.dashboard },
        employees: { ...defaultPermissions.employees, ...customPermissions.employees },
        contracts: { ...defaultPermissions.contracts, ...customPermissions.contracts },
        budgets: { ...defaultPermissions.budgets, ...customPermissions.budgets },
        safety: { ...defaultPermissions.safety, ...customPermissions.safety },
        planning: { ...defaultPermissions.planning, ...customPermissions.planning },
        transfers: { ...defaultPermissions.transfers, ...customPermissions.transfers },
        employeeAssignment: { ...defaultPermissions.employeeAssignment, ...customPermissions.employeeAssignment },
        workforceControl: { ...defaultPermissions.workforceControl, ...customPermissions.workforceControl },
        nfcManagement: { ...defaultPermissions.nfcManagement, ...customPermissions.nfcManagement },
        analytics: { ...defaultPermissions.analytics, ...customPermissions.analytics },
        settings: { ...defaultPermissions.settings, ...customPermissions.settings },
        backup: { ...defaultPermissions.backup, ...customPermissions.backup }
      }
    }
    
    const defaultPermissions = getDefaultPermissions(updatedUserRole.role)
    const finalPermissions = mergePermissions(defaultPermissions, updatedUserRole.permissions)
    
    console.log('✅ Resposta simulada da API:')
    console.log(JSON.stringify({
      userId,
      role: updatedUserRole.role,
      permissions: finalPermissions,
      customPermissions: updatedUserRole.permissions
    }, null, 2))
    
    // 5. Testar reset de permissões
    console.log('\n5. Testando reset de permissões...')
    const resetUserRole = await prisma.userRoleAssignment.update({
      where: {
        id: userRole.id
      },
      data: {
        permissions: null,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Permissões resetadas:', {
      id: resetUserRole.id,
      role: resetUserRole.role,
      permissions: resetUserRole.permissions
    })
    
    console.log('\n🎉 Teste de atualização de permissões concluído com sucesso!')
    
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

testPermissionsUpdate() 