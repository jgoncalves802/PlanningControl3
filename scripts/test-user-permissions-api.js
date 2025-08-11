const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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

async function testUserPermissionsAPI() {
  const userId = 'cmdt1nl930001i8bc2qwokeuu'
  
  console.log('🧪 Testando API de permissões para userId:', userId)
  
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
      role: user.role,
      isActive: user.isActive
    })
    
    // 2. Simular a lógica da API GET
    console.log('\n2. Simulando lógica da API GET...')
    
    // Buscar role assignment do usuário
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })
    
    if (!userRole) {
      console.log('⚠️ Usuário não tem role assignment ativo, usando permissões padrão...')
      
      // Usar o role do usuário ou 'USER' como padrão
      const defaultRole = user.role || 'USER'
      const defaultPermissions = getDefaultPermissions(defaultRole)
      
      console.log('✅ Resposta simulada da API:')
      console.log(JSON.stringify({
        userId,
        role: defaultRole,
        permissions: defaultPermissions,
        customPermissions: null,
        message: 'Usando permissões padrão (sem role assignment)'
      }, null, 2))
      
      return
    }
    
    console.log('✅ Role assignment encontrado:', userRole.id, 'Role:', userRole.role)
    
    // Obter permissões padrão baseadas no role
    const defaultPermissions = getDefaultPermissions(userRole.role)
    
    // Mesclar com permissões personalizadas se existirem
    const customPermissions = userRole.permissions
    const finalPermissions = customPermissions 
      ? { ...defaultPermissions, ...customPermissions }
      : defaultPermissions
    
    console.log('✅ Resposta simulada da API:')
    console.log(JSON.stringify({
      userId,
      role: userRole.role,
      permissions: finalPermissions,
      customPermissions: customPermissions
    }, null, 2))
    
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

testUserPermissionsAPI() 