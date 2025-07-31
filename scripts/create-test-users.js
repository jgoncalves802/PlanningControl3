// Script para criar usuários de teste
const { PrismaClient } = require('@prisma/client');

async function createTestUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👥 Criando usuários de teste...');
    console.log('================================');
    
    // 1. Usuário com Clerk ID
    console.log('\n➕ 1. Criando usuário com Clerk ID...');
    const userWithClerk = await prisma.user.create({
      data: {
        name: 'Administrador Teste',
        email: 'admin@teste.com',
        clerkId: 'clerk_admin_test'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Usuário criado: ${userWithClerk.name} (${userWithClerk.email})`);
    console.log(`   ID: ${userWithClerk.id}`);
    console.log(`   Clerk ID: ${userWithClerk.clerkId}`);
    
    // 2. Usuário sem Clerk ID
    console.log('\n➕ 2. Criando usuário sem Clerk ID...');
    const userWithoutClerk = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'usuario@teste.com'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Usuário criado: ${userWithoutClerk.name} (${userWithoutClerk.email})`);
    console.log(`   ID: ${userWithoutClerk.id}`);
    console.log(`   Clerk ID: ${userWithoutClerk.clerkId || 'Não definido'}`);
    
    // 3. Usuário com Clerk ID posterior
    console.log('\n➕ 3. Criando usuário para adicionar Clerk ID depois...');
    const userForClerkLater = await prisma.user.create({
      data: {
        name: 'Gerente Teste',
        email: 'gerente@teste.com'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Usuário criado: ${userForClerkLater.name} (${userForClerkLater.email})`);
    console.log(`   ID: ${userForClerkLater.id}`);
    console.log(`   Clerk ID: ${userForClerkLater.clerkId || 'Não definido'}`);
    
    // 4. Adicionar Clerk ID posteriormente
    console.log('\n✏️ 4. Adicionando Clerk ID posteriormente...');
    const updatedUser = await prisma.user.update({
      where: { id: userForClerkLater.id },
      data: {
        clerkId: 'clerk_gerente_test'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        updatedAt: true
      }
    });
    
    console.log(`✅ Clerk ID adicionado: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`   Clerk ID: ${updatedUser.clerkId}`);
    
    // 5. Estatísticas finais
    console.log('\n📊 5. Estatísticas finais...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true
      }
    });
    
    const usersWithClerk = allUsers.filter(u => u.clerkId).length;
    const usersWithoutClerk = allUsers.filter(u => !u.clerkId).length;
    
    console.log(`📈 Total de usuários: ${allUsers.length}`);
    console.log(`📈 Usuários com Clerk ID: ${usersWithClerk}`);
    console.log(`📈 Usuários sem Clerk ID: ${usersWithoutClerk}`);
    
    console.log('\n👥 Usuários criados:');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Clerk ID: ${user.clerkId || 'Não definido'}`);
    });
    
    console.log('\n🎯 Usuários de teste criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
createTestUsers()
  .then(() => {
    console.log('\n✅ Script concluído!');
  })
  .catch(error => {
    console.error('❌ Falha no script:', error);
    process.exit(1);
  }); 