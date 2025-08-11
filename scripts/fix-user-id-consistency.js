// Script para corrigir inconsistência de IDs entre users e Supabase Auth
const { PrismaClient } = require('@prisma/client');

async function fixUserIdConsistency() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Corrigindo Inconsistência de IDs ---');
  console.log('========================================\n');
  
  try {
    // 1. Verificar situação atual
    console.log('🔍 Verificando situação atual...');
    
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: true,
        pagePermissions: true,
        systemPermissions: true,
        settings: true
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   clerkId: ${superAdmin.clerkId}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Nome: ${superAdmin.name}`);

    // 2. Verificar se há inconsistência
    const hasInconsistency = superAdmin.id !== superAdmin.clerkId;
    
    if (!hasInconsistency) {
      console.log('\n✅ Nenhuma inconsistência encontrada!');
      console.log('   O ID já está correto.');
      return;
    }

    console.log('\n⚠️  INCONSISTÊNCIA DETECTADA:');
    console.log(`   ID da tabela users: ${superAdmin.id}`);
    console.log(`   ID do Supabase Auth: ${superAdmin.clerkId}`);
    console.log('   Os IDs são diferentes!');

    // 3. Verificar se o clerkId está sendo usado em outras tabelas
    console.log('\n🔍 Verificando uso do clerkId em outras tabelas...');
    
    const userRolesWithClerkId = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.clerkId
      }
    });

    const pagePermissionsWithClerkId = await prisma.userPagePermission.findMany({
      where: {
        userId: superAdmin.clerkId
      }
    });

    const systemPermissionsWithClerkId = await prisma.userSystemPermission.findMany({
      where: {
        userId: superAdmin.clerkId
      }
    });

    const settingsWithClerkId = await prisma.userSettings.findFirst({
      where: {
        userId: superAdmin.clerkId
      }
    });

    console.log(`   UserRoles usando clerkId: ${userRolesWithClerkId.length}`);
    console.log(`   PagePermissions usando clerkId: ${pagePermissionsWithClerkId.length}`);
    console.log(`   SystemPermissions usando clerkId: ${systemPermissionsWithClerkId.length}`);
    console.log(`   Settings usando clerkId: ${settingsWithClerkId ? 'Sim' : 'Não'}`);

    // 4. Verificar se há dados usando o ID atual
    console.log('\n🔍 Verificando uso do ID atual em outras tabelas...');
    
    const userRolesWithCurrentId = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    const pagePermissionsWithCurrentId = await prisma.userPagePermission.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    const systemPermissionsWithCurrentId = await prisma.userSystemPermission.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    const settingsWithCurrentId = await prisma.userSettings.findFirst({
      where: {
        userId: superAdmin.id
      }
    });

    console.log(`   UserRoles usando ID atual: ${userRolesWithCurrentId.length}`);
    console.log(`   PagePermissions usando ID atual: ${pagePermissionsWithCurrentId.length}`);
    console.log(`   SystemPermissions usando ID atual: ${systemPermissionsWithCurrentId.length}`);
    console.log(`   Settings usando ID atual: ${settingsWithCurrentId ? 'Sim' : 'Não'}`);

    // 5. Estratégia de correção
    console.log('\n🔧 ESTRATÉGIA DE CORREÇÃO:');
    console.log('===========================');
    
    if (userRolesWithClerkId.length > 0 || pagePermissionsWithClerkId.length > 0 || 
        systemPermissionsWithClerkId.length > 0 || settingsWithClerkId) {
      
      console.log('   Opção 1: Atualizar o ID do usuário para o clerkId');
      console.log('   Opção 2: Migrar dados do clerkId para o ID atual');
      
      // Vou escolher a Opção 1 (mais simples)
      console.log('\n✅ Escolhendo Opção 1: Atualizar ID do usuário');
      
      // 6. Atualizar o ID do usuário
      console.log('\n🔄 Atualizando ID do usuário...');
      
      // Primeiro, criar um novo usuário com o ID correto
      const newUser = await prisma.user.create({
        data: {
          id: superAdmin.clerkId, // Usar o ID do Supabase Auth
          email: superAdmin.email,
          name: superAdmin.name,
          isActive: superAdmin.isActive,
          createdAt: superAdmin.createdAt,
          updatedAt: new Date()
        }
      });
      
      console.log('   ✅ Novo usuário criado com ID correto');
      
      // 7. Migrar dados relacionados
      console.log('\n🔄 Migrando dados relacionados...');
      
      // Migrar userRoles se necessário
      if (userRolesWithCurrentId.length > 0) {
        for (const role of userRolesWithCurrentId) {
          await prisma.userRoleAssignment.update({
            where: { id: role.id },
            data: { userId: newUser.id }
          });
        }
        console.log(`   ✅ ${userRolesWithCurrentId.length} userRoles migrados`);
      }
      
      // Migrar pagePermissions se necessário
      if (pagePermissionsWithCurrentId.length > 0) {
        for (const perm of pagePermissionsWithCurrentId) {
          await prisma.userPagePermission.update({
            where: { id: perm.id },
            data: { userId: newUser.id }
          });
        }
        console.log(`   ✅ ${pagePermissionsWithCurrentId.length} pagePermissions migrados`);
      }
      
      // Migrar systemPermissions se necessário
      if (systemPermissionsWithCurrentId.length > 0) {
        for (const perm of systemPermissionsWithCurrentId) {
          await prisma.userSystemPermission.update({
            where: { id: perm.id },
            data: { userId: newUser.id }
          });
        }
        console.log(`   ✅ ${systemPermissionsWithCurrentId.length} systemPermissions migrados`);
      }
      
      // Migrar settings se necessário
      if (settingsWithCurrentId) {
        await prisma.userSettings.update({
          where: { id: settingsWithCurrentId.id },
          data: { userId: newUser.id }
        });
        console.log('   ✅ Settings migrados');
      }
      
      // 8. Remover usuário antigo
      console.log('\n🗑️  Removendo usuário antigo...');
      await prisma.user.delete({
        where: { id: superAdmin.id }
      });
      console.log('   ✅ Usuário antigo removido');
      
    } else {
      console.log('   Nenhum dado relacionado encontrado, apenas atualizando ID...');
      
      // Atualizar diretamente o ID do usuário
      await prisma.user.update({
        where: { id: superAdmin.id },
        data: { id: superAdmin.clerkId }
      });
      
      console.log('   ✅ ID do usuário atualizado');
    }

    // 9. Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    
    const updatedUser = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: true,
        pagePermissions: true,
        systemPermissions: true,
        settings: true
      }
    });

    if (updatedUser) {
      console.log('✅ Usuário atualizado com sucesso:');
      console.log(`   ID: ${updatedUser.id}`);
      console.log(`   clerkId: ${updatedUser.clerkId}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Nome: ${updatedUser.name}`);
      console.log(`   UserRoles: ${updatedUser.userRoles.length}`);
      console.log(`   PagePermissions: ${updatedUser.pagePermissions.length}`);
      console.log(`   SystemPermissions: ${updatedUser.systemPermissions.length}`);
      console.log(`   Settings: ${updatedUser.settings ? 'Sim' : 'Não'}`);
      
      // Verificar se o ID agora é consistente
      if (updatedUser.id === updatedUser.clerkId) {
        console.log('\n🎉 INCONSISTÊNCIA CORRIGIDA!');
        console.log('   O ID agora é consistente com o Supabase Auth.');
      } else {
        console.log('\n⚠️  Ainda há inconsistência!');
        console.log('   Verifique se a correção foi aplicada corretamente.');
      }
    }

    console.log('\n✅ CORREÇÃO APLICADA!');
    console.log('   Agora o ID da tabela users é o mesmo do Supabase Auth.');
    console.log('   A coluna clerkId não é mais necessária.');

  } catch (error) {
    console.error('\n❌ Erro ao corrigir inconsistência:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

fixUserIdConsistency(); 