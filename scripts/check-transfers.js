const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTransfers() {
  try {
    console.log('🔍 Verificando transferências no banco de dados...');
    console.log('');

    // Buscar todas as transferências
    const transfers = await prisma.transferRequest.findMany({
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            cpf: true
          }
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    console.log(`📊 Total de transferências encontradas: ${transfers.length}`);
    console.log('');

    if (transfers.length > 0) {
      console.log('🔄 Transferências no banco:');
      transfers.forEach((transfer, index) => {
        console.log(`   ${index + 1}. ID: ${transfer.id}`);
        console.log(`      Funcionário: ${transfer.employee?.name || 'N/A'} (${transfer.employee?.cpf || 'N/A'})`);
        console.log(`      Contrato Destino: ${transfer.toContractId}`);
        console.log(`      Função Destino: ${transfer.toFunctionId}`);
        console.log(`      Status: ${transfer.status}`);
        console.log(`      Data Agendada: ${transfer.scheduledDate.toLocaleDateString('pt-BR')}`);
        console.log(`      Solicitado por: ${transfer.requestedBy?.name || 'N/A'} (${transfer.requestedBy?.email || 'N/A'})`);
        console.log(`      Aprovado por: ${transfer.approvedBy?.name || 'N/A'} (${transfer.approvedBy?.email || 'N/A'})`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma transferência encontrada no banco de dados');
      console.log('');
      console.log('💡 Para resolver o problema:');
      console.log('   1. Verifique se as transferências estão sendo criadas');
      console.log('   2. Verifique se o usuário correto está sendo usado');
      console.log('   3. Verifique se há filtros aplicados na listagem');
    }

    // Verificar usuários que podem ter criado transferências
    console.log('👥 Verificando usuários que podem ter criado transferências...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`✅ ${users.length} usuário(s) encontrado(s):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    console.log('');

    // Verificar se há transferências por usuário
    console.log('🔍 Verificando transferências por usuário...');
    for (const user of users) {
      const userTransfers = await prisma.transferRequest.count({
        where: {
          requestedById: user.id
        }
      });
      
      if (userTransfers > 0) {
        console.log(`   ${user.name}: ${userTransfers} transferência(s)`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar transferências:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransfers(); 