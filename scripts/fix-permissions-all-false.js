// Script para corrigir todas as permissões para false
const { PrismaClient } = require('@prisma/client');

async function fixPermissionsAllFalse() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Corrigindo Permissões para False ---');
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

    // 3. Definir permissões corretas (todas false)
    const correctPermissions = {
      "dashboard": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "employees": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "contracts": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "budgets": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "safety": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "planning": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "transfers": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "employeeAssignment": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "workforceControl": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "nfcManagement": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "analytics": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "settings": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      },
      "backup": {
        "canEdit": false,
        "canView": false,
        "canCreate": false,
        "canDelete": false,
        "canExport": false,
        "canImport": false
      }
    };

    console.log('\n🔧 Corrigindo permissões...');
    
    // 4. Atualizar permissões no banco
    if (superAdmin.userRoles.length > 0) {
      const role = superAdmin.userRoles[0];
      
      await prisma.userRoleAssignment.update({
        where: {
          id: role.id
        },
        data: {
          permissions: correctPermissions
        }
      });
      
      console.log('✅ Permissões atualizadas com sucesso!');
    }

    // 5. Verificar se a atualização foi aplicada
    console.log('\n🔍 Verificando permissões após correção...');
    const updatedUser = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: {
          where: { isActive: true }
        }
      }
    });

    if (updatedUser && updatedUser.userRoles.length > 0) {
      const updatedRole = updatedUser.userRoles[0];
      console.log(`   Role: ${updatedRole.role}`);
      console.log(`   Permissões employees:`, JSON.stringify(updatedRole.permissions?.employees, null, 2));
      console.log(`   Permissões contracts:`, JSON.stringify(updatedRole.permissions?.contracts, null, 2));
      console.log(`   Permissões dashboard:`, JSON.stringify(updatedRole.permissions?.dashboard, null, 2));
    }

    console.log('\n✅ CORREÇÃO APLICADA!');
    console.log('   Todas as permissões foram definidas como false.');
    console.log('   Agora limpe o cache do navegador e recarregue a página.');

  } catch (error) {
    console.error('\n❌ Erro ao corrigir permissões:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

fixPermissionsAllFalse(); 