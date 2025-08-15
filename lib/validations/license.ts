import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface LicenseValidationResult {
  canCreate: boolean
  current: number
  limit: number
  usagePercentage: number
  planName?: string
  isTrial?: boolean
  trialExpiryDate?: Date
  planExpiryDate?: Date
  message?: string
}

export interface LicenseUsageStats {
  totalCompanies: number
  companiesAtLimit: number
  companiesNearLimit: number
  averageUsage: number
  totalUsers: number
  totalLicenses: number
}

/**
 * Valida se uma empresa pode criar mais usuários baseado no limite de licenças
 */
export async function validateUserLimit(companyId: string): Promise<LicenseValidationResult> {
  try {
    // Buscar dados da empresa
    const company = await prisma.tenant.findUnique({
      where: { id: companyId },
      include: {
        subscriptionPlan: true
      }
    })

    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    // Contar usuários ativos da empresa
    const currentUsers = await prisma.userRoleAssignment.count({
      where: { 
        companyId,
        isActive: true 
      }
    })

    const maxUsers = company.maxUsers || 5
    const usagePercentage = maxUsers > 0 ? (currentUsers / maxUsers) * 100 : 0
    const canCreate = currentUsers < maxUsers

    return {
      canCreate,
      current: currentUsers,
      limit: maxUsers,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      planName: company.subscriptionPlan?.name,
      isTrial: company.isTrial,
      trialExpiryDate: company.trialExpiryDate,
      planExpiryDate: company.planExpiryDate,
      message: canCreate 
        ? `Pode criar ${maxUsers - currentUsers} usuário(s) adicional(is)`
        : `Limite de ${maxUsers} usuários atingido`
    }
  } catch (error) {
    console.error('Erro ao validar limite de licenças:', error)
    throw error
  }
}

/**
 * Atualiza o contador de usuários de uma empresa
 */
export async function updateCompanyUserCount(companyId: string): Promise<void> {
  try {
    const currentUsers = await prisma.userRoleAssignment.count({
      where: { 
        companyId,
        isActive: true 
      }
    })

    await prisma.tenant.update({
      where: { id: companyId },
      data: { currentUserCount: currentUsers }
    })

    // Registrar uso de licença
    await recordLicenseUsage(companyId, currentUsers)
  } catch (error) {
    console.error('Erro ao atualizar contador de usuários:', error)
    throw error
  }
}

/**
 * Registra o uso de licenças para uma empresa
 */
export async function recordLicenseUsage(companyId: string, activeUsers: number): Promise<void> {
  try {
    const company = await prisma.tenant.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    const usagePercentage = company.maxUsers > 0 ? (activeUsers / company.maxUsers) * 100 : 0

    await prisma.licenseUsage.upsert({
      where: {
        tenantId_date: {
          tenantId: companyId,
          date: new Date()
        }
      },
      update: {
        activeUsers,
        maxUsers: company.maxUsers,
        usagePercentage: Math.round(usagePercentage * 100) / 100
      },
      create: {
        tenantId: companyId,
        date: new Date(),
        activeUsers,
        maxUsers: company.maxUsers,
        usagePercentage: Math.round(usagePercentage * 100) / 100
      }
    })
  } catch (error) {
    console.error('Erro ao registrar uso de licenças:', error)
    // Não lançar erro para não interromper o fluxo principal
  }
}

/**
 * Obtém estatísticas de uso de licenças
 */
export async function getLicenseUsageStats(): Promise<LicenseUsageStats> {
  try {
    const companies = await prisma.tenant.findMany({
      where: { isActive: true },
      include: {
        subscriptionPlan: true
      }
    })

    let totalUsers = 0
    let totalLicenses = 0
    let companiesAtLimit = 0
    let companiesNearLimit = 0

    companies.forEach(company => {
      const currentUsers = company.currentUserCount || 0
      const maxUsers = company.maxUsers || 5
      const usagePercentage = maxUsers > 0 ? (currentUsers / maxUsers) * 100 : 0

      totalUsers += currentUsers
      totalLicenses += maxUsers

      if (currentUsers >= maxUsers) {
        companiesAtLimit++
      } else if (usagePercentage >= 80) {
        companiesNearLimit++
      }
    })

    const averageUsage = companies.length > 0 ? (totalUsers / totalLicenses) * 100 : 0

    return {
      totalCompanies: companies.length,
      companiesAtLimit,
      companiesNearLimit,
      averageUsage: Math.round(averageUsage * 100) / 100,
      totalUsers,
      totalLicenses
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas de licenças:', error)
    throw error
  }
}

/**
 * Obtém histórico de uso de licenças para uma empresa
 */
export async function getCompanyLicenseHistory(
  companyId: string, 
  days: number = 30
): Promise<Array<{ date: string; activeUsers: number; maxUsers: number; usagePercentage: number }>> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const history = await prisma.licenseUsage.findMany({
      where: {
        tenantId: companyId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        date: true,
        activeUsers: true,
        maxUsers: true,
        usagePercentage: true
      }
    })

    return history.map(record => ({
      date: record.date.toISOString().split('T')[0],
      activeUsers: record.activeUsers,
      maxUsers: record.maxUsers,
      usagePercentage: record.usagePercentage
    }))
  } catch (error) {
    console.error('Erro ao obter histórico de licenças:', error)
    throw error
  }
}

/**
 * Verifica se uma empresa está próxima do limite de licenças
 */
export async function isCompanyNearLimit(companyId: string, threshold: number = 80): Promise<boolean> {
  try {
    const validation = await validateUserLimit(companyId)
    return validation.usagePercentage >= threshold
  } catch (error) {
    console.error('Erro ao verificar se empresa está próxima do limite:', error)
    return false
  }
}

/**
 * Obtém alertas de licenças para uma empresa
 */
export async function getLicenseAlerts(companyId: string): Promise<Array<{ type: string; message: string; severity: 'warning' | 'error' }>> {
  try {
    const alerts: Array<{ type: string; message: string; severity: 'warning' | 'error' }> = []
    const validation = await validateUserLimit(companyId)

    // Alerta de limite próximo (80% ou mais)
    if (validation.usagePercentage >= 80 && validation.usagePercentage < 100) {
      alerts.push({
        type: 'NEAR_LIMIT',
        message: `Você está usando ${validation.usagePercentage}% das suas licenças. Considere fazer upgrade do seu plano.`,
        severity: 'warning'
      })
    }

    // Alerta de limite atingido
    if (validation.usagePercentage >= 100) {
      alerts.push({
        type: 'LIMIT_REACHED',
        message: `Limite de ${validation.limit} usuários atingido. Não é possível criar novos usuários.`,
        severity: 'error'
      })
    }

    // Alerta de período de teste próximo do fim
    if (validation.isTrial && validation.trialExpiryDate) {
      const daysUntilExpiry = Math.ceil((validation.trialExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        alerts.push({
          type: 'TRIAL_EXPIRING',
          message: `Seu período de teste expira em ${daysUntilExpiry} dia(s).`,
          severity: 'warning'
        })
      } else if (daysUntilExpiry <= 0) {
        alerts.push({
          type: 'TRIAL_EXPIRED',
          message: 'Seu período de teste expirou. Atualize para um plano pago para continuar usando o sistema.',
          severity: 'error'
        })
      }
    }

    // Alerta de plano próximo do fim
    if (validation.planExpiryDate) {
      const daysUntilExpiry = Math.ceil((validation.planExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        alerts.push({
          type: 'PLAN_EXPIRING',
          message: `Seu plano expira em ${daysUntilExpiry} dia(s).`,
          severity: 'warning'
        })
      } else if (daysUntilExpiry <= 0) {
        alerts.push({
          type: 'PLAN_EXPIRED',
          message: 'Seu plano expirou. Renove para continuar usando o sistema.',
          severity: 'error'
        })
      }
    }

    return alerts
  } catch (error) {
    console.error('Erro ao obter alertas de licenças:', error)
    return []
  }
}
