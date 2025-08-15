// Script para corrigir permissões do super administrador
const { PrismaClient } = require('@prisma/client');

async function fixSuperAdminPermissions() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Corrigindo Permissões do Super Admin ---');
  console.log('============================================\n');
  
  try {
    // 1. Verificar usuário super admin
    console.log('🔍 Verificando usuário super admin...');
    
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: true
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('👤 Super admin encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Nome: ${superAdmin.name}`);
    console.log(`   UserRoles: ${superAdmin.userRoles.length}`);

    // 2. Definir permissões corretas para SUPER_ADMIN
    const superAdminPermissions = {
      "dashboard": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "employees": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "contracts": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "settings": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "analytics": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "transfers": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "nfcManagement": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "workforceControl": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "employeeAssignment": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "planning": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "budgets": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "safety": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "backup": { "canEdit": true, "canView": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true }
    };

    // 3. Verificar se já existe role assignment
    let userRole = superAdmin.userRoles.find(role => role.role === 'SUPER_ADMIN');
    
    if (userRole) {
      console.log('🔄 Atualizando role assignment existente...');
      
      await prisma.userRoleAssignment.update({
        where: { id: userRole.id },
        data: {
          role: 'SUPER_ADMIN',
          permissions: superAdminPermissions,
          isActive: true,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Role assignment atualizado');
    } else {
      console.log('🔄 Criando novo role assignment...');
      
      await prisma.userRoleAssignment.create({
        data: {
          userId: superAdmin.id,
          role: 'SUPER_ADMIN',
          permissions: superAdminPermissions,
          isActive: true
        }
      });
      
      console.log('✅ Role assignment criado');
    }

    // 4. Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    
    const updatedSuperAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: {
          where: { isActive: true }
        }
      }
    });

    if (updatedSuperAdmin && updatedSuperAdmin.userRoles.length > 0) {
      const role = updatedSuperAdmin.userRoles[0];
      console.log('✅ Permissões atualizadas:');
      console.log(`   Role: ${role.role}`);
      console.log(`   Settings canView: ${role.permissions.settings?.canView}`);
      console.log(`   Dashboard canView: ${role.permissions.dashboard?.canView}`);
      console.log(`   Employees canView: ${role.permissions.employees?.canView}`);
      console.log(`   Contracts canView: ${role.permissions.contracts?.canView}`);
    }

    console.log('\n🎉 PERMISSÕES DO SUPER ADMIN CORRIGIDAS!');
    console.log('   O super administrador agora tem acesso total ao sistema.');

  } catch (error) {
    console.error('\n❌ Erro ao corrigir permissões:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

fixSuperAdminPermissions(); 