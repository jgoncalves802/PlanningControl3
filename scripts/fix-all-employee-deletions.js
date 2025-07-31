const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllEmployeeDeletions() {
  try {
    console.log('🔧 Corrigindo deleções de funcionários...\n');
    
    // IDs dos funcionários que estão falhando
    const employeeIds = [
      'cmdnz5xgc000fi840sclfezrk',
      'cmdnz5xgh000hi840kuazb5yd'
    ];
    
    for (const employeeId of employeeIds) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processando funcionário: ${employeeId}`);
      console.log(`${'='.repeat(60)}`);
      
      try {
        // 1. Verificar se o funcionário existe
        const employee = await prisma.employee.findUnique({
          where: { id: employeeId }
        });
        
        if (!employee) {
          console.log('❌ Funcionário não encontrado');
          continue;
        }
        
        console.log('✅ Funcionário encontrado:', employee.name);
        
        // 2. Verificar transferências associadas
        const transferRequests = await prisma.transferRequest.findMany({
          where: { employeeId: employeeId },
          include: {
            fromContract: true,
            toContract: true,
            requestedBy: true
          }
        });
        
        console.log('📋 Transferências encontradas:', transferRequests.length);
        
        if (transferRequests.length > 0) {
          console.log('🗑️ Removendo transferências...');
          
          // Mostrar detalhes das transferências
          transferRequests.forEach((transfer, index) => {
            console.log(`   ${index + 1}. ID: ${transfer.id}`);
            console.log(`      Status: ${transfer.status}`);
            console.log(`      De: ${transfer.fromContract?.name || 'N/A'}`);
            console.log(`      Para: ${transfer.toContract?.name || 'N/A'}`);
            console.log(`      Solicitado por: ${transfer.requestedBy?.name || 'N/A'}`);
            console.log(`      Data: ${transfer.requestedAt}`);
          });
          
          // Remover todas as transferências
          const deleteResult = await prisma.transferRequest.deleteMany({
            where: { employeeId: employeeId }
          });
          
          console.log(`✅ ${deleteResult.count} transferência(s) removida(s)`);
        }
        
        // 3. Deletar o funcionário
        console.log('🗑️ Deletando funcionário...');
        
        const deletedEmployee = await prisma.employee.delete({
          where: { id: employeeId }
        });
        
        console.log('✅ Funcionário deletado com sucesso!');
        console.log('   Nome:', deletedEmployee.name);
        console.log('   ID:', deletedEmployee.id);
        
      } catch (error) {
        console.log('❌ Erro ao processar funcionário:', employeeId);
        console.log('   Erro:', error.message);
        
        if (error.code === 'P2003') {
          console.log('   Tipo: Erro de chave estrangeira');
          console.log('   Constraint:', error.meta?.constraint);
        }
      }
    }
    
    console.log('\n🎉 Processamento concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllEmployeeDeletions(); 