const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...');
    console.log('');

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      }
    });

    console.log(`📊 Total de usuários encontrados: ${users.length}`);
    console.log('');

    if (users.length > 0) {
      console.log('👥 Usuários no banco:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`);
        console.log(`      Nome: ${user.name || 'N/A'}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Clerk ID: ${user.clerkId || 'N/A'}`);
        console.log(`      Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      console.log('');
      console.log('💡 Para resolver o problema de transferências:');
      console.log('   1. Crie pelo menos um usuário no sistema');
      console.log('   2. Ou modifique o código para usar um ID válido');
    }

    // Verificar se existe usuário com ID '1'
    const userWithId1 = await prisma.user.findUnique({
      where: { id: '1' }
    });

    if (userWithId1) {
      console.log('✅ Usuário com ID "1" encontrado');
      console.log(`   Nome: ${userWithId1.name}`);
      console.log(`   Email: ${userWithId1.email}`);
    } else {
      console.log('❌ Usuário com ID "1" NÃO encontrado');
      console.log('');
      console.log('🔧 Soluções possíveis:');
      console.log('   1. Criar um usuário com ID "1"');
      console.log('   2. Modificar o código para usar um ID existente');
      console.log('   3. Implementar autenticação real');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 