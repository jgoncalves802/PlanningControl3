// Script para testar a lógica de permissões
const { PrismaClient } = require('@prisma/client');

async function testPermissionLogic() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Teste da Lógica de Permissões ---');
  console.log('=====================================\n');
  
  try {
    // 1. Buscar usuário super admin
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: {
          where: { isActive: true }
        }
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('👤 Usuário:', superAdmin.name);

    // 2. Simular a função shouldHidePage
    function shouldHidePage(user, page) {
      if (!user || !user.permissions) return false;

      // Mapear href para chave de permissão
      const pageKeyMap = {
        '/dashboard': 'dashboard',
        '/dashboard/employees': 'employees',
        '/dashboard/contracts': 'contracts',
        '/dashboard/budgets': 'budgets',
        '/dashboard/safety': 'safety',
        '/dashboard/planning': 'planning',
        '/dashboard/transfers': 'transfers',
        '/dashboard/employee-assignment': 'employeeAssignment',
        '/dashboard/workforce-control': 'workforceControl',
        '/dashboard/nfc-management': 'nfcManagement',
        '/dashboard/analytics': 'analytics',
        '/dashboard/settings': 'settings',
        '/dashboard/backup': 'backup'
      };

      const pageKey = pageKeyMap[page];
      if (!pageKey) return false;

      const pagePermissions = user.permissions[pageKey];
      if (!pagePermissions) return false;

      // Se é um objeto de permissões (página)
      if (typeof pagePermissions === 'object' && pagePermissions.canView !== undefined) {
        const allPermissions = ['canView', 'canEdit', 'canDelete', 'canCreate', 'canExport', 'canImport'];
        
        // Verificar se todas as permissões estão false
        return allPermissions.every(perm => !pagePermissions[perm]);
      }

      // Se é uma permissão booleana simples
      return !pagePermissions;
    }

    // 3. Simular a função validatePageAccess (CORRIGIDA)
    function validatePageAccess(user, page) {
      if (!user) return false;

      // Se o usuário tem permissões granulares, usar elas
      if (user.permissions) {
        const pagePermissions = {
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
        };

        return pagePermissions[page] || false;
      }

      return false;
    }

    // 4. Criar objeto de usuário com permissões
    const userWithPermissions = {
      id: superAdmin.id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.userRoles[0]?.role || 'USER',
      permissions: superAdmin.userRoles[0]?.permissions || {}
    };

    console.log('🎭 Role do usuário:', userWithPermissions.role);
    console.log('🔐 Permissões:', JSON.stringify(userWithPermissions.permissions, null, 2));

    // 5. Testar lógica para diferentes páginas
    const testPages = [
      '/dashboard',
      '/dashboard/employees',
      '/dashboard/contracts',
      '/dashboard/settings'
    ];

    console.log('\n🧪 Testando lógica de permissões:');
    console.log('==================================');

    testPages.forEach(page => {
      const hasPageAccess = validatePageAccess(userWithPermissions, page);
      const shouldHide = shouldHidePage(userWithPermissions, page);
      
      console.log(`\n📄 Página: ${page}`);
      console.log(`   ✅ validatePageAccess: ${hasPageAccess ? 'Sim' : 'Não'}`);
      console.log(`   🚫 shouldHidePage: ${shouldHide ? 'Sim' : 'Não'}`);
      console.log(`   📋 Resultado: ${hasPageAccess && !shouldHide ? 'Visível' : 'Oculta'}`);
      
      if (page === '/dashboard/employees') {
        const pagePerms = userWithPermissions.permissions.employees;
        if (pagePerms) {
          console.log(`   🔍 Permissões employees:`);
          console.log(`      - canView: ${pagePerms.canView}`);
          console.log(`      - canEdit: ${pagePerms.canEdit}`);
          console.log(`      - canCreate: ${pagePerms.canCreate}`);
          console.log(`      - canDelete: ${pagePerms.canDelete}`);
          console.log(`      - canExport: ${pagePerms.canExport}`);
          console.log(`      - canImport: ${pagePerms.canImport}`);
        }
      }
    });

    // 6. Verificar se há problema na lógica
    const employeesPage = '/dashboard/employees';
    const employeesAccess = validatePageAccess(userWithPermissions, employeesPage);
    const employeesShouldHide = shouldHidePage(userWithPermissions, employeesPage);
    
    console.log('\n🔍 Análise da página Employees:');
    console.log('==============================');
    console.log(`   Acesso: ${employeesAccess ? '✅ Permitido' : '❌ Negado'}`);
    console.log(`   Deve ocultar: ${employeesShouldHide ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Resultado final: ${employeesAccess && !employeesShouldHide ? '✅ Visível' : '❌ Oculta'}`);
    
    if (employeesAccess && employeesShouldHide) {
      console.log('\n⚠️  PROBLEMA DETECTADO:');
      console.log('   A página tem acesso mas deveria estar oculta!');
      console.log('   Isso indica um problema na lógica de validação.');
    }

  } catch (error) {
    console.error('\n❌ Erro ao testar lógica:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

testPermissionLogic(); 