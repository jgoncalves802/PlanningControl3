import { z } from 'zod'

// Schema para validação de criação de user role
export const createUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID é obrigatório'),
  role: z.string().min(1, 'Role é obrigatório'),
  companyId: z.string().optional(),
  permissions: z.any().optional(),
  isActive: z.boolean().default(true)
})

// Schema para validação de atualização de user role
export const updateUserRoleSchema = z.object({
  role: z.string().min(1, 'Role é obrigatório').optional(),
  companyId: z.string().optional(),
  permissions: z.any().optional(),
  isActive: z.boolean().optional()
})

// Função para validar se um usuário já tem um role específico
export async function validateUserRoleExists(
  prisma: any,
  userId: string,
  role: string,
  excludeId?: string
): Promise<{ exists: boolean; existingRole?: any }> {
  try {
    const existingRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId,
        role,
        ...(excludeId && { id: { not: excludeId } })
      }
    })

    return {
      exists: !!existingRole,
      existingRole
    }
  } catch (error) {
    console.error('Erro ao validar role existente:', error)
    throw new Error('Erro ao validar role existente')
  }
}

// Função para validar se um usuário pode ter múltiplos roles
export async function validateUserRoleLimit(
  prisma: any,
  userId: string,
  maxRoles: number = 1
): Promise<{ canAdd: boolean; currentCount: number }> {
  try {
    const currentRoles = await prisma.userRoleAssignment.count({
      where: { userId, isActive: true }
    })

    return {
      canAdd: currentRoles < maxRoles,
      currentCount: currentRoles
    }
  } catch (error) {
    console.error('Erro ao validar limite de roles:', error)
    throw new Error('Erro ao validar limite de roles')
  }
}

// Função para validar permissões de role
export function validateRolePermissions(role: string, permissions: any): boolean {
  // Roles específicos devem ter permissões válidas
  if (role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN') {
    return permissions && typeof permissions === 'object'
  }
  
  // Outros roles podem ter permissões opcionais
  return true
}

// Função para normalizar dados de role
export function normalizeUserRoleData(data: any) {
  return {
    userId: data.userId?.trim(),
    role: data.role?.trim().toUpperCase(),
    companyId: data.companyId?.trim() || null,
    permissions: data.permissions || null,
    isActive: data.isActive !== undefined ? data.isActive : true
  }
}

// Função para validar integridade dos dados
export function validateUserRoleIntegrity(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.userId || data.userId.length < 1) {
    errors.push('User ID é obrigatório')
  }
  
  if (!data.role || data.role.length < 1) {
    errors.push('Role é obrigatório')
  }
  
  // Validar se o role é válido
  const validRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'USER', 'HR', 'PLANNING', 'SAFETY', 'CONTRACT_MANAGER', 'SUPERVISOR', 'OPERATOR']
  if (!validRoles.includes(data.role)) {
    errors.push(`Role '${data.role}' não é válido. Roles válidos: ${validRoles.join(', ')}`)
  }
  
  // Validar permissões para roles específicos
  if ((data.role === 'SUPER_ADMIN' || data.role === 'COMPANY_ADMIN') && !data.permissions) {
    errors.push(`Role '${data.role}' deve ter permissões definidas`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
} 