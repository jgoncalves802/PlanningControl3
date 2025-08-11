// Script para corrigir inconsistência de IDs entre users e Supabase Auth (Versão 2)
const { PrismaClient } = require('@prisma/client');

async function fixUserIdConsistencyV2() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Corrigindo Inconsistência de IDs (Versão 2) ---');
  console.log('==================================================\n');
  
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

    // 3. Verificar se já existe um usuário com o ID do Supabase Auth
    console.log('\n🔍 Verificando se já existe usuário com ID do Supabase Auth...');
    
    const existingUserWithClerkId = await prisma.user.findUnique({
      where: {
        id: superAdmin.clerkId
      }
    });

    if (existingUserWithClerkId) {
      console.log('⚠️  Já existe um usuário com o ID do Supabase Auth:');
      console.log(`   ID: ${existingUserWithClerkId.id}`);
      console.log(`   Email: ${existingUserWithClerkId.email}`);
      console.log(`   Nome: ${existingUserWithClerkId.name}`);
      
      // Verificar se é o mesmo usuário (mesmo email)
      if (existingUserWithClerkId.email === superAdmin.email) {
        console.log('\n✅ É o mesmo usuário! Vamos migrar os dados...');
        
        // Migrar dados do usuário atual para o usuário com ID correto
        console.log('\n🔄 Migrando dados...');
        
        // Migrar userRoles
        const userRolesToMigrate = await prisma.userRoleAssignment.findMany({
          where: { userId: superAdmin.id }
        });
        
        for (const role of userRolesToMigrate) {
          await prisma.userRoleAssignment.update({
            where: { id: role.id },
            data: { userId: existingUserWithClerkId.id }
          });
        }
        console.log(`   ✅ ${userRolesToMigrate.length} userRoles migrados`);
        
        // Migrar pagePermissions
        const pagePermissionsToMigrate = await prisma.userPagePermission.findMany({
          where: { userId: superAdmin.id }
        });
        
        for (const perm of pagePermissionsToMigrate) {
          await prisma.userPagePermission.update({
            where: { id: perm.id },
            data: { userId: existingUserWithClerkId.id }
          });
        }
        console.log(`   ✅ ${pagePermissionsToMigrate.length} pagePermissions migrados`);
        
        // Migrar systemPermissions
        const systemPermissionsToMigrate = await prisma.userSystemPermission.findMany({
          where: { userId: superAdmin.id }
        });
        
        for (const perm of systemPermissionsToMigrate) {
          await prisma.userSystemPermission.update({
            where: { id: perm.id },
            data: { userId: existingUserWithClerkId.id }
          });
        }
        console.log(`   ✅ ${systemPermissionsToMigrate.length} systemPermissions migrados`);
        
        // Migrar settings
        const settingsToMigrate = await prisma.userSettings.findFirst({
          where: { userId: superAdmin.id }
        });
        
        if (settingsToMigrate) {
          await prisma.userSettings.update({
            where: { id: settingsToMigrate.id },
            data: { userId: existingUserWithClerkId.id }
          });
          console.log('   ✅ Settings migrados');
        }
        
        // Remover usuário antigo
        console.log('\n🗑️  Removendo usuário antigo...');
        await prisma.user.delete({
          where: { id: superAdmin.id }
        });
        console.log('   ✅ Usuário antigo removido');
        
      } else {
        console.log('\n❌ CONFLITO: Existe outro usuário com o ID do Supabase Auth!');
        console.log('   Não é possível fazer a migração automaticamente.');
        console.log('   Resolva o conflito manualmente primeiro.');
        return;
      }
    } else {
      console.log('✅ Não existe usuário com o ID do Supabase Auth.');
      console.log('   Vamos atualizar o ID do usuário atual...');
      
      // Atualizar o ID do usuário diretamente
      await prisma.user.update({
        where: { id: superAdmin.id },
        data: { id: superAdmin.clerkId }
      });
      
      console.log('   ✅ ID do usuário atualizado');
    }

    // 4. Verificar resultado
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

fixUserIdConsistencyV2(); 