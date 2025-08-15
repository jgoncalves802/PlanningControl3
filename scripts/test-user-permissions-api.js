// Script para testar a API de permissões de usuário
const { PrismaClient } = require('@prisma/client');

async function testUserPermissionsAPI() {
  const prisma = new PrismaClient();
  
  console.log('\\n--- Teste da API de Permissões de Usuário ---');
  console.log('==============================================\\n');
  
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

    console.log('✅ Super admin encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Roles ativos: ${superAdmin.userRoles.filter(r => r.isActive).length}`);

    // 2. Verificar role assignments existentes
    console.log('\\n🔍 Verificando role assignments existentes...');
    
    const existingRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    console.log(`📋 Total de role assignments: ${existingRoles.length}`);
    existingRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}, Ativo: ${role.isActive}, ID: ${role.id}`);
    });

    // 3. Simular atualização de permissões
    console.log('\\n🧪 Simulando atualização de permissões...');
    
    const testPermissions = {
      "dashboard": { "canView": true, "canEdit": true, "canCreate": false, "canDelete": false, "canExport": true, "canImport": false },
      "employees": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
      "contracts": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true }
    };

    // Verificar se já existe um role assignment ativo
    const activeRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: superAdmin.id,
        isActive: true
      }
    });

    if (activeRole) {
      console.log(`📝 Atualizando role assignment existente (ID: ${activeRole.id})`);
      
      // Atualizar role assignment existente
      const updatedRole = await prisma.userRoleAssignment.update({
        where: { id: activeRole.id },
        data: {
          permissions: testPermissions,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Role assignment atualizado com sucesso');
      console.log(`   ID: ${updatedRole.id}`);
      console.log(`   Role: ${updatedRole.role}`);
      console.log(`   Permissões: ${Object.keys(updatedRole.permissions).length} páginas`);
    } else {
      console.log('📝 Criando novo role assignment');
      
      // Criar novo role assignment
      const newRole = await prisma.userRoleAssignment.create({
        data: {
          userId: superAdmin.id,
          role: 'SUPER_ADMIN',
          permissions: testPermissions,
          isActive: true
        }
      });
      
      console.log('✅ Novo role assignment criado com sucesso');
      console.log(`   ID: ${newRole.id}`);
      console.log(`   Role: ${newRole.role}`);
      console.log(`   Permissões: ${Object.keys(newRole.permissions).length} páginas`);
    }

    // 4. Verificar resultado final
    console.log('\\n🔍 Verificando resultado final...');
    
    const finalRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    console.log(`📋 Total de role assignments após teste: ${finalRoles.length}`);
    finalRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}, Ativo: ${role.isActive}, ID: ${role.id}`);
      if (role.permissions) {
        console.log(`      Permissões: ${Object.keys(role.permissions).length} páginas`);
      }
    });

    // 5. Verificar constraint única
    console.log('\\n🔒 Verificando constraint única...');
    
    const duplicateCheck = await prisma.userRoleAssignment.groupBy({
      by: ['userId', 'role'],
      where: {
        userId: superAdmin.id,
        isActive: true
      },
      _count: {
        id: true
      }
    });

    console.log('📊 Verificação de duplicatas:');
    duplicateCheck.forEach((group, index) => {
      console.log(`   ${index + 1}. userId: ${group.userId}, role: ${group.role}, count: ${group._count.id}`);
      if (group._count.id > 1) {
        console.log(`      ⚠️  DUPLICATA DETECTADA!`);
      }
    });

    console.log('\\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    
    if (error.code === 'P2002') {
      console.log('\\n🔍 Detalhes do erro de constraint única:');
      console.log(`   Código: ${error.code}`);
      console.log(`   Meta: ${JSON.stringify(error.meta)}`);
      console.log('\\n💡 Solução: Verificar se há registros duplicados na tabela user_roles');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testUserPermissionsAPI(); 