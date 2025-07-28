export interface UserPermissions {
  canViewAllContracts: boolean
  allowedContracts: string[]
  role: UserRole
  contractAccess: 'ALL' | 'ASSIGNED' | 'NONE'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',           // Vê todos os contratos
  TENANT_ADMIN = 'TENANT_ADMIN',         // Vê todos os contratos
  CONTRACT_MANAGER = 'CONTRACT_MANAGER', // Vê apenas contratos atribuídos
  HR = 'HR',                             // Vê todos os contratos
  PLANNING = 'PLANNING',                 // Vê todos os contratos
  SAFETY = 'SAFETY',                     // Vê todos os contratos
  SUPERVISOR = 'SUPERVISOR',             // Vê apenas contratos atribuídos
  OPERATOR = 'OPERATOR'                  // Vê apenas contratos atribuídos
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  assignedContracts?: string[]
  isActive: boolean
  avatar?: string
  createdAt?: Date
  /**
   * URL ou base64 da logo da empresa associada ao usuário.
   * Usado para personalização de exportação e identidade visual.
   */
  companyLogo?: string
}

export const getUserPermissions = (user: User): UserPermissions => {
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.TENANT_ADMIN:
    case UserRole.HR:
    case UserRole.PLANNING:
    case UserRole.SAFETY:
      return {
        canViewAllContracts: true,
        allowedContracts: [],
        role: user.role,
        contractAccess: 'ALL'
      }
    
    case UserRole.CONTRACT_MANAGER:
    case UserRole.SUPERVISOR:
    case UserRole.OPERATOR:
      return {
        canViewAllContracts: false,
        allowedContracts: user.assignedContracts || [],
        role: user.role,
        contractAccess: 'ASSIGNED'
      }
    
    default:
      return {
        canViewAllContracts: false,
        allowedContracts: [],
        role: user.role,
        contractAccess: 'NONE'
      }
  }
}

export const canUserAccessContract = (user: User, contractId: string): boolean => {
  const permissions = getUserPermissions(user)
  
  if (permissions.canViewAllContracts) {
    return true
  }
  
  return permissions.allowedContracts.includes(contractId)
}

export const getAccessibleContracts = (user: User, allContracts: any[]): any[] => {
  const permissions = getUserPermissions(user)
  
  if (permissions.canViewAllContracts) {
    return allContracts
  }
  
  return allContracts.filter(contract => 
    permissions.allowedContracts.includes(contract.id)
  )
}

export const getCurrentUser = (): User => {
  // Em produção, isso viria do token JWT ou sessão autenticada
  if (typeof window !== 'undefined') {
    // Cliente-side
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        
        // Mapear dados do usuário para incluir contratos atribuídos baseado na função
        const userWithContracts: User = {
          ...user,
          assignedContracts: getUserAssignedContracts(user)
        }
        
        return userWithContracts
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
      }
    }
  }
  
  // Usuário padrão para demonstração (remover em produção)
  return {
    id: '1',
    name: 'Admin Geral',
    email: 'admin@demo-company.com',
    role: UserRole.TENANT_ADMIN,
    isActive: true,
    companyLogo: '/logo-demo-company.png' // Exemplo: caminho relativo ou base64
  }
}

// Versão para uso no servidor (APIs)
export const getCurrentUserServer = (): User => {
  // Usuário padrão para demonstração (remover em produção)
  return {
    id: '1',
    name: 'Admin Geral',
    email: 'admin@demo-company.com',
    role: UserRole.TENANT_ADMIN,
    isActive: true,
    companyLogo: '/logo-demo-company.png'
  }
}

// Função auxiliar para determinar contratos atribuídos baseado na função do usuário
const getUserAssignedContracts = (user: any): string[] => {
  // Em produção, isso viria do banco de dados
  // Por enquanto, mapear baseado no email para demonstração
  const contractMappings: { [key: string]: string[] } = {
    'supervisor.const@demo-company.com': ['1'], // Construction Project Alpha
    'manager.mfg@demo-company.com': ['2'],      // Manufacturing Unit B
    'supervisor.fac@demo-company.com': ['3'],   // Facility Services
    'operator.const@demo-company.com': ['1']    // Construction Project Alpha
  }
  
  return contractMappings[user.email] || []
}

// Função para validar permissões de acesso
export const validateUserAccess = (user: User, requiredPermission: string): boolean => {
  const permissions = getUserPermissions(user)
  
  switch (requiredPermission) {
    case 'VIEW_ALL_CONTRACTS':
      return permissions.canViewAllContracts
    case 'MANAGE_EMPLOYEES':
      return [UserRole.TENANT_ADMIN, UserRole.HR, UserRole.CONTRACT_MANAGER].includes(user.role)
    case 'MANAGE_SAFETY':
      return [UserRole.TENANT_ADMIN, UserRole.SAFETY, UserRole.SUPERVISOR].includes(user.role)
    case 'MANAGE_CONTRACT_TRAININGS':
      return [UserRole.TENANT_ADMIN, UserRole.SAFETY].includes(user.role)
    case 'VIEW_ANALYTICS':
      return [UserRole.TENANT_ADMIN, UserRole.HR, UserRole.PLANNING, UserRole.CONTRACT_MANAGER].includes(user.role)
    default:
      return false
  }
}

// Função para log de auditoria (implementar em produção)
export const logUserAction = (user: User, action: string, details?: any): void => {
  // Em produção, enviar para sistema de auditoria

}
