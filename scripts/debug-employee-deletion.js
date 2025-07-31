const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEmployeeDeletion() {
  try {
    // ID do funcionário que está falhando
    const employeeId = 'cmdnz5xg8000di840da3w6181';
    
    console.log('🔍 Debugando deleção do funcionário:', employeeId);
    
    // 1. Verificar se o funcionário existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });
    
    if (!employee) {
      console.log('❌ Funcionário não encontrado');
      return;
    }
    
    console.log('✅ Funcionário encontrado:', employee.name);
    
    // 2. Verificar transferências associadas
    const transferRequests = await prisma.transferRequest.findMany({
      where: { employeeId: employeeId }
    });
    
    console.log('📋 Transferências associadas:', transferRequests.length);
    if (transferRequests.length > 0) {
      console.log('   Detalhes das transferências:');
      transferRequests.forEach((transfer, index) => {
        console.log(`   ${index + 1}. ID: ${transfer.id}, Status: ${transfer.status}, Data: ${transfer.requestedAt}`);
      });
    }
    
    // 3. Verificar outros registros associados
    console.log('\n🔍 Verificando outros registros associados...');
    
    // Verificar workforce entries
    const workforceEntries = await prisma.workforceEntry.findMany({
      where: { employeeId: employeeId }
    });
    console.log('👥 Workforce entries:', workforceEntries.length);
    
    // Verificar audit logs (usando entityId)
    const auditLogs = await prisma.auditLog.findMany({
      where: { 
        entityId: employeeId
      }
    });
    console.log('📝 Audit logs:', auditLogs.length);
    
    // Verificar NFC badges
    const nfcBadges = await prisma.nFCBadge.findMany({
      where: { employeeId: employeeId }
    });
    console.log('🏷️ NFC badges:', nfcBadges.length);
    
    // Verificar time records
    const timeRecords = await prisma.timeRecord.findMany({
      where: { employeeId: employeeId }
    });
    console.log('⏰ Time records:', timeRecords.length);
    
    // Verificar transfer history
    const transferHistory = await prisma.transferHistory.findMany({
      where: { employeeId: employeeId }
    });
    console.log('📚 Transfer history:', transferHistory.length);
    
    // Verificar ASOs
    const asos = await prisma.aSO.findMany({
      where: { employeeId: employeeId }
    });
    console.log('🏥 ASOs:', asos.length);
    
    // Verificar employee trainings
    const trainings = await prisma.employeeTraining.findMany({
      where: { employeeId: employeeId }
    });
    console.log('📖 Trainings:', trainings.length);
    
    // 4. Tentar deletar e capturar o erro específico
    console.log('\n🗑️ Tentando deletar funcionário...');
    
    try {
      await prisma.employee.delete({
        where: { id: employeeId }
      });
      console.log('✅ Funcionário deletado com sucesso!');
    } catch (deleteError) {
      console.log('❌ Erro ao deletar:', deleteError.code);
      console.log('   Mensagem:', deleteError.message);
      console.log('   Meta:', deleteError.meta);
      
      if (deleteError.code === 'P2003') {
        console.log('🔗 Erro de chave estrangeira detectado');
        console.log('   Constraint:', deleteError.meta?.constraint);
        console.log('   Field:', deleteError.meta?.field_name);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugEmployeeDeletion(); 