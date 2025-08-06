// Re-exportações para manter compatibilidade
export type { User } from './auth-client'
export { getCurrentUser, getSession, getUserPermissions, validateUserAccess } from './auth-client'
export { getCurrentUserServer, getServerSession } from './auth-server'
