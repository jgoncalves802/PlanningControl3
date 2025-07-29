const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTransferSchema() {
  try {
    console.log('🔄 Migrando Schema das Transferências');
    console.log('=====================================');
    console.log('');

    // Buscar todas as transferências existentes
    const existingTransfers = await prisma.transferRequest.findMany({
      include: {
        employee: {
          select: {
            currentContractId: true,
            contractId: true
          }
        }
      }
    });

    console.log(`📊 Transferências encontradas: ${existingTransfers.length}`);
    console.log('');

    // Atualizar cada transferência
    for (const transfer of existingTransfers) {
      console.log(`🔄 Migrando transferência ${transfer.id}:`);
      
      // Determinar o contrato de origem
      const fromContractId = transfer.employee?.currentContractId || transfer.employee?.contractId;
      
      if (fromContractId) {
        console.log(`   Contrato de origem: ${fromContractId}`);
        console.log(`   Contrato de destino: ${transfer.toContractId}`);
        
        // Atualizar a transferência com o novo schema
        await prisma.transferRequest.update({
          where: { id: transfer.id },
          data: {
            fromContractId: fromContractId,
            // Manter toContractId como está
            // Remover toFunctionId (será feito pela migração do banco)
          }
        });
        
        console.log(`   ✅ Migrada com sucesso`);
      } else {
        console.log(`   ⚠️ Funcionário sem contrato atual, usando contrato de destino como origem`);
        
        // Se não há contrato atual, usar o contrato de destino como origem
        await prisma.transferRequest.update({
          where: { id: transfer.id },
          data: {
            fromContractId: transfer.toContractId,
          }
        });
      }
      console.log('');
    }

    console.log('🎉 Migração concluída!');
    console.log('');
    console.log('💡 Próximos passos:');
    console.log('   1. Aplicar migração do banco: npx prisma db push');
    console.log('   2. Regenerar cliente: npx prisma generate');
    console.log('   3. Atualizar API e frontend');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTransferSchema(); 