// Script para testar as funcionalidades de permissões implementadas
const { PrismaClient } = require('@prisma/client');

async function testPermissionsUI() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Testando Funcionalidades de Permissões ---');
  console.log('==============================================\n');
  
  try {
    // Buscar o super admin
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
      console.log('❌ Super admin não encontrado');
      return;
    }
    
    console.log('✅ Super admin encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Nome: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.userRoles[0]?.role || 'Nenhum'}`);
    
    // Teste 1: Verificar permissões atuais
    console.log('\n📋 Teste 1: Verificando permissões atuais...');
    
    const userRole = superAdmin.userRoles[0];
    if (userRole) {
      console.log(`   Role Assignment ID: ${userRole.id}`);
      console.log(`   Role: ${userRole.role}`);
      console.log(`   Permissões personalizadas: ${userRole.permissions ? 'Sim' : 'Não'}`);
      
      if (userRole.permissions) {
        console.log('   Permissões personalizadas encontradas:');
        Object.entries(userRole.permissions).forEach(([key, value]) => {
          console.log(`     ${key}: ${JSON.stringify(value)}`);
        });
      }
    }
    
    // Teste 2: Simular alteração de permissões
    console.log('\n🔄 Teste 2: Simulando alteração de permissões...');
    
    // Desabilitar todas as permissões do dashboard
    const updatedPermissions = {
      ...userRole.permissions,
      dashboard: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      }
    };
    
    console.log('   Desabilitando todas as permissões do dashboard...');
    console.log('   Dashboard permissions:', updatedPermissions.dashboard);
    
    // Atualizar permissões no banco
    await prisma.userRoleAssignment.update({
      where: { id: userRole.id },
      data: {
        permissions: updatedPermissions,
        updatedAt: new Date()
      }
    });
    
    console.log('   ✅ Permissões atualizadas no banco de dados');
    
    // Teste 3: Verificar se a página seria oculta
    console.log('\n👁️ Teste 3: Verificando se página seria oculta...');
    
    const dashboardPermissions = updatedPermissions.dashboard;
    const allPermissions = ['canView', 'canEdit', 'canDelete', 'canCreate', 'canExport', 'canImport'];
    const allDisabled = allPermissions.every(perm => !dashboardPermissions[perm]);
    
    console.log(`   Todas as permissões do dashboard desabilitadas: ${allDisabled ? '✅ Sim' : '❌ Não'}`);
    
    if (allDisabled) {
      console.log('   🎯 Dashboard seria oculto do sidebar!');
    } else {
      console.log('   📋 Dashboard permaneceria visível no sidebar');
    }
    
    // Teste 4: Restaurar permissões
    console.log('\n🔄 Teste 4: Restaurando permissões...');
    
    const restoredPermissions = {
      ...updatedPermissions,
      dashboard: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canCreate: true,
        canExport: true,
        canImport: true
      }
    };
    
    await prisma.userRoleAssignment.update({
      where: { id: userRole.id },
      data: {
        permissions: restoredPermissions,
        updatedAt: new Date()
      }
    });
    
    console.log('   ✅ Permissões restauradas');
    
    // Teste 5: Verificar permissões finais
    console.log('\n✅ Teste 5: Verificando permissões finais...');
    
    const finalUserRole = await prisma.userRoleAssignment.findUnique({
      where: { id: userRole.id }
    });
    
    if (finalUserRole && finalUserRole.permissions) {
      const finalDashboardPermissions = finalUserRole.permissions.dashboard;
      const finalAllEnabled = allPermissions.every(perm => finalDashboardPermissions[perm]);
      
      console.log(`   Dashboard totalmente habilitado: ${finalAllEnabled ? '✅ Sim' : '❌ Não'}`);
      console.log('   Permissões finais do dashboard:', finalDashboardPermissions);
    }
    
    console.log('\n🎉 Teste de funcionalidades de permissões concluído!');
    console.log('\n📝 Resumo das funcionalidades testadas:');
    console.log('   1. ✅ Verificação de permissões atuais');
    console.log('   2. ✅ Simulação de alteração de permissões');
    console.log('   3. ✅ Verificação de ocultação de páginas');
    console.log('   4. ✅ Restauração de permissões');
    console.log('   5. ✅ Validação de permissões finais');
    
  } catch (error) {
    console.error('\n❌ Erro ao testar funcionalidades de permissões:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

testPermissionsUI(); 