const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTransferFromContract() {
  try {
    console.log('🔄 Corrigindo fromContractId nas Transferências');
    console.log('==============================================');
    console.log('');

    // Buscar todas as transferências que não têm fromContractId
    const transfers = await prisma.transferRequest.findMany({
      where: {
        fromContractId: null
      },
      select: {
        id: true,
        employeeId: true,
        toContractId: true,
        status: true
      }
    });

    console.log(`📊 Transferências encontradas sem fromContractId: ${transfers.length}`);
    console.log('');

    for (const transfer of transfers) {
      console.log(`🔄 Processando transferência ${transfer.id}:`);
      
      // Buscar o funcionário para obter o contrato atual
      const employee = await prisma.employee.findUnique({
        where: { id: transfer.employeeId },
        select: { currentContractId: true }
      });

      if (employee && employee.currentContractId) {
        // Usar o contrato atual do funcionário como fromContractId
        await prisma.transferRequest.update({
          where: { id: transfer.id },
          data: { fromContractId: employee.currentContractId }
        });

        console.log(`   ✅ Atualizado: fromContractId = ${employee.currentContractId}`);
      } else {
        // Se não há contrato atual, usar o mesmo contrato de destino (fallback)
        await prisma.transferRequest.update({
          where: { id: transfer.id },
          data: { fromContractId: transfer.toContractId }
        });

        console.log(`   ⚠️ Fallback: fromContractId = ${transfer.toContractId} (mesmo contrato de destino)`);
      }
    }

    console.log('');
    console.log('🎉 Correção concluída!');
    console.log('');
    console.log('💡 Próximo passo: npx prisma db push');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTransferFromContract(); 