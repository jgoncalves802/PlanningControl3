// Script para debugar permissões do usuário atual
const { PrismaClient } = require('@prisma/client');

async function debugUserPermissions() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Debug de Permissões do Usuário ---');
  console.log('======================================\n');
  
  try {
    // 1. Buscar usuário super admin
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Nome: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   ClerkId: ${superAdmin.clerkId || 'N/A'}`);
    console.log(`   Ativo: ${superAdmin.isActive}`);

    // 2. Verificar roles
    console.log('\n🎭 Roles do usuário:');
    if (superAdmin.userRoles.length === 0) {
      console.log('   ❌ Nenhum role encontrado');
    } else {
      superAdmin.userRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. Role: ${role.role}`);
        console.log(`      CompanyId: ${role.companyId || 'N/A'}`);
        console.log(`      Ativo: ${role.isActive}`);
        console.log(`      Permissões: ${role.permissions ? 'Sim' : 'Não'}`);
        if (role.permissions) {
          console.log(`      Detalhes:`, JSON.stringify(role.permissions, null, 2));
        }
      });
    }

    // 3. Verificar permissões do sistema
    console.log('\n🔐 Permissões do Sistema:');
    const systemPermissions = await prisma.userSystemPermission.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    if (systemPermissions.length === 0) {
      console.log('   ❌ Nenhuma permissão do sistema encontrada');
    } else {
      console.log(`   ✅ ${systemPermissions.length} permissões do sistema encontradas:`);
      systemPermissions.forEach(perm => {
        console.log(`      - ${perm.permission}: ${perm.isGranted ? '✅ Concedida' : '❌ Negada'}`);
      });
    }

    // 4. Verificar permissões de páginas
    console.log('\n📄 Permissões de Páginas:');
    const pagePermissions = await prisma.userPagePermission.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    if (pagePermissions.length === 0) {
      console.log('   ❌ Nenhuma permissão de página encontrada');
    } else {
      console.log(`   ✅ ${pagePermissions.length} permissões de página encontradas:`);
      pagePermissions.forEach(perm => {
        console.log(`      - ${perm.page}: ${perm.isGranted ? '✅ Concedida' : '❌ Negada'}`);
      });
    }

    // 5. Verificar permissões granulares
    console.log('\n🎯 Permissões Granulares:');
    const granularPermissions = await prisma.userGranularPermission.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    if (granularPermissions.length === 0) {
      console.log('   ❌ Nenhuma permissão granular encontrada');
    } else {
      console.log(`   ✅ ${granularPermissions.length} permissões granulares encontradas:`);
      granularPermissions.forEach(perm => {
        console.log(`      - ${perm.page}.${perm.action}: ${perm.isGranted ? '✅ Concedida' : '❌ Negada'}`);
      });
    }

    // 6. Verificar se há permissões específicas para employees
    console.log('\n👥 Permissões Específicas - Employees:');
    const employeePermissions = granularPermissions.filter(p => p.page === 'employees');
    
    if (employeePermissions.length === 0) {
      console.log('   ❌ Nenhuma permissão específica para employees encontrada');
    } else {
      console.log(`   ✅ ${employeePermissions.length} permissões para employees:`);
      employeePermissions.forEach(perm => {
        console.log(`      - ${perm.action}: ${perm.isGranted ? '✅ Concedida' : '❌ Negada'}`);
      });
    }

    // 7. Verificar se todas as permissões de employees estão false
    const allEmployeePermissionsFalse = employeePermissions.every(p => !p.isGranted);
    console.log(`\n🔍 Todas as permissões de employees estão false? ${allEmployeePermissionsFalse ? '✅ Sim' : '❌ Não'}`);

    if (allEmployeePermissionsFalse) {
      console.log('   ⚠️  Isso significa que a página employees deveria estar oculta!');
    }

    // 8. Verificar permissões de página employees
    const employeePagePermission = pagePermissions.find(p => p.page === 'employees');
    if (employeePagePermission) {
      console.log(`\n📄 Permissão de página employees: ${employeePagePermission.isGranted ? '✅ Concedida' : '❌ Negada'}`);
    } else {
      console.log('\n📄 Permissão de página employees: ❌ Não encontrada');
    }

  } catch (error) {
    console.error('\n❌ Erro ao debugar permissões:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

debugUserPermissions(); 