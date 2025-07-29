const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTransferNames() {
  try {
    console.log('🧪 Testando Nomes de Contratos e Funções');
    console.log('========================================');
    console.log('');

    // Buscar transferências com dados completos
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
        },
        toContract: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        toFunction: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    console.log(`📊 Total de transferências: ${transfers.length}`);
    console.log('');

    if (transfers.length > 0) {
      console.log('📋 Transferências com nomes:');
      transfers.forEach((transfer, index) => {
        console.log(`   ${index + 1}. ID: ${transfer.id}`);
        console.log(`      Funcionário: ${transfer.employee?.name || 'N/A'} (${transfer.employee?.cpf || 'N/A'})`);
        console.log(`      Contrato Destino: ${transfer.toContract?.name || 'N/A'} (${transfer.toContract?.code || 'N/A'})`);
        console.log(`      Função Destino: ${transfer.toFunction?.name || 'N/A'}`);
        console.log(`      Status: ${transfer.status}`);
        console.log(`      Solicitado por: ${transfer.requestedBy?.name || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma transferência encontrada');
    }

    // Verificar se as relações estão funcionando
    console.log('🔍 Verificando relações:');
    
    const contracts = await prisma.contract.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            transferRequests: true
          }
        }
      }
    });

    console.log('📋 Contratos e suas transferências:');
    contracts.forEach(contract => {
      console.log(`   ${contract.name} (${contract.code}): ${contract._count.transferRequests} transferências`);
    });
    console.log('');

    const functions = await prisma.contractFunction.findMany({
      select: {
        id: true,
        name: true,
        contractId: true,
        _count: {
          select: {
            transferRequests: true
          }
        }
      }
    });

    console.log('📋 Funções e suas transferências:');
    functions.forEach(func => {
      console.log(`   ${func.name}: ${func._count.transferRequests} transferências`);
    });

    console.log('');
    console.log('✅ Teste concluído!');
    console.log('');
    console.log('💡 Se os nomes estão aparecendo corretamente, a correção funcionou!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTransferNames(); 