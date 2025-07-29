const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTransferTimestamps() {
  try {
    console.log('🔄 Migrando Timestamps das Transferências');
    console.log('=========================================');
    console.log('');

    // Buscar todas as transferências existentes
    const existingTransfers = await prisma.transferRequest.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        completedAt: true
      }
    });

    console.log(`📊 Transferências encontradas: ${existingTransfers.length}`);
    console.log('');

    // Atualizar cada transferência com timestamps baseados no status
    for (const transfer of existingTransfers) {
      console.log(`🔄 Migrando transferência ${transfer.id}:`);
      
      const updateData = {
        requestedAt: transfer.createdAt // Usar createdAt como requestedAt
      };

      // Baseado no status atual, definir timestamps
      switch (transfer.status) {
        case 'APPROVED':
        case 'IN_PROGRESS':
        case 'COMPLETED':
          updateData.approvedAt = new Date(transfer.createdAt.getTime() + 1000 * 60 * 30); // 30 min depois
          break;
      }

      if (transfer.status === 'COMPLETED' && transfer.completedAt) {
        updateData.finalizedAt = transfer.completedAt;
        updateData.transferredAt = new Date(transfer.completedAt.getTime() - 1000 * 60 * 15); // 15 min antes
      }

      // Atualizar a transferência
      await prisma.transferRequest.update({
        where: { id: transfer.id },
        data: updateData
      });

      console.log(`   Status: ${transfer.status}`);
      console.log(`   RequestedAt: ${updateData.requestedAt}`);
      if (updateData.approvedAt) console.log(`   ApprovedAt: ${updateData.approvedAt}`);
      if (updateData.transferredAt) console.log(`   TransferredAt: ${updateData.transferredAt}`);
      if (updateData.finalizedAt) console.log(`   FinalizedAt: ${updateData.finalizedAt}`);
      console.log(`   ✅ Migrada com sucesso`);
      console.log('');
    }

    console.log('🎉 Migração de timestamps concluída!');
    console.log('');
    console.log('💡 Próximos passos:');
    console.log('   1. Aplicar migração do banco: npx prisma db push');
    console.log('   2. Regenerar cliente: npx prisma generate');
    console.log('   3. Testar métricas no frontend');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTransferTimestamps(); 