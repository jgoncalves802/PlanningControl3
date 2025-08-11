const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIsDirectly() {
  const userId = '7b31ab25-aa54-46b9-85ed-323d3757002c'
  
  console.log('🧪 Testando APIs diretamente para userId:', userId)
  
  try {
    // 1. Verificar se o usuário existe
    console.log('\n1. Verificando se o usuário existe...')
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado no banco de dados')
      return
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive
    })
    
    // 2. Verificar role assignments
    console.log('\n2. Verificando role assignments...')
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: { userId: userId }
    })
    
    console.log('Role assignments encontrados:', userRoles.length)
    userRoles.forEach(role => {
      console.log('  - ID:', role.id, 'Role:', role.role, 'Ativo:', role.isActive)
    })
    
    // 3. Simular a API de user-role
    console.log('\n3. Simulando API de user-role...')
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (userRole) {
      console.log('✅ Resposta simulada da API user-role:')
      console.log(JSON.stringify({
        userId,
        role: userRole.role,
        companyId: userRole.companyId,
        company: userRole.company
      }, null, 2))
    } else {
      console.log('⚠️ Usuário não tem role assignment ativo')
    }
    
    // 4. Simular a API de user-permissions
    console.log('\n4. Simulando API de user-permissions...')
    
    // Permissões padrão para cada role (simplificado)
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
      },
      COMPANY_ADMIN: {
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
        backup: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        canManageUsers: false,
        canManageCompanies: false,
        canAccessSuperAdmin: false,
        canAccessCompanyAdmin: true,
        canViewAuditLogs: true,
        canManageSystemSettings: false,
        canAccessReports: true
      },
      USER: {
        dashboard: { canView: true, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        employees: { canView: true, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        contracts: { canView: true, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        budgets: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        safety: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        planning: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        transfers: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        employeeAssignment: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        workforceControl: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        nfcManagement: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        analytics: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        settings: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        backup: { canView: false, canEdit: false, canDelete: false, canCreate: false, canExport: false, canImport: false },
        canManageUsers: false,
        canManageCompanies: false,
        canAccessSuperAdmin: false,
        canAccessCompanyAdmin: false,
        canViewAuditLogs: false,
        canManageSystemSettings: false,
        canAccessReports: false
      }
    }
    
    function getDefaultPermissions(role) {
      return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.USER
    }
    
    if (userRole) {
      const defaultPermissions = getDefaultPermissions(userRole.role)
      const customPermissions = userRole.permissions
      const finalPermissions = customPermissions 
        ? { ...defaultPermissions, ...customPermissions }
        : defaultPermissions
      
      console.log('✅ Resposta simulada da API user-permissions:')
      console.log(JSON.stringify({
        userId,
        role: userRole.role,
        permissions: finalPermissions,
        customPermissions: customPermissions
      }, null, 2))
    } else {
      const defaultRole = 'USER'
      const defaultPermissions = getDefaultPermissions(defaultRole)
      
      console.log('✅ Resposta simulada da API user-permissions (sem role assignment):')
      console.log(JSON.stringify({
        userId,
        role: defaultRole,
        permissions: defaultPermissions,
        customPermissions: null,
        message: 'Usando permissões padrão (sem role assignment)'
      }, null, 2))
    }
    
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

testAPIsDirectly() 