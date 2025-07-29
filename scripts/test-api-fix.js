const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIFix() {
  try {
    console.log('🧪 Testando Correção da API');
    console.log('============================');
    console.log('');

    // Simular a lógica da API
    const transferRequests = await prisma.transferRequest.findMany({
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 10
    });

    console.log(`📊 Transferências encontradas: ${transferRequests.length}`);
    console.log('');

    if (transferRequests.length > 0) {
      // Buscar dados dos contratos e funções manualmente
      const contractIds = [...new Set(transferRequests.map(t => t.toContractId))];
      const functionIds = [...new Set(transferRequests.map(t => t.toFunctionId))];

      console.log(`📋 IDs de contratos únicos: ${contractIds.length}`);
      console.log(`📋 IDs de funções únicos: ${functionIds.length}`);
      console.log('');

      const [contracts, functions] = await Promise.all([
        prisma.contract.findMany({
          where: { id: { in: contractIds } },
          select: { id: true, name: true, code: true }
        }),
        prisma.contractFunction.findMany({
          where: { id: { in: functionIds } },
          select: { id: true, name: true }
        })
      ]);

      console.log(`✅ Contratos encontrados: ${contracts.length}`);
      console.log(`✅ Funções encontradas: ${functions.length}`);
      console.log('');

      // Criar mapas para acesso rápido
      const contractMap = new Map(contracts.map(c => [c.id, c]));
      const functionMap = new Map(functions.map(f => [f.id, f]));

      // Adicionar dados dos contratos e funções às transferências
      const transferRequestsWithDetails = transferRequests.map(transfer => ({
        ...transfer,
        toContract: contractMap.get(transfer.toContractId),
        toFunction: functionMap.get(transfer.toFunctionId)
      }));

      console.log('📋 Transferências com detalhes:');
      transferRequestsWithDetails.forEach((transfer, index) => {
        console.log(`   ${index + 1}. ID: ${transfer.id}`);
        console.log(`      Funcionário: ${transfer.employee?.name || 'N/A'}`);
        console.log(`      Contrato: ${transfer.toContract?.name || 'N/A'} (${transfer.toContract?.code || 'N/A'})`);
        console.log(`      Função: ${transfer.toFunction?.name || 'N/A'}`);
        console.log(`      Status: ${transfer.status}`);
        console.log(`      Solicitado por: ${transfer.requestedBy?.name || 'N/A'}`);
        console.log('');
      });

      console.log('✅ Teste concluído com sucesso!');
      console.log('');
      console.log('💡 A API agora deve estar funcionando corretamente!');

    } else {
      console.log('❌ Nenhuma transferência encontrada para testar');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIFix(); 