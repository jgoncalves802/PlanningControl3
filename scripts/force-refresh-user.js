// Script para forçar refresh do usuário e limpar cache
const { PrismaClient } = require('@prisma/client');

async function forceRefreshUser() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Forçando Refresh do Usuário ---');
  console.log('===================================\n');
  
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
      console.log(`   Permissões:`, JSON.stringify(role.permissions, null, 2));
    }

    // 3. Verificar se há permissões de página para employees
    const employeePagePermissions = await prisma.userPagePermission.findFirst({
      where: {
        userId: superAdmin.id,
        page: 'employees'
      }
    });

    console.log('\n🎯 Permissões de página para employees:');
    if (!employeePagePermissions) {
      console.log('   ❌ Nenhuma permissão de página encontrada');
    } else {
      console.log(`   - canView: ${employeePagePermissions.canView ? '✅ Concedida' : '❌ Negada'}`);
      console.log(`   - canEdit: ${employeePagePermissions.canEdit ? '✅ Concedida' : '❌ Negada'}`);
      console.log(`   - canCreate: ${employeePagePermissions.canCreate ? '✅ Concedida' : '❌ Negada'}`);
      console.log(`   - canDelete: ${employeePagePermissions.canDelete ? '✅ Concedida' : '❌ Negada'}`);
      console.log(`   - canExport: ${employeePagePermissions.canExport ? '✅ Concedida' : '❌ Negada'}`);
      console.log(`   - canImport: ${employeePagePermissions.canImport ? '✅ Concedida' : '❌ Negada'}`);
    }

    // 4. Verificar permissão de página employees (já feito acima)
    console.log('\n📄 Resumo da permissão de página employees:');
    if (employeePagePermissions) {
      const hasAnyPermission = employeePagePermissions.canView || employeePagePermissions.canEdit || 
                              employeePagePermissions.canCreate || employeePagePermissions.canDelete || 
                              employeePagePermissions.canExport || employeePagePermissions.canImport;
      console.log(`   Tem alguma permissão: ${hasAnyPermission ? '✅ Sim' : '❌ Não'}`);
    } else {
      console.log('   ❌ Permissão de página não encontrada');
    }

    // 5. Verificar se há permissões personalizadas (não existe essa tabela)
    console.log('\n🎨 Permissões personalizadas:');
    console.log('   ℹ️  As permissões personalizadas estão no campo permissions do UserRoleAssignment');

    // 6. Instruções para limpar cache
    console.log('\n🧹 Para limpar o cache do navegador:');
    console.log('=====================================');
    console.log('1. Abra o DevTools (F12)');
    console.log('2. Vá para a aba Application/Storage');
    console.log('3. Encontre Local Storage');
    console.log('4. Remova as seguintes chaves:');
    console.log('   - planning_control_user_cache');
    console.log('   - planning_control_user_timestamp');
    console.log('   - planning_control_permissions_cache');
    console.log('   - planning_control_user_data');
    console.log('5. Recarregue a página (Ctrl+F5)');

    // 7. Verificar se o problema é no cache
    console.log('\n🔍 Análise do problema:');
    console.log('=======================');
    
    const allEmployeePermissionsFalse = employeePagePermissions ? 
      !employeePagePermissions.canView && !employeePagePermissions.canEdit && 
      !employeePagePermissions.canCreate && !employeePagePermissions.canDelete && 
      !employeePagePermissions.canExport && !employeePagePermissions.canImport : true;
    
    const rolePermissionsFalse = superAdmin.userRoles[0]?.permissions?.employees?.canView === false;
    
    console.log(`   Todas as permissões de página employees false: ${allEmployeePermissionsFalse ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Permissão do role employees false: ${rolePermissionsFalse ? '✅ Sim' : '❌ Não'}`);
    
    if (allEmployeePermissionsFalse && rolePermissionsFalse) {
      console.log('\n✅ CONFIGURAÇÃO CORRETA:');
      console.log('   As permissões estão configuradas corretamente para negar acesso.');
      console.log('   O problema pode estar no cache do navegador.');
      console.log('   Siga as instruções acima para limpar o cache.');
    } else {
      console.log('\n⚠️  CONFIGURAÇÃO INCORRETA:');
      console.log('   As permissões não estão configuradas corretamente.');
      console.log('   Verifique as configurações de permissões.');
    }

  } catch (error) {
    console.error('\n❌ Erro ao forçar refresh:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

forceRefreshUser(); 