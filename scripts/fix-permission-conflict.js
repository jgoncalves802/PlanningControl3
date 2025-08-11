// Script para corrigir conflito de permissões
const { PrismaClient } = require('@prisma/client');

async function fixPermissionConflict() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Corrigindo Conflito de Permissões ---');
  console.log('========================================\n');
  
  try {
    // 1. Buscar usuário super admin
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: {
          where: { isActive: true }
        },
        pagePermissions: true
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:', superAdmin.name);

    // 2. Verificar permissões do role
    console.log('\n🔐 Permissões do Role:');
    if (superAdmin.userRoles.length > 0) {
      const role = superAdmin.userRoles[0];
      console.log(`   Role: ${role.role}`);
      console.log(`   Permissões employees:`, JSON.stringify(role.permissions?.employees, null, 2));
    }

    // 3. Verificar permissões de página
    console.log('\n📄 Permissões de Página:');
    const employeePagePermission = superAdmin.pagePermissions.find(p => p.page === 'employees');
    if (employeePagePermission) {
      console.log(`   canView: ${employeePagePermission.canView}`);
      console.log(`   canEdit: ${employeePagePermission.canEdit}`);
      console.log(`   canCreate: ${employeePagePermission.canCreate}`);
      console.log(`   canDelete: ${employeePagePermission.canDelete}`);
      console.log(`   canExport: ${employeePagePermission.canExport}`);
      console.log(`   canImport: ${employeePagePermission.canImport}`);
    } else {
      console.log('   ❌ Nenhuma permissão de página encontrada');
    }

    // 4. Identificar o conflito
    const roleEmployeesView = superAdmin.userRoles[0]?.permissions?.employees?.canView || false;
    const pageEmployeesView = employeePagePermission?.canView || false;
    
    console.log('\n⚠️  CONFLITO IDENTIFICADO:');
    console.log(`   Role employees.canView: ${roleEmployeesView}`);
    console.log(`   Page employees.canView: ${pageEmployeesView}`);
    console.log(`   Conflito: ${roleEmployeesView !== pageEmployeesView ? '✅ Sim' : '❌ Não'}`);

    if (roleEmployeesView !== pageEmployeesView) {
      console.log('\n🔧 CORRIGINDO CONFLITO...');
      
      // 5. Remover permissões de página conflitantes
      if (employeePagePermission) {
        console.log('   Removendo permissões de página conflitantes...');
        await prisma.userPagePermission.delete({
          where: {
            id: employeePagePermission.id
          }
        });
        console.log('   ✅ Permissões de página removidas');
      }

      // 6. Verificar se há outras permissões de página que podem estar causando conflito
      const otherPagePermissions = superAdmin.pagePermissions.filter(p => p.page !== 'employees');
      if (otherPagePermissions.length > 0) {
        console.log('\n📋 Outras permissões de página encontradas:');
        otherPagePermissions.forEach(perm => {
          console.log(`   - ${perm.page}: ${perm.canView ? '✅' : '❌'}`);
        });
        
        console.log('\n🗑️  Removendo todas as permissões de página para evitar conflitos...');
        for (const perm of otherPagePermissions) {
          await prisma.userPagePermission.delete({
            where: {
              id: perm.id
            }
          });
        }
        console.log('   ✅ Todas as permissões de página removidas');
      }

      console.log('\n✅ CONFLITO CORRIGIDO!');
      console.log('   Agora o sistema usará apenas as permissões do role.');
      console.log('   Limpe o cache do navegador e recarregue a página.');
    } else {
      console.log('\n✅ NENHUM CONFLITO ENCONTRADO');
      console.log('   As permissões estão consistentes.');
    }

  } catch (error) {
    console.error('\n❌ Erro ao corrigir conflito:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

fixPermissionConflict(); 