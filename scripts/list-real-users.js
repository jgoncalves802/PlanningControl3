// Script para listar usuários reais do banco de dados
const { PrismaClient } = require('@prisma/client');

async function listRealUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Listando usuários reais do banco de dados...');
    console.log('==============================================');
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true,
        contractResponsibilities: {
          select: {
            contract: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📊 Total de usuários encontrados: ${users.length}`);
    console.log('');
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      console.log('');
      console.log('💡 Para criar usuários de teste, execute:');
      console.log('   node scripts/create-test-users.js');
      return;
    }
    
    // Listar usuários
    console.log('👥 Lista de Usuários:');
    console.log('======================');
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'Sem nome'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Clerk ID: ${user.clerkId}`);
      console.log(`   Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
      console.log(`   Atualizado em: ${user.updatedAt.toLocaleDateString('pt-BR')}`);
      
      if (user.contractResponsibilities.length > 0) {
        console.log(`   Contratos responsável:`);
        user.contractResponsibilities.forEach(resp => {
          console.log(`     - ${resp.contract.name} (${resp.contract.code})`);
        });
      } else {
        console.log(`   Contratos responsável: Nenhum`);
      }
    });
    
    // Verificar responsabilidades de contratos
    console.log('\n🔐 Verificando responsabilidades de contratos...');
    console.log('==============================================');
    
    const responsibilities = await prisma.contractResponsible.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        contract: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });
    
    console.log(`📊 Total de responsabilidades: ${responsibilities.length}`);
    
    if (responsibilities.length > 0) {
      console.log('\nResponsabilidades por usuário:');
      responsibilities.forEach((resp, index) => {
        console.log(`${index + 1}. ${resp.user.name} (${resp.user.email})`);
        console.log(`   Contrato: ${resp.contract.name} (${resp.contract.code})`);
      });
    } else {
      console.log('❌ Nenhuma responsabilidade encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
listRealUsers()
  .then(() => {
    console.log('\n🎯 Listagem concluída!');
  })
  .catch(error => {
    console.error('❌ Falha na listagem:', error);
    process.exit(1);
  }); 