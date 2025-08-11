// Script para verificar e corrigir permissões do super admin
const { PrismaClient } = require('@prisma/client');

async function checkSuperAdminPermissions() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Verificando Permissões do Super Admin ---');
  console.log('=============================================\n');
  
  try {
    // Buscar o super admin
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        pagePermissions: true,
        systemPermissions: true,
        userRoles: true
      }
    });
    
    if (!superAdmin) {
      console.log('❌ Super admin não encontrado');
      return;
    }
    
    console.log('✅ Super admin encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Nome: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Clerk ID: ${superAdmin.clerkId}`);
    console.log(`   Status: ${superAdmin.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    
    // Verificar permissões de página
    console.log('\n📋 Permissões de Página:');
    if (superAdmin.pagePermissions.length === 0) {
      console.log('   ⚠️ Nenhuma permissão de página encontrada');
    } else {
      superAdmin.pagePermissions.forEach(perm => {
        console.log(`   ${perm.page}: ${perm.canView ? '✅' : '❌'} Visualizar`);
      });
    }
    
         // Verificar permissões de sistema
     console.log('\n🔧 Permissões de Sistema:');
     if (superAdmin.systemPermissions.length === 0) {
       console.log('   ⚠️ Nenhuma permissão de sistema encontrada');
     } else {
       superAdmin.systemPermissions.forEach(perm => {
         console.log(`   ${perm.permission}: ${perm.isGranted ? '✅' : '❌'}`);
       });
     }
    
    // Verificar roles
    console.log('\n👤 Roles:');
    if (superAdmin.userRoles.length === 0) {
      console.log('   ⚠️ Nenhum role encontrado');
    } else {
      superAdmin.userRoles.forEach(role => {
        console.log(`   ${role.role}: ${role.isActive ? '✅ Ativo' : '❌ Inativo'}`);
      });
    }
    
    // Verificar se há permissões que estão bloqueando o dashboard
    const dashboardPermission = superAdmin.pagePermissions.find(p => p.page === 'dashboard');
    if (dashboardPermission && !dashboardPermission.canView) {
      console.log('\n🚨 PROBLEMA ENCONTRADO: Dashboard bloqueado!');
      console.log('   Corrigindo permissão do dashboard...');
      
      // Atualizar permissão do dashboard
      await prisma.userPagePermission.upsert({
        where: {
          userId_page: {
            userId: superAdmin.id,
            page: 'dashboard'
          }
        },
        update: {
          canView: true,
          canEdit: true,
          canDelete: true,
          canCreate: true,
          canExport: true,
          canImport: true
        },
        create: {
          userId: superAdmin.id,
          page: 'dashboard',
          canView: true,
          canEdit: true,
          canDelete: true,
          canCreate: true,
          canExport: true,
          canImport: true
        }
      });
      
      console.log('   ✅ Permissão do dashboard corrigida!');
    } else if (!dashboardPermission) {
      console.log('\n⚠️ Nenhuma permissão de dashboard encontrada');
      console.log('   Criando permissão padrão do dashboard...');
      
      await prisma.userPagePermission.create({
        data: {
          userId: superAdmin.id,
          page: 'dashboard',
          canView: true,
          canEdit: true,
          canDelete: true,
          canCreate: true,
          canExport: true,
          canImport: true
        }
      });
      
      console.log('   ✅ Permissão do dashboard criada!');
    } else {
      console.log('\n✅ Permissão do dashboard está correta');
    }
    
    // Garantir que o super admin tenha todas as permissões necessárias
    console.log('\n🔧 Garantindo todas as permissões necessárias...');
    
    const requiredPages = [
      'dashboard', 'employees', 'contracts', 'budgets', 'safety', 
      'planning', 'transfers', 'employeeAssignment', 'workforceControl', 
      'nfcManagement', 'analytics', 'settings', 'backup'
    ];
    
    for (const page of requiredPages) {
      await prisma.userPagePermission.upsert({
        where: {
          userId_page: {
            userId: superAdmin.id,
            page: page
          }
        },
        update: {
          canView: true,
          canEdit: true,
          canDelete: true,
          canCreate: true,
          canExport: true,
          canImport: true
        },
        create: {
          userId: superAdmin.id,
          page: page,
          canView: true,
          canEdit: true,
          canDelete: true,
          canCreate: true,
          canExport: true,
          canImport: true
        }
      });
    }
    
    console.log('   ✅ Todas as permissões de página garantidas!');
    
    // Garantir permissões de sistema
    const requiredSystemPermissions = [
      'canManageUsers', 'canManageCompanies', 'canAccessSuperAdmin',
      'canAccessCompanyAdmin', 'canViewAuditLogs', 'canManageSystemSettings',
      'canAccessReports'
    ];
    
           for (const permission of requiredSystemPermissions) {
         await prisma.userSystemPermission.upsert({
           where: {
             userId_permission: {
               userId: superAdmin.id,
               permission: permission
             }
           },
           update: {
             isGranted: true
           },
           create: {
             userId: superAdmin.id,
             permission: permission,
             isGranted: true
           }
         });
       }
    
    console.log('   ✅ Todas as permissões de sistema garantidas!');
    
         // Garantir role de SUPER_ADMIN
     const existingRole = await prisma.userRoleAssignment.findFirst({
       where: {
         userId: superAdmin.id,
         role: 'SUPER_ADMIN'
       }
     });
     
     if (existingRole) {
       await prisma.userRoleAssignment.update({
         where: { id: existingRole.id },
         data: { isActive: true }
       });
     } else {
       await prisma.userRoleAssignment.create({
         data: {
           userId: superAdmin.id,
           role: 'SUPER_ADMIN',
           isActive: true
         }
       });
     }
    
    console.log('   ✅ Role SUPER_ADMIN garantido!');
    
    console.log('\n🎉 Permissões do super admin verificadas e corrigidas!');
    
  } catch (error) {
    console.error('\n❌ Erro ao verificar permissões:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

checkSuperAdminPermissions(); 