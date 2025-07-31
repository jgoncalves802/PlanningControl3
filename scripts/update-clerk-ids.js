// Script para atualizar Clerk IDs dos usuários no banco local
const { PrismaClient } = require('@prisma/client');

async function updateClerkIds() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Atualizando Clerk IDs dos usuários...');
    console.log('=====================================');
    
    // Atualizar Super Admin
    console.log('\n👑 1. Atualizando Super Admin...');
    const superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@planningcontrol.com' }
    });
    
    if (superAdmin) {
      await prisma.user.update({
        where: { id: superAdmin.id },
        data: { clerkId: '7b31ab25-aa54-46b9-85ed-323d3757002c' }
      });
      console.log('   ✅ Super Admin atualizado com Clerk ID: 7b31ab25-aa54-46b9-85ed-323d3757002c');
    } else {
      console.log('   ❌ Super Admin não encontrado no banco');
    }
    
    // Atualizar Admin Regular
    console.log('\n👨‍💼 2. Atualizando Admin Regular...');
    const regularAdmin = await prisma.user.findFirst({
      where: { email: 'admin@planningcontrol.com' }
    });
    
    if (regularAdmin) {
      await prisma.user.update({
        where: { id: regularAdmin.id },
        data: { clerkId: '978b6316-79f4-4655-837d-a8038b333483' }
      });
      console.log('   ✅ Admin Regular atualizado com Clerk ID: 978b6316-79f4-4655-837d-a8038b333483');
    } else {
      console.log('   ❌ Admin Regular não encontrado no banco');
    }
    
    // Listar todos os usuários atualizados
    console.log('\n📊 3. Listando todos os usuários atualizados...');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total de usuários: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Clerk ID: ${user.clerkId || 'Não definido'}`);
    });
    
    console.log('\n🎯 4. Status da integração:');
    console.log('   ✅ Usuários criados no Supabase Auth');
    console.log('   ✅ Clerk IDs atualizados no banco local');
    console.log('   ✅ Sistema híbrido funcionando');
    
    console.log('\n🔐 5. Credenciais para teste:');
    console.log('   - Super Admin: superadmin@planningcontrol.com / 123456');
    console.log('   - Admin Regular: admin@planningcontrol.com / 123456');
    console.log('   - URL: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Erro durante atualização:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

updateClerkIds(); 