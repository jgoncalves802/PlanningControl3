// Script para remover coluna clerkId e atualizar sistema
const { PrismaClient } = require('@prisma/client');

async function removeClerkIdMigration() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Removendo Coluna clerkId ---');
  console.log('================================\n');
  
  try {
    // 1. Verificar situação atual
    console.log('🔍 Verificando situação atual...');
    
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('👤 Usuário super admin:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Nome: ${superAdmin.name}`);

    // 2. Verificar se o ID é consistente
    if (superAdmin.id === '7b31ab25-aa54-46b9-85ed-323d3757002c') {
      console.log('✅ ID é consistente com Supabase Auth');
    } else {
      console.log('❌ ID não é consistente!');
      console.log('   Execute primeiro o script de correção de IDs.');
      return;
    }

    // 3. Verificar se há outros usuários com clerkId
    console.log('\n🔍 Verificando outros usuários...');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log(`   Total de usuários: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - ID: ${user.id}`);
    });

    // 4. Instruções para migração
    console.log('\n📋 INSTRUÇÕES PARA MIGRAÇÃO:');
    console.log('=============================');
    console.log('1. Execute: npx prisma migrate dev --name remove_clerkid');
    console.log('2. Isso irá:');
    console.log('   - Remover a coluna clerkId da tabela users');
    console.log('   - Atualizar o schema do Prisma');
    console.log('   - Gerar o novo cliente Prisma');
    console.log('3. Atualize as APIs para usar o ID direto');
    console.log('4. Teste o sistema');

    // 5. Verificar APIs que precisam ser atualizadas
    console.log('\n🔧 APIs que precisam ser atualizadas:');
    console.log('=====================================');
    console.log('- lib/auth-client.ts: transformSupabaseUser()');
    console.log('- app/api/settings/super-admin/users/route.ts');
    console.log('- app/api/settings/user-role/[userId]/route.ts');
    console.log('- app/api/settings/user-permissions/[userId]/route.ts');
    console.log('- Qualquer lugar que use clerkId');

    console.log('\n✅ PREPARAÇÃO CONCLUÍDA!');
    console.log('   Execute a migração do Prisma para remover a coluna clerkId.');

  } catch (error) {
    console.error('\n❌ Erro na preparação:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

removeClerkIdMigration(); 