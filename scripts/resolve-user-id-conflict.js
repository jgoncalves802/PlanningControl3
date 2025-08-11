// Script para resolver conflito de IDs removendo usuário conflitante
const { PrismaClient } = require('@prisma/client');

async function resolveUserIdConflict() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Resolvendo Conflito de IDs ---');
  console.log('==================================\n');
  
  try {
    // 1. Verificar usuário conflitante
    console.log('🔍 Verificando usuário conflitante...');
    
    const conflictingUser = await prisma.user.findUnique({
      where: {
        id: '7b31ab25-aa54-46b9-85ed-323d3757002c'
      },
      include: {
        userRoles: true,
        pagePermissions: true,
        systemPermissions: true,
        settings: true
      }
    });

    if (!conflictingUser) {
      console.log('❌ Usuário conflitante não encontrado');
      return;
    }

    console.log('👤 Usuário conflitante encontrado:');
    console.log(`   ID: ${conflictingUser.id}`);
    console.log(`   Email: ${conflictingUser.email}`);
    console.log(`   Nome: ${conflictingUser.name}`);
    console.log(`   UserRoles: ${conflictingUser.userRoles.length}`);
    console.log(`   PagePermissions: ${conflictingUser.pagePermissions.length}`);
    console.log(`   SystemPermissions: ${conflictingUser.systemPermissions.length}`);
    console.log(`   Settings: ${conflictingUser.settings ? 'Sim' : 'Não'}`);

    // 2. Verificar se é seguro remover
    console.log('\n🔍 Verificando se é seguro remover...');
    
    if (conflictingUser.email === 'user@example.com') {
      console.log('✅ Usuário de exemplo detectado - seguro para remoção');
      
      // 3. Remover dados relacionados primeiro
      console.log('\n🗑️  Removendo dados relacionados...');
      
      // Remover userRoles
      if (conflictingUser.userRoles.length > 0) {
        for (const role of conflictingUser.userRoles) {
          await prisma.userRoleAssignment.delete({
            where: { id: role.id }
          });
        }
        console.log(`   ✅ ${conflictingUser.userRoles.length} userRoles removidos`);
      }
      
      // Remover pagePermissions
      if (conflictingUser.pagePermissions.length > 0) {
        for (const perm of conflictingUser.pagePermissions) {
          await prisma.userPagePermission.delete({
            where: { id: perm.id }
          });
        }
        console.log(`   ✅ ${conflictingUser.pagePermissions.length} pagePermissions removidos`);
      }
      
      // Remover systemPermissions
      if (conflictingUser.systemPermissions.length > 0) {
        for (const perm of conflictingUser.systemPermissions) {
          await prisma.userSystemPermission.delete({
            where: { id: perm.id }
          });
        }
        console.log(`   ✅ ${conflictingUser.systemPermissions.length} systemPermissions removidos`);
      }
      
      // Remover settings
      if (conflictingUser.settings) {
        await prisma.userSettings.delete({
          where: { id: conflictingUser.settings.id }
        });
        console.log('   ✅ Settings removidos');
      }
      
      // 4. Remover usuário conflitante
      console.log('\n🗑️  Removendo usuário conflitante...');
      await prisma.user.delete({
        where: { id: conflictingUser.id }
      });
      console.log('   ✅ Usuário conflitante removido');
      
    } else {
      console.log('❌ Usuário não é de exemplo - NÃO REMOVER!');
      console.log('   Verifique manualmente se é seguro remover este usuário.');
      return;
    }

    // 5. Verificar se o conflito foi resolvido
    console.log('\n🔍 Verificando se o conflito foi resolvido...');
    
    const checkConflict = await prisma.user.findUnique({
      where: {
        id: '7b31ab25-aa54-46b9-85ed-323d3757002c'
      }
    });

    if (!checkConflict) {
      console.log('✅ Conflito resolvido!');
      console.log('   O ID do Supabase Auth está livre para uso.');
    } else {
      console.log('❌ Conflito ainda existe!');
      console.log('   Verifique se a remoção foi aplicada corretamente.');
    }

    console.log('\n✅ CONFLITO RESOLVIDO!');
    console.log('   Agora você pode executar o script de correção de IDs.');

  } catch (error) {
    console.error('\n❌ Erro ao resolver conflito:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

resolveUserIdConflict(); 