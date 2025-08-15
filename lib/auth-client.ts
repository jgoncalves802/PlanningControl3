import { createBrowserClient } from '@supabase/ssr'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { UserPermissions, getDefaultPermissions, mergePermissions } from '@/lib/types/permissions'
import type { User } from '@/lib/types/user'

// Singleton para o cliente Supabase
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

// Função para obter usuário atual
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = getSupabaseClient()
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
    
    if (error || !supabaseUser) {
      console.log('[auth-client] Nenhum usuário autenticado')
      return null
    }

    const user = await transformSupabaseUser(supabaseUser)
    console.log('[auth-client] Usuário obtido:', user)
    return user
  } catch (error) {
    console.error('[auth-client] Erro ao obter usuário atual:', error)
    return null
  }
}

// Função para obter sessão
export async function getSession() {
  try {
    const supabase = getSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[auth-client] Erro ao obter sessão:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('[auth-client] Erro ao obter sessão:', error)
    return null
  }
}

// Função para transformar usuário do Supabase
async function transformSupabaseUser(supabaseUser: SupabaseUser): Promise<User> {
  try {
    // Buscar role assignment e companyId do banco de dados
    const userRoleData = await getUserRoleData(supabaseUser.id)
    
    // Buscar permissões personalizadas do banco de dados
    const customPermissions = await getUserCustomPermissions(supabaseUser.id)
    
    // Determinar role baseado nos dados do banco ou usar padrão
    const role = userRoleData?.role || 'SUPER_ADMIN'
    const companyId = userRoleData?.companyId || null
    
    // Obter permissões padrão baseadas no role
    const defaultPermissions = getDefaultPermissions(role as any)
    
    // Mesclar permissões personalizadas com padrões
    const finalPermissions = customPermissions 
      ? mergePermissions(defaultPermissions, customPermissions)
      : defaultPermissions

    const user: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email!,
      role: role as any,
      companyId: companyId || undefined,
      isActive: true,
      avatar: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at),
      permissions: finalPermissions
    }
    
    console.log('[auth-client] Usuário transformado:', user)
    return user
  } catch (error) {
    console.error('[auth-client] Erro ao transformar usuário:', error)
    
    // Fallback em caso de erro - usar permissões de SUPER_ADMIN
    const fallbackUser: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Super Administrador',
      email: supabaseUser.email!,
      role: 'SUPER_ADMIN',
      isActive: true,
      avatar: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at),
      permissions: getDefaultPermissions('SUPER_ADMIN')
    }
    
    console.log('[auth-client] Usando usuário fallback:', fallbackUser)
    return fallbackUser
  }
}

// Função para buscar dados do role assignment do usuário
async function getUserRoleData(userId: string): Promise<{ role: string; companyId?: string } | null> {
  try {
    console.log('[auth-client] Buscando role data para userId:', userId)
    const response = await fetch(`/api/settings/user-role/${userId}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('[auth-client] Role data encontrado:', data)
      return data
    } else if (response.status === 404) {
      console.log('[auth-client] Usuário não encontrado no banco, usando fallback')
      return null
    } else {
      console.error('[auth-client] Erro na API user-role:', response.status, response.statusText)
      return null
    }
  } catch (error) {
    console.error('[auth-client] Erro ao buscar dados do role:', error)
    return null
  }
}

// Função para buscar permissões personalizadas do banco
async function getUserCustomPermissions(userId: string): Promise<UserPermissions | null> {
  try {
    console.log('[auth-client] Buscando permissões para userId:', userId)
    const response = await fetch(`/api/settings/user-permissions/${userId}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('[auth-client] Permissões encontradas:', data.permissions ? 'Sim' : 'Não')
      return data.permissions
    } else if (response.status === 404) {
      console.log('[auth-client] Usuário não encontrado no banco, usando permissões padrão')
      return null
    } else {
      console.error('[auth-client] Erro na API user-permissions:', response.status, response.statusText)
      return null
    }
  } catch (error) {
    console.error('[auth-client] Erro ao buscar permissões personalizadas:', error)
    return null
  }
}

// Função para mapear roles do banco para nosso sistema
function mapRoleFromDatabase(role: string): 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER' {
  switch (role?.toUpperCase()) {
    case 'SUPER_ADMIN':
      return 'SUPER_ADMIN'
    case 'COMPANY_ADMIN':
      return 'COMPANY_ADMIN'
    case 'USER':
      return 'USER'
    default:
      return 'USER'
  }
}

// Função para obter permissões do usuário
export function getUserPermissions(user: User | null) {
  if (!user) return { 
    canRead: false, 
    canWrite: false, 
    canDelete: false, 
    canAdmin: false,
    canManageUsers: false,
    canManageCompanies: false,
    canAccessSettings: false,
    canAccessSuperAdmin: false,
    canAccessCompanyAdmin: false,
    canAccessEmployees: false,
    canAccessContracts: false,
    canAccessBudgets: false,
    canAccessPlanning: false,
    canAccessTransfers: false,
    canAccessWorkforce: false,
    canAccessNFC: false,
    canAccessAnalytics: false,
    canAccessBackup: false
  }

  // Se o usuário tem permissões granulares, usar elas
  if (user.permissions) {
    return {
      canRead: true, // Sempre pode ler se tem permissões
      canWrite: user.permissions.canManageSystemSettings,
      canDelete: user.permissions.canManageSystemSettings,
      canAdmin: user.permissions.canManageSystemSettings,
      canManageUsers: user.permissions.canManageUsers,
      canManageCompanies: user.permissions.canManageCompanies,
      canAccessSettings: user.permissions.settings.canView,
      canAccessSuperAdmin: user.permissions.canAccessSuperAdmin,
      canAccessCompanyAdmin: user.permissions.canAccessCompanyAdmin,
      canAccessEmployees: user.permissions.employees.canView,
      canAccessContracts: user.permissions.contracts.canView,
      canAccessBudgets: user.permissions.budgets.canView,
      canAccessPlanning: user.permissions.planning.canView,
      canAccessTransfers: user.permissions.transfers.canView,
      canAccessWorkforce: user.permissions.workforceControl.canView,
      canAccessNFC: user.permissions.nfcManagement.canView,
      canAccessAnalytics: user.permissions.analytics.canView,
      canAccessBackup: user.permissions.backup.canView
    }
  }

  // Fallback para o sistema antigo baseado em roles
  switch (user.role) {
    case 'SUPER_ADMIN':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canAdmin: true,
        canManageUsers: true,
        canManageCompanies: true,
        canAccessSettings: true,
        canAccessSuperAdmin: true,
        canAccessCompanyAdmin: true,
        canAccessEmployees: true,
        canAccessContracts: true,
        canAccessBudgets: true,
        canAccessPlanning: true,
        canAccessTransfers: true,
        canAccessWorkforce: true,
        canAccessNFC: true,
        canAccessAnalytics: true,
        canAccessBackup: true
      }
    case 'COMPANY_ADMIN':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canAdmin: true,
        canManageUsers: false,
        canManageCompanies: false,
        canAccessSettings: true,
        canAccessSuperAdmin: false,
        canAccessCompanyAdmin: true,
        canAccessEmployees: true,
        canAccessContracts: true,
        canAccessBudgets: true,
        canAccessPlanning: true,
        canAccessTransfers: true,
        canAccessWorkforce: true,
        canAccessNFC: true,
        canAccessAnalytics: true,
        canAccessBackup: false
      }
    case 'USER':
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canAdmin: false,
        canManageUsers: false,
        canManageCompanies: false,
        canAccessSettings: false,
        canAccessSuperAdmin: false,
        canAccessCompanyAdmin: false,
        canAccessEmployees: true,
        canAccessContracts: true,
        canAccessBudgets: false,
        canAccessPlanning: false,
        canAccessTransfers: false,
        canAccessWorkforce: false,
        canAccessNFC: false,
        canAccessAnalytics: false,
        canAccessBackup: false
      }
    default:
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canAdmin: false,
        canManageUsers: false,
        canManageCompanies: false,
        canAccessSettings: false,
        canAccessSuperAdmin: false,
        canAccessCompanyAdmin: false,
        canAccessEmployees: false,
        canAccessContracts: false,
        canAccessBudgets: false,
        canAccessPlanning: false,
        canAccessTransfers: false,
        canAccessWorkforce: false,
        canAccessNFC: false,
        canAccessAnalytics: false,
        canAccessBackup: false
      }
  }
}

// Função para validar acesso do usuário
export function validateUserAccess(user: User | null, requiredRole: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER' = 'USER') {
  if (!user) return false

  const roleHierarchy = {
    'USER': 1,
    'COMPANY_ADMIN': 2,
    'SUPER_ADMIN': 3
  }

  const userLevel = roleHierarchy[user.role] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  return userLevel >= requiredLevel
}

// Função para validar acesso específico a páginas
export function validatePageAccess(user: User | null, page: string): boolean {
  if (!user) return false

  // Normalizar a página para remover parâmetros dinâmicos
  const normalizedPage = normalizePagePath(page)

  // Se o usuário tem permissões granulares, usar elas
  if (user.permissions) {
    const pagePermissions: Record<string, boolean> = {
      '/dashboard': user.permissions.dashboard?.canView || false,
      '/dashboard/employees': user.permissions.employees?.canView || false,
      '/dashboard/contracts': user.permissions.contracts?.canView || false,
      '/dashboard/budgets': user.permissions.budgets?.canView || false,
      '/dashboard/safety': user.permissions.safety?.canView || false,
      '/dashboard/planning': user.permissions.planning?.canView || false,
      '/dashboard/transfers': user.permissions.transfers?.canView || false,
      '/dashboard/employee-assignment': user.permissions.employeeAssignment?.canView || false,
      '/dashboard/workforce-control': user.permissions.workforceControl?.canView || false,
      '/dashboard/nfc-management': user.permissions.nfcManagement?.canView || false,
      '/dashboard/analytics': user.permissions.analytics?.canView || false,
      '/dashboard/settings': user.permissions.settings?.canView || false,
      '/dashboard/backup': user.permissions.backup?.canView || false,
    }

    return pagePermissions[normalizedPage] || false
  }

  // Fallback para o sistema antigo
  const permissions = getUserPermissions(user)
  
  const pagePermissions: Record<string, boolean> = {
    '/dashboard': true, // Dashboard sempre acessível se logado
    '/dashboard/employees': permissions.canAccessEmployees,
    '/dashboard/contracts': permissions.canAccessContracts,
    '/dashboard/budgets': permissions.canAccessBudgets,
    '/dashboard/safety': permissions.canAccessPlanning,
    '/dashboard/planning': permissions.canAccessPlanning,
    '/dashboard/transfers': permissions.canAccessTransfers,
    '/dashboard/employee-assignment': permissions.canAccessWorkforce,
    '/dashboard/workforce-control': permissions.canAccessWorkforce,
    '/dashboard/nfc-management': permissions.canAccessNFC,
    '/dashboard/analytics': permissions.canAccessAnalytics,
    '/dashboard/settings': permissions.canAccessSettings,
    '/dashboard/backup': permissions.canAccessBackup,
  }

  return pagePermissions[normalizedPage] || false
}

// Função para normalizar caminhos de página (remover parâmetros dinâmicos)
function normalizePagePath(page: string): string {
  // Remover IDs dinâmicos (UUIDs, números, etc.)
  let normalized = page
  
  // Padrões comuns de IDs dinâmicos
  const dynamicPatterns = [
    /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, // UUID
    /\/[a-z0-9]{20,}$/i, // IDs longos (como os do Prisma)
    /\/\d+$/i, // Números
    /\/[a-z0-9]{16,}$/i, // IDs médios
  ]
  
  for (const pattern of dynamicPatterns) {
    normalized = normalized.replace(pattern, '')
  }
  
  // Se a página termina com /, remover
  if (normalized.endsWith('/') && normalized !== '/') {
    normalized = normalized.slice(0, -1)
  }
  
  return normalized
}

// Função para validar permissões granulares
export function validateGranularPermission(
  user: User | null, 
  page: string, 
  action: 'view' | 'edit' | 'delete' | 'create' | 'export' | 'import'
): boolean {
  if (!user || !user.permissions) return false

  const pageKey = page.replace('/dashboard/', '').replace('-', '') as keyof UserPermissions
  const pagePermissions = user.permissions[pageKey] as any

  if (!pagePermissions) return false

  switch (action) {
    case 'view':
      return pagePermissions.canView
    case 'edit':
      return pagePermissions.canEdit
    case 'delete':
      return pagePermissions.canDelete
    case 'create':
      return pagePermissions.canCreate
    case 'export':
      return pagePermissions.canExport
    case 'import':
      return pagePermissions.canImport
    default:
      return false
  }
}

// Função para verificar se usuário pode acessar dados de uma empresa específica
export function canAccessCompanyData(user: User | null, targetCompanyId?: string): boolean {
  if (!user) return false
  
  // SUPER_ADMIN pode acessar dados de todas as empresas
  if (user.role === 'SUPER_ADMIN') return true
  
  // COMPANY_ADMIN só pode acessar dados da sua própria empresa
  if (user.role === 'COMPANY_ADMIN') {
    return user.companyId === targetCompanyId
  }
  
  // USER só pode acessar dados da sua própria empresa
  if (user.role === 'USER') {
    return user.companyId === targetCompanyId
  }
  
  return false
}

// Função para obter filtros de empresa baseados no role do usuário
export function getCompanyFilters(user: User | null): { companyId?: string } {
  if (!user) return {}
  
  // SUPER_ADMIN não tem filtro (acessa todas as empresas)
  if (user.role === 'SUPER_ADMIN') return {}
  
  // COMPANY_ADMIN e USER só acessam dados da sua empresa
  return { companyId: user.companyId }
} 