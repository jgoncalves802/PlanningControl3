// Script para verificar e criar usuário se necessário
const { PrismaClient } = require('@prisma/client');

async function checkAndCreateUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando usuários no banco de dados...');
    
    // Verificar se existe algum usuário
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Total de usuários encontrados: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Criando usuário padrão...');
      
      // Criar usuário padrão
      const newUser = await prisma.user.create({
        data: {
          clerkId: 'demo-admin',
          email: 'admin@demo-company.com',
          name: 'Administrador Demo',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Usuário criado com sucesso:', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      });
      
      return newUser;
    } else {
      console.log('✅ Usuários encontrados:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Nome: ${user.name}, Email: ${user.email}`);
      });
      
      // Retornar o primeiro usuário
      return users[0];
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuário:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
checkAndCreateUser()
  .then(user => {
    console.log('\n🎯 Usuário para usar nas transferências:', {
      id: user.id,
      name: user.name,
      email: user.email
    });
    console.log('\n💡 Use este ID nas requisições de transferência:');
    console.log(`requestedById: "${user.id}"`);
  })
  .catch(error => {
    console.error('❌ Falha:', error);
    process.exit(1);
  }); 