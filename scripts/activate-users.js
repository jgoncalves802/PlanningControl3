// Script para ativar usuários existentes
const { PrismaClient } = require('@prisma/client');

async function activateUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Ativando usuários existentes...');
    console.log('================================');
    
    // Ativar Super Admin
    console.log('\n👑 1. Ativando Super Admin...');
    const superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@planningcontrol.com' }
    });
    
    if (superAdmin) {
      await prisma.user.update({
        where: { id: superAdmin.id },
        data: { isActive: true }
      });
      console.log('   ✅ Super Admin ativado');
    } else {
      console.log('   ❌ Super Admin não encontrado no banco');
    }
    
    // Ativar Admin Regular
    console.log('\n👨‍💼 2. Ativando Admin Regular...');
    const regularAdmin = await prisma.user.findFirst({
      where: { email: 'admin@planningcontrol.com' }
    });
    
    if (regularAdmin) {
      await prisma.user.update({
        where: { id: regularAdmin.id },
        data: { isActive: true }
      });
      console.log('   ✅ Admin Regular ativado');
    } else {
      console.log('   ❌ Admin Regular não encontrado no banco');
    }
    
    // Ativar todos os outros usuários
    console.log('\n👥 3. Ativando todos os outros usuários...');
    const otherUsers = await prisma.user.findMany({
      where: {
        email: {
          notIn: ['superadmin@planningcontrol.com', 'admin@planningcontrol.com']
        }
      }
    });
    
    for (const user of otherUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true }
      });
      console.log(`   ✅ ${user.name} (${user.email}) ativado`);
    }
    
    // Listar todos os usuários atualizados
    console.log('\n📊 4. Listando todos os usuários atualizados...');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isActive: true,
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
      console.log(`      Status: ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    });
    
    console.log('\n🎯 5. Status da ativação:');
    console.log('   ✅ Todos os usuários ativados');
    console.log('   ✅ Campo isActive implementado');
    console.log('   ✅ Sistema pronto para uso');
    
    console.log('\n🔐 6. Credenciais para teste:');
    console.log('   - Super Admin: superadmin@planningcontrol.com / 123456');
    console.log('   - Admin Regular: admin@planningcontrol.com / 123456');
    console.log('   - URL: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Erro durante ativação:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

activateUsers(); 