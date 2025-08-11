// Script para forçar refresh do cache do usuário
const { PrismaClient } = require('@prisma/client');

async function forceCacheRefresh() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Forçando Refresh do Cache ---');
  console.log('==================================\n');
  
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

    console.log('👤 Usuário encontrado:', superAdmin.name);

    // 2. Verificar permissões atuais
    console.log('\n🔐 Permissões atuais:');
    if (superAdmin.userRoles.length > 0) {
      const role = superAdmin.userRoles[0];
      console.log(`   Role: ${role.role}`);
      console.log(`   Permissões employees:`, JSON.stringify(role.permissions?.employees, null, 2));
      console.log(`   Permissões contracts:`, JSON.stringify(role.permissions?.contracts, null, 2));
    }

    // 3. Simular a lógica de validação
    function shouldHidePage(user, page) {
      if (!user || !user.permissions) return false;

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

      if (typeof pagePermissions === 'object' && pagePermissions.canView !== undefined) {
        const allPermissions = ['canView', 'canEdit', 'canDelete', 'canCreate', 'canExport', 'canImport'];
        return allPermissions.every(perm => !pagePermissions[perm]);
      }

      return !pagePermissions;
    }

    function validatePageAccess(user, page) {
      if (!user) return false;

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

    // 4. Criar objeto de usuário para teste
    const userWithPermissions = {
      id: superAdmin.id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.userRoles[0]?.role || 'USER',
      permissions: superAdmin.userRoles[0]?.permissions || {}
    };

    // 5. Testar páginas específicas
    const testPages = ['/dashboard/employees', '/dashboard/contracts'];
    
    console.log('\n🧪 Testando páginas específicas:');
    console.log('==================================');

    testPages.forEach(page => {
      const hasPageAccess = validatePageAccess(userWithPermissions, page);
      const shouldHide = shouldHidePage(userWithPermissions, page);
      
      console.log(`\n📄 Página: ${page}`);
      console.log(`   ✅ validatePageAccess: ${hasPageAccess ? 'Sim' : 'Não'}`);
      console.log(`   🚫 shouldHidePage: ${shouldHide ? 'Sim' : 'Não'}`);
      console.log(`   📋 Resultado: ${hasPageAccess && !shouldHide ? 'Visível' : 'Oculta'}`);
    });

    // 6. Instruções detalhadas para limpar cache
    console.log('\n🧹 INSTRUÇÕES PARA LIMPAR CACHE:');
    console.log('==================================');
    console.log('1. Abra o DevTools (F12)');
    console.log('2. Vá para a aba Application/Storage');
    console.log('3. Encontre Local Storage');
    console.log('4. Remova TODAS as seguintes chaves:');
    console.log('   - planning_control_user_cache');
    console.log('   - planning_control_user_timestamp');
    console.log('   - planning_control_permissions_cache');
    console.log('   - planning_control_user_data');
    console.log('   - planning_control_* (qualquer chave que comece com isso)');
    console.log('5. Vá para a aba Network');
    console.log('6. Marque "Disable cache"');
    console.log('7. Recarregue a página (Ctrl+Shift+R ou Ctrl+F5)');
    console.log('8. Se ainda não funcionar, feche o navegador e abra novamente');

    // 7. Verificar se há problemas na lógica
    console.log('\n🔍 Análise da lógica:');
    console.log('=====================');
    
    const employeesAccess = validatePageAccess(userWithPermissions, '/dashboard/employees');
    const employeesShouldHide = shouldHidePage(userWithPermissions, '/dashboard/employees');
    const contractsAccess = validatePageAccess(userWithPermissions, '/dashboard/contracts');
    const contractsShouldHide = shouldHidePage(userWithPermissions, '/dashboard/contracts');
    
    console.log(`   Employees - Acesso: ${employeesAccess ? '✅ Permitido' : '❌ Negado'}`);
    console.log(`   Employees - Deve ocultar: ${employeesShouldHide ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Contracts - Acesso: ${contractsAccess ? '✅ Permitido' : '❌ Negado'}`);
    console.log(`   Contracts - Deve ocultar: ${contractsShouldHide ? '✅ Sim' : '❌ Não'}`);
    
    if (!employeesAccess && employeesShouldHide && !contractsAccess && contractsShouldHide) {
      console.log('\n✅ LÓGICA CORRETA:');
      console.log('   As permissões estão configuradas corretamente.');
      console.log('   O problema é definitivamente o cache do navegador.');
      console.log('   Siga as instruções acima para limpar o cache.');
    } else {
      console.log('\n⚠️  PROBLEMA NA LÓGICA:');
      console.log('   Há algo errado com a validação de permissões.');
    }

  } catch (error) {
    console.error('\n❌ Erro ao forçar refresh:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

forceCacheRefresh(); 