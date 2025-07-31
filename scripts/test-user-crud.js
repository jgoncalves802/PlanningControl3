// Script para testar o CRUD completo de usuários
const { PrismaClient } = require('@prisma/client');

async function testUserCRUD() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando CRUD completo de usuários...');
    console.log('========================================');
    
    // 1. Testar listagem de usuários
    console.log('\n📋 1. Testando listagem de usuários...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true,
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
      }
    });
    
    console.log(`✅ Encontrados ${users.length} usuários:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name || 'Sem nome'} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Clerk ID: ${user.clerkId || 'Não definido'}`);
      console.log(`      Contratos: ${user.contractResponsibilities.length}`);
    });
    
    // 2. Testar criação de usuário sem Clerk ID
    console.log('\n➕ 2. Testando criação de usuário sem Clerk ID...');
    const newUserWithoutClerk = await prisma.user.create({
      data: {
        name: 'Usuário Teste Sem Clerk',
        email: 'teste.sem.clerk@exemplo.com'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Usuário criado sem Clerk ID: ${newUserWithoutClerk.name} (${newUserWithoutClerk.email})`);
    console.log(`   ID: ${newUserWithoutClerk.id}`);
    console.log(`   Clerk ID: ${newUserWithoutClerk.clerkId || 'Não definido'}`);
    
    // 3. Testar criação de usuário com Clerk ID
    console.log('\n➕ 3. Testando criação de usuário com Clerk ID...');
    const newUserWithClerk = await prisma.user.create({
      data: {
        name: 'Usuário Teste Com Clerk',
        email: 'teste.com.clerk@exemplo.com',
        clerkId: `clerk_test_crud_${Date.now()}`
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Usuário criado com Clerk ID: ${newUserWithClerk.name} (${newUserWithClerk.email})`);
    console.log(`   ID: ${newUserWithClerk.id}`);
    console.log(`   Clerk ID: ${newUserWithClerk.clerkId}`);
    
    // 4. Testar atualização de usuário
    console.log('\n✏️ 4. Testando atualização de usuário...');
    const updatedUser = await prisma.user.update({
      where: { id: newUserWithClerk.id },
      data: {
        name: 'Usuário Teste CRUD Atualizado'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        updatedAt: true
      }
    });
    
    console.log(`✅ Usuário atualizado: ${updatedUser.name} (${updatedUser.email})`);
    
    // 5. Testar adição de Clerk ID posteriormente
    console.log('\n✏️ 5. Testando adição de Clerk ID posteriormente...');
    const userWithClerkAdded = await prisma.user.update({
      where: { id: newUserWithoutClerk.id },
      data: {
        clerkId: `clerk_added_later_${Date.now()}`
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        updatedAt: true
      }
    });
    
    console.log(`✅ Clerk ID adicionado: ${userWithClerkAdded.name} (${userWithClerkAdded.email})`);
    console.log(`   Clerk ID: ${userWithClerkAdded.clerkId}`);
    
    // 6. Testar permissões de contratos
    console.log('\n🔐 6. Testando permissões de contratos...');
    
    // Buscar contratos disponíveis
    const contracts = await prisma.contract.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true
      },
      take: 2
    });
    
    if (contracts.length > 0) {
      console.log(`📋 Contratos disponíveis: ${contracts.length}`);
      contracts.forEach((contract, index) => {
        console.log(`   ${index + 1}. ${contract.name} (${contract.code})`);
      });
      
      // Adicionar permissão para o primeiro contrato
      const contractToAssign = contracts[0];
      await prisma.contractResponsible.create({
        data: {
          contractId: contractToAssign.id,
          userId: updatedUser.id
        }
      });
      
      console.log(`✅ Permissão adicionada: ${updatedUser.name} -> ${contractToAssign.name}`);
      
      // Verificar permissões do usuário
      const userWithPermissions = await prisma.user.findUnique({
        where: { id: updatedUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          clerkId: true,
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
        }
      });
      
      console.log(`📋 Permissões do usuário ${userWithPermissions.name}:`);
      userWithPermissions.contractResponsibilities.forEach((resp, index) => {
        console.log(`   ${index + 1}. ${resp.contract.name} (${resp.contract.code})`);
      });
      
      // Remover permissão
      await prisma.contractResponsible.delete({
        where: {
          contractId_userId: {
            contractId: contractToAssign.id,
            userId: updatedUser.id
          }
        }
      });
      
      console.log(`✅ Permissão removida: ${updatedUser.name} -> ${contractToAssign.name}`);
    } else {
      console.log('⚠️ Nenhum contrato ativo encontrado para testar permissões');
    }
    
    // 7. Testar deleção de usuários
    console.log('\n🗑️ 7. Testando deleção de usuários...');
    
    // Deletar usuário com Clerk ID
    await prisma.user.delete({
      where: { id: updatedUser.id }
    });
    console.log(`✅ Usuário com Clerk ID deletado: ${updatedUser.name} (${updatedUser.email})`);
    
    // Deletar usuário sem Clerk ID
    await prisma.user.delete({
      where: { id: userWithClerkAdded.id }
    });
    console.log(`✅ Usuário sem Clerk ID deletado: ${userWithClerkAdded.name} (${userWithClerkAdded.email})`);
    
    // 8. Verificar se foram realmente deletados
    console.log('\n🔍 8. Verificando se usuários foram deletados...');
    const deletedUser1 = await prisma.user.findUnique({
      where: { id: updatedUser.id }
    });
    
    const deletedUser2 = await prisma.user.findUnique({
      where: { id: userWithClerkAdded.id }
    });
    
    if (!deletedUser1 && !deletedUser2) {
      console.log('✅ Confirmação: Ambos os usuários foram deletados com sucesso');
    } else {
      console.log('❌ Erro: Usuários ainda existem após deleção');
    }
    
    // 9. Estatísticas finais
    console.log('\n📊 9. Estatísticas finais...');
    const finalUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true
      }
    });
    
    const totalResponsibilities = await prisma.contractResponsible.count();
    const usersWithClerk = finalUsers.filter(u => u.clerkId).length;
    const usersWithoutClerk = finalUsers.filter(u => !u.clerkId).length;
    
    console.log(`📈 Total de usuários: ${finalUsers.length}`);
    console.log(`📈 Usuários com Clerk ID: ${usersWithClerk}`);
    console.log(`📈 Usuários sem Clerk ID: ${usersWithoutClerk}`);
    console.log(`📈 Total de responsabilidades: ${totalResponsibilities}`);
    
    console.log('\n🎯 Teste CRUD de usuários concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante teste CRUD:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testUserCRUD()
  .then(() => {
    console.log('\n✅ Todos os testes foram executados!');
  })
  .catch(error => {
    console.error('❌ Falha nos testes:', error);
    process.exit(1);
  }); 