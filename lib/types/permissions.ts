// Tipos para o sistema de permissões granulares

export interface PagePermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canCreate: boolean
  canExport: boolean
  canImport: boolean
}

export interface UserPermissions {
  // Permissões por página
  dashboard: PagePermissions
  employees: PagePermissions
  contracts: PagePermissions
  budgets: PagePermissions
  safety: PagePermissions
  planning: PagePermissions
  transfers: PagePermissions
  employeeAssignment: PagePermissions
  workforceControl: PagePermissions
  nfcManagement: PagePermissions
  analytics: PagePermissions
  settings: PagePermissions
  backup: PagePermissions
  
  // Permissões especiais
  canManageUsers: boolean
  canManageCompanies: boolean
  canAccessSuperAdmin: boolean
  canAccessCompanyAdmin: boolean
  
  // Permissões de sistema
  canViewAuditLogs: boolean
  canManageSystemSettings: boolean
  canAccessReports: boolean
}

export interface RolePermissions {
  SUPER_ADMIN: UserPermissions
  COMPANY_ADMIN: UserPermissions
  USER: UserPermissions
}

// Permissões padrão para cada role
export const DEFAULT_PERMISSIONS: RolePermissions = {
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

// Função para obter permissões padrão por role
export function getDefaultPermissions(role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER'): UserPermissions {
  return DEFAULT_PERMISSIONS[role]
}

// Função para mesclar permissões personalizadas com padrões
export function mergePermissions(
  defaultPermissions: UserPermissions,
  customPermissions: Partial<UserPermissions>
): UserPermissions {
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