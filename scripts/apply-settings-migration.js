const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Aplicando migração de configurações...');

  try {
    // Criar configurações globais padrão
    console.log('📋 Criando configurações globais...');
    const globalSettings = await prisma.globalSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        systemName: 'PlanningControl',
        systemVersion: '1.0.0',
        maintenanceMode: false,
        registrationEnabled: true,
        maxCompanies: 1000,
        maxUsersPerCompany: 100,
        defaultPlan: 'BASIC',
        supportEmail: 'support@planningcontrol.com',
        supportPhone: '(11) 99999-9999'
      }
    });
    console.log('✅ Configurações globais criadas');

    // Criar empresas de teste
    console.log('🏢 Criando empresas de teste...');
    
    const companies = [
      {
        name: 'Empresa 1 Ltda',
        cnpj: '12.345.678/0001-90',
        email: 'contato@empresa1.com',
        phone: '(11) 99999-9999',
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        logoUrl: 'https://via.placeholder.com/150x50/007bff/ffffff?text=Empresa+1',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        domain: 'empresa1.planningcontrol.com',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        subscriptionPlan: 'PROFESSIONAL',
        status: 'ACTIVE',
        maxUsers: 25,
        maxContracts: 8,
        maxEmployees: 100
      },
      {
        name: 'Empresa 2 Ltda',
        cnpj: '98.765.432/0001-10',
        email: 'contato@empresa2.com',
        phone: '(21) 88888-8888',
        address: {
          street: 'Av. Principal, 456',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000-000'
        },
        logoUrl: 'https://via.placeholder.com/150x50/28a745/ffffff?text=Empresa+2',
        primaryColor: '#28a745',
        secondaryColor: '#6c757d',
        domain: 'empresa2.planningcontrol.com',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        subscriptionPlan: 'BASIC',
        status: 'ACTIVE',
        maxUsers: 12,
        maxContracts: 3,
        maxEmployees: 50
      },
      {
        name: 'Empresa 3 Ltda',
        cnpj: '55.444.333/0001-22',
        email: 'contato@empresa3.com',
        phone: '(31) 77777-7777',
        address: {
          street: 'Rua do Comércio, 789',
          city: 'Belo Horizonte',
          state: 'MG',
          zipCode: '30000-000'
        },
        logoUrl: 'https://via.placeholder.com/150x50/dc3545/ffffff?text=Empresa+3',
        primaryColor: '#dc3545',
        secondaryColor: '#6c757d',
        domain: 'empresa3.planningcontrol.com',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        subscriptionPlan: 'ENTERPRISE',
        status: 'SUSPENDED',
        maxUsers: 50,
        maxContracts: 15,
        maxEmployees: 200
      }
    ];

    for (const companyData of companies) {
      const company = await prisma.company.upsert({
        where: { cnpj: companyData.cnpj },
        update: {},
        create: companyData
      });

      // Criar configurações padrão para cada empresa
      await prisma.companySettings.upsert({
        where: { companyId: company.id },
        update: {},
        create: {
          companyId: company.id,
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

      console.log(`✅ Empresa ${company.name} criada`);
    }

    // Criar infraestrutura de teste
    console.log('🖥️ Criando infraestrutura de teste...');
    
    const infrastructure = [
      {
        serverName: 'Web Server 01',
        serverType: 'Web',
        status: 'ONLINE',
        cpuUsage: 25.5,
        memoryUsage: 45.2,
        diskUsage: 12.8,
        networkUsage: 8.3,
        lastMaintenance: new Date('2025-07-15'),
        nextMaintenance: new Date('2025-08-15'),
        backupStatus: 'OK',
        securityStatus: 'OK'
      },
      {
        serverName: 'Database Server 01',
        serverType: 'Database',
        status: 'ONLINE',
        cpuUsage: 35.1,
        memoryUsage: 78.9,
        diskUsage: 45.2,
        networkUsage: 12.7,
        lastMaintenance: new Date('2025-07-10'),
        nextMaintenance: new Date('2025-08-10'),
        backupStatus: 'OK',
        securityStatus: 'OK'
      },
      {
        serverName: 'Cache Server 01',
        serverType: 'Cache',
        status: 'MAINTENANCE',
        cpuUsage: 15.3,
        memoryUsage: 32.1,
        diskUsage: 8.9,
        networkUsage: 5.2,
        lastMaintenance: new Date('2025-07-20'),
        nextMaintenance: new Date('2025-07-25'),
        backupStatus: 'WARNING',
        securityStatus: 'OK'
      }
    ];

    for (const infraData of infrastructure) {
      await prisma.infrastructureSettings.create({
        data: infraData
      });
      console.log(`✅ Infraestrutura ${infraData.serverName} criada`);
    }

    // Criar usuários de teste com roles
    console.log('👥 Criando usuários de teste...');
    
    const users = [
      {
        email: 'superadmin@planningcontrol.com',
        name: 'Super Administrador',
        clerkId: 'super_admin_test',
        isActive: true
      },
      {
        email: 'admin@empresa1.com',
        name: 'Admin Empresa 1',
        clerkId: 'admin_empresa1_test',
        isActive: true
      },
      {
        email: 'user@empresa1.com',
        name: 'Usuário Empresa 1',
        clerkId: 'user_empresa1_test',
        isActive: true
      }
    ];

    for (const userData of users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });

      // Criar configurações do usuário
      await prisma.userSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          personalSettings: {
            create: {
              userId: user.id,
              name: user.name,
              email: user.email,
              language: 'pt-BR',
              timezone: 'America/Sao_Paulo',
              theme: 'system'
            }
          },
          interfaceSettings: {
            create: {
              userId: user.id,
              dashboardLayout: 'grid',
              sidebarCollapsed: false,
              showNotifications: true,
              showQuickActions: true,
              autoRefresh: true,
              refreshInterval: 30,
              compactMode: false,
              showAnimations: true,
              colorScheme: 'blue'
            }
          },
          notificationSettings: {
            create: {
              userId: user.id,
              pushEnabled: true,
              pushWorkHours: true,
              pushAfterHours: false,
              emailEnabled: true,
              emailDaily: false,
              emailWeekly: true,
              emailUrgent: true,
              newAssignments: true,
              scheduleChanges: true,
              systemUpdates: false,
              reminders: true,
              alerts: true,
              quietHours: true,
              quietStart: '22:00',
              quietEnd: '07:00'
            }
          }
        }
      });

      console.log(`✅ Usuário ${user.name} criado`);
    }

    // Criar roles de usuário
    console.log('🔐 Criando roles de usuário...');
    
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'superadmin@planningcontrol.com' }
    });

    if (superAdmin) {
      await prisma.userRole.upsert({
        where: {
          userId_companyId: {
            userId: superAdmin.id,
            companyId: null
          }
        },
        update: {},
        create: {
          userId: superAdmin.id,
          role: 'SUPER_ADMIN',
          permissions: {
            canManageCompanies: true,
            canManageInfrastructure: true,
            canManageUsers: true,
            canViewAuditLogs: true
          },
          isActive: true
        }
      });
      console.log('✅ Role Super Admin criado');
    }

    const adminEmpresa1 = await prisma.user.findUnique({
      where: { email: 'admin@empresa1.com' }
    });

    const empresa1 = await prisma.company.findUnique({
      where: { cnpj: '12.345.678/0001-90' }
    });

    if (adminEmpresa1 && empresa1) {
      await prisma.userRole.upsert({
        where: {
          userId_companyId: {
            userId: adminEmpresa1.id,
            companyId: empresa1.id
          }
        },
        update: {},
        create: {
          userId: adminEmpresa1.id,
          companyId: empresa1.id,
          role: 'COMPANY_ADMIN',
          permissions: {
            canManageCompanySettings: true,
            canManageUsers: true,
            canManageContracts: true,
            canViewReports: true
          },
          isActive: true
        }
      });
      console.log('✅ Role Company Admin criado');
    }

    const userEmpresa1 = await prisma.user.findUnique({
      where: { email: 'user@empresa1.com' }
    });

    if (userEmpresa1 && empresa1) {
      await prisma.userRole.upsert({
        where: {
          userId_companyId: {
            userId: userEmpresa1.id,
            companyId: empresa1.id
          }
        },
        update: {},
        create: {
          userId: userEmpresa1.id,
          companyId: empresa1.id,
          role: 'USER',
          permissions: {
            canViewDashboard: true,
            canManagePersonalSettings: true,
            canViewReports: false
          },
          isActive: true
        }
      });
      console.log('✅ Role User criado');
    }

    console.log('🎉 Migração concluída com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log('- 1 configuração global criada');
    console.log('- 3 empresas criadas');
    console.log('- 3 configurações de empresa criadas');
    console.log('- 3 infraestruturas criadas');
    console.log('- 3 usuários criados');
    console.log('- 3 configurações de usuário criadas');
    console.log('- 3 roles de usuário criados');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 