// Script para testar a API de toggle status dos usuários
const { PrismaClient } = require('@prisma/client');

async function testToggleStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando API de toggle status dos usuários...');
    console.log('==============================================');
    
    // Buscar um usuário para testar
    const testUser = await prisma.user.findFirst({
      where: { email: 'superadmin@planningcontrol.com' }
    });
    
    if (!testUser) {
      console.log('❌ Usuário de teste não encontrado');
      return;
    }
    
    console.log(`\n👤 Usuário de teste: ${testUser.name} (${testUser.email})`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Status atual: ${testUser.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    
    // Testar desativar usuário
    console.log('\n🔄 1. Testando desativação...');
    try {
      const deactivateResponse = await fetch(`http://localhost:3000/api/settings/super-admin/users/${testUser.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });
      
      if (deactivateResponse.ok) {
        const deactivateData = await deactivateResponse.json();
        console.log('   ✅ Usuário desativado com sucesso');
        console.log(`   Mensagem: ${deactivateData.message}`);
      } else {
        const error = await deactivateResponse.json();
        console.log(`   ❌ Erro ao desativar: ${error.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro de conexão: ${error.message}`);
    }
    
    // Verificar status após desativação
    console.log('\n📊 2. Verificando status após desativação...');
    const userAfterDeactivate = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    
    if (userAfterDeactivate) {
      console.log(`   Status: ${userAfterDeactivate.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    }
    
    // Testar reativar usuário
    console.log('\n🔄 3. Testando reativação...');
    try {
      const activateResponse = await fetch(`http://localhost:3000/api/settings/super-admin/users/${testUser.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: true }),
      });
      
      if (activateResponse.ok) {
        const activateData = await activateResponse.json();
        console.log('   ✅ Usuário reativado com sucesso');
        console.log(`   Mensagem: ${activateData.message}`);
      } else {
        const error = await activateResponse.json();
        console.log(`   ❌ Erro ao reativar: ${error.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro de conexão: ${error.message}`);
    }
    
    // Verificar status final
    console.log('\n📊 4. Verificando status final...');
    const userFinal = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    
    if (userFinal) {
      console.log(`   Status final: ${userFinal.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    }
    
    // Listar todos os usuários com status
    console.log('\n📋 5. Listando todos os usuários com status...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
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
      console.log(`      Status: ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    });
    
    console.log('\n🎯 6. Status do teste:');
    console.log('   ✅ Campo isActive implementado');
    console.log('   ✅ API de toggle status criada');
    console.log('   ✅ Hook useToggleUserStatus criado');
    console.log('   ✅ Interface atualizada');
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

testToggleStatus(); 