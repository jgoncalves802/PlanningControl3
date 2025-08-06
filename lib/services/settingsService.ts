import { prisma } from '@/lib/prisma';
import { CompanyStatus, SubscriptionPlan, SecurityLevel, InfrastructureStatus } from '@prisma/client';

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface CompanyData {
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: any;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  timezone?: string;
  language?: string;
  subscriptionPlan?: SubscriptionPlan;
  maxUsers?: number;
  maxContracts?: number;
  maxEmployees?: number;
}

export interface CompanySettingsData {
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  autoBackup?: boolean;
  backupFrequency?: string;
  dataRetentionDays?: number;
  apiRateLimit?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  securityLevel?: SecurityLevel;
  twoFactorRequired?: boolean;
  sessionTimeout?: number;
}

export interface InfrastructureData {
  serverName: string;
  serverType: string;
  status?: InfrastructureStatus;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkUsage?: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  backupStatus?: string;
  securityStatus?: string;
}

export interface GlobalSettingsData {
  systemName?: string;
  systemVersion?: string;
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  maxCompanies?: number;
  maxUsersPerCompany?: number;
  defaultPlan?: SubscriptionPlan;
  supportEmail?: string;
  supportPhone?: string;
}

export interface UserRoleData {
  userId: string;
  companyId?: string;
  role: string; // Usando string para compatibilidade
  permissions?: any;
  isActive?: boolean;
}

// ========================================
// SERVIÇOS DE EMPRESA
// ========================================

export class CompanyService {
  // Criar empresa
  static async createCompany(data: CompanyData) {
    try {
      console.log('🏢 CompanyService.createCompany - Iniciando criação');
      console.log('📦 Dados recebidos:', JSON.stringify(data, null, 2));

      // Preparar dados para criação
      const companyData = {
        name: data.name,
        cnpj: data.cnpj,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor || "#007bff",
        secondaryColor: data.secondaryColor || "#6c757d",
        domain: data.domain || null,
        timezone: data.timezone || "America/Sao_Paulo",
        language: data.language || "pt-BR",
        subscriptionPlan: data.subscriptionPlan || "BASIC",
        maxUsers: data.maxUsers || 10,
        maxContracts: data.maxContracts || 5,
        maxEmployees: data.maxEmployees || 100
      };

      console.log('📋 Dados preparados:', JSON.stringify(companyData, null, 2));

      const company = await prisma.company.create({
        data: companyData,
        include: {
          settings: true
        }
      });

      console.log('✅ Empresa criada com sucesso:', company.id);
      return company;
    } catch (error) {
      console.error('💥 Erro ao criar empresa:', error);
      console.error('💥 Stack trace:', error.stack);
      throw error;
    }
  }

  // Buscar empresa por ID
  static async getCompanyById(id: string) {
    return await prisma.company.findUnique({
      where: { id },
      include: {
        settings: true,
        userRoles: {
          include: {
            user: true
          }
        }
      }
    });
  }

  // Listar todas as empresas
  static async getAllCompanies() {
    return await prisma.company.findMany({
      include: {
        settings: true,
        _count: {
          select: {
            userRoles: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Atualizar empresa
  static async updateCompany(id: string, data: Partial<CompanyData>) {
    return await prisma.company.update({
      where: { id },
      data,
      include: {
        settings: true
      }
    });
  }

  // Atualizar status da empresa
  static async updateCompanyStatus(id: string, status: CompanyStatus) {
    return await prisma.company.update({
      where: { id },
      data: { status },
      include: {
        settings: true
      }
    });
  }

  // Deletar empresa
  static async deleteCompany(id: string) {
    return await prisma.company.delete({
      where: { id }
    });
  }

  // Buscar empresa por CNPJ
  static async getCompanyByCnpj(cnpj: string) {
    return await prisma.company.findUnique({
      where: { cnpj },
      include: {
        settings: true
      }
    });
  }

  // Buscar empresa por email
  static async getCompanyByEmail(email: string) {
    return await prisma.company.findUnique({
      where: { email },
      include: {
        settings: true
      }
    });
  }
}

// ========================================
// SERVIÇOS DE CONFIGURAÇÕES DA EMPRESA
// ========================================

export class CompanySettingsService {
  // Buscar configurações da empresa
  static async getCompanySettings(companyId: string) {
    return await prisma.companySettings.findUnique({
      where: { companyId },
      include: {
        company: true
      }
    });
  }

  // Atualizar configurações da empresa
  static async updateCompanySettings(companyId: string, data: CompanySettingsData) {
    return await prisma.companySettings.upsert({
      where: { companyId },
      update: data,
      create: {
        companyId,
        ...data
      },
      include: {
        company: true
      }
    });
  }

  // Criar configurações padrão para empresa
  static async createDefaultSettings(companyId: string) {
    return await prisma.companySettings.create({
      data: {
        companyId,
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        apiRateLimit: 1000,
        maxFileSize: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
        securityLevel: 'MEDIUM',
        twoFactorRequired: false,
        sessionTimeout: 30
      }
    });
  }
}

// ========================================
// SERVIÇOS DE INFRAESTRUTURA
// ========================================

export class InfrastructureService {
  // Criar configuração de infraestrutura
  static async createInfrastructure(data: InfrastructureData) {
    return await prisma.infrastructureSettings.create({
      data
    });
  }

  // Buscar configuração de infraestrutura
  static async getInfrastructure(id: string) {
    return await prisma.infrastructureSettings.findUnique({
      where: { id }
    });
  }

  // Listar todas as configurações de infraestrutura
  static async getAllInfrastructure() {
    return await prisma.infrastructureSettings.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Atualizar configuração de infraestrutura
  static async updateInfrastructure(id: string, data: Partial<InfrastructureData>) {
    return await prisma.infrastructureSettings.update({
      where: { id },
      data
    });
  }

  // Atualizar status do servidor
  static async updateServerStatus(id: string, status: InfrastructureStatus) {
    return await prisma.infrastructureSettings.update({
      where: { id },
      data: { status }
    });
  }

  // Deletar configuração de infraestrutura
  static async deleteInfrastructure(id: string) {
    return await prisma.infrastructureSettings.delete({
      where: { id }
    });
  }
}

// ========================================
// SERVIÇOS DE CONFIGURAÇÕES GLOBAIS
// ========================================

export class GlobalSettingsService {
  // Buscar configurações globais
  static async getGlobalSettings() {
    let settings = await prisma.globalSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          systemName: 'PlanningControl',
          systemVersion: '1.0.0',
          maintenanceMode: false,
          registrationEnabled: true,
          maxCompanies: 1000,
          maxUsersPerCompany: 100,
          defaultPlan: 'BASIC',
          supportEmail: 'support@planningcontrol.com'
        }
      });
    }
    
    return settings;
  }

  // Atualizar configurações globais
  static async updateGlobalSettings(data: GlobalSettingsData) {
    const existing = await prisma.globalSettings.findFirst();
    
    if (existing) {
      return await prisma.globalSettings.update({
        where: { id: existing.id },
        data
      });
    } else {
      return await prisma.globalSettings.create({
        data
      });
    }
  }

  // Ativar/desativar modo de manutenção
  static async toggleMaintenanceMode(enabled: boolean) {
    const settings = await this.getGlobalSettings();
    return await prisma.globalSettings.update({
      where: { id: settings.id },
      data: { maintenanceMode: enabled }
    });
  }
}

// ========================================
// SERVIÇOS DE ROLES DE USUÁRIO
// ========================================

export class UserRoleService {
  // Criar role de usuário
  static async createUserRole(data: UserRoleData) {
    return await prisma.userRoleAssignment.create({
      data,
      include: {
        user: true,
        company: true
      }
    });
  }

  // Buscar role de usuário
  static async getUserRole(userId: string, companyId?: string) {
    return await prisma.userRoleAssignment.findFirst({
      where: {
        userId,
        companyId: companyId || null,
        isActive: true
      },
      include: {
        user: true,
        company: true
      }
    });
  }

  // Buscar todos os roles de um usuário
  static async getUserRoles(userId: string) {
    return await prisma.userRoleAssignment.findMany({
      where: { 
        userId,
        isActive: true
      },
      include: {
        company: true
      }
    });
  }

  // Atualizar role de usuário
  static async updateUserRole(userId: string, companyId: string | null, data: Partial<UserRoleData>) {
    return await prisma.userRoleAssignment.updateMany({
      where: {
        userId,
        companyId: companyId || null
      },
      data
    });
  }

  // Deletar role de usuário
  static async deleteUserRole(userId: string, companyId: string | null) {
    return await prisma.userRoleAssignment.deleteMany({
      where: {
        userId,
        companyId: companyId || null
      }
    });
  }

  // Verificar se usuário tem role específico
  static async hasRole(userId: string, role: string, companyId?: string) {
    const userRole = await this.getUserRole(userId, companyId);
    return userRole?.role === role && userRole?.isActive;
  }

  // Verificar se usuário é super admin
  static async isSuperAdmin(userId: string) {
    return await this.hasRole(userId, 'SUPER_ADMIN');
  }

  // Verificar se usuário é admin da empresa
  static async isCompanyAdmin(userId: string, companyId: string) {
    return await this.hasRole(userId, 'COMPANY_ADMIN', companyId);
  }
}

// ========================================
// SERVIÇOS DE AUDITORIA
// ========================================

export class AuditService {
  // Criar log de auditoria
  static async createAuditLog(data: {
    userId?: string;
    companyId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await prisma.auditLog.create({
      data,
      include: {
        user: true,
        company: true
      }
    });
  }

  // Buscar logs de auditoria
  static async getAuditLogs(filters?: {
    userId?: string;
    companyId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};
    
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters?.startDate) where.createdAt.gte = filters.startDate;
      if (filters?.endDate) where.createdAt.lte = filters.endDate;
    }

    return await prisma.auditLog.findMany({
      where,
      include: {
        user: true,
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Buscar logs de auditoria por empresa
  static async getCompanyAuditLogs(companyId: string) {
    return await prisma.auditLog.findMany({
      where: { companyId },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Buscar logs de auditoria por usuário
  static async getUserAuditLogs(userId: string) {
    return await prisma.auditLog.findMany({
      where: { userId },
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

// ========================================
// SERVIÇOS DE ESTATÍSTICAS
// ========================================

export class StatisticsService {
  // Estatísticas gerais do sistema
  static async getSystemStatistics() {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      activeUsers,
      totalInfrastructure,
      onlineServers
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.infrastructureSettings.count(),
      prisma.infrastructureSettings.count({ where: { status: 'ONLINE' } })
    ]);

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      activeUsers,
      totalInfrastructure,
      onlineServers,
      systemHealth: onlineServers / totalInfrastructure * 100
    };
  }

  // Estatísticas por empresa
  static async getCompanyStatistics(companyId: string) {
    const [
      totalUsers,
      activeUsers,
      totalContracts,
      activeContracts,
      totalEmployees,
      activeEmployees
    ] = await Promise.all([
      prisma.userRole.count({ where: { companyId } }),
      prisma.userRole.count({ where: { companyId, isActive: true } }),
      prisma.contract.count({ where: { id: { in: [] } } }), // Implementar lógica específica
      prisma.contract.count({ where: { id: { in: [] }, isActive: true } }), // Implementar lógica específica
      prisma.employee.count({ where: { id: { in: [] } } }), // Implementar lógica específica
      prisma.employee.count({ where: { id: { in: [] }, isActive: true } }) // Implementar lógica específica
    ]);

    return {
      totalUsers,
      activeUsers,
      totalContracts,
      activeContracts,
      totalEmployees,
      activeEmployees
    };
  }
} 