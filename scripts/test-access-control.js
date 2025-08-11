// Script para testar o controle de acesso e permissões
const { PrismaClient } = require('@prisma/client');

async function testAccessControl() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Testando Controle de Acesso ---');
  console.log('===================================\n');
  
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
    console.log(`   Role: ${superAdmin.userRoles[0]?.role || 'Nenhum'}`);
    
    // Testar permissões de página
    console.log('\n📋 Testando Permissões de Página:');
    
    const testPages = [
      '/dashboard',
      '/dashboard/employees',
      '/dashboard/contracts',
      '/dashboard/budgets',
      '/dashboard/safety',
      '/dashboard/planning',
      '/dashboard/transfers',
      '/dashboard/employee-assignment',
      '/dashboard/workforce-control',
      '/dashboard/nfc-management',
      '/dashboard/analytics',
      '/dashboard/settings',
      '/dashboard/backup'
    ];
    
    for (const page of testPages) {
      const permission = superAdmin.pagePermissions.find(p => p.page === page.replace('/dashboard/', ''));
      
      if (permission) {
        console.log(`   ${page}: ${permission.canView ? '✅' : '❌'} Visualizar`);
      } else {
        console.log(`   ${page}: ⚠️ Permissão não encontrada`);
      }
    }
    
    // Testar permissões de sistema
    console.log('\n🔧 Testando Permissões de Sistema:');
    
    const testSystemPermissions = [
      'canManageUsers',
      'canManageCompanies',
      'canAccessSuperAdmin',
      'canAccessCompanyAdmin',
      'canViewAuditLogs',
      'canManageSystemSettings',
      'canAccessReports'
    ];
    
    for (const permission of testSystemPermissions) {
      const systemPermission = superAdmin.systemPermissions.find(p => p.permission === permission);
      
      if (systemPermission) {
        console.log(`   ${permission}: ${systemPermission.isGranted ? '✅' : '❌'}`);
      } else {
        console.log(`   ${permission}: ⚠️ Permissão não encontrada`);
      }
    }
    
    // Verificar se o dashboard está acessível
    const dashboardPermission = superAdmin.pagePermissions.find(p => p.page === 'dashboard');
    
    if (dashboardPermission && dashboardPermission.canView) {
      console.log('\n✅ Dashboard está acessível para o super admin');
    } else {
      console.log('\n❌ Dashboard NÃO está acessível para o super admin');
      console.log('   Isso pode causar problemas de acesso!');
    }
    
    // Verificar se há permissões que estão bloqueando o acesso
    const blockedPages = superAdmin.pagePermissions.filter(p => !p.canView);
    
    if (blockedPages.length > 0) {
      console.log('\n⚠️ Páginas bloqueadas:');
      blockedPages.forEach(page => {
        console.log(`   - ${page.page}`);
      });
    } else {
      console.log('\n✅ Todas as páginas estão acessíveis');
    }
    
    // Verificar permissões de sistema bloqueadas
    const blockedSystemPermissions = superAdmin.systemPermissions.filter(p => !p.isGranted);
    
    if (blockedSystemPermissions.length > 0) {
      console.log('\n⚠️ Permissões de sistema bloqueadas:');
      blockedSystemPermissions.forEach(perm => {
        console.log(`   - ${perm.permission}`);
      });
    } else {
      console.log('\n✅ Todas as permissões de sistema estão ativas');
    }
    
    console.log('\n🎉 Teste de controle de acesso concluído!');
    
  } catch (error) {
    console.error('\n❌ Erro ao testar controle de acesso:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

testAccessControl(); 