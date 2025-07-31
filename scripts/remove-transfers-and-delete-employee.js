const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeTransfersAndDeleteEmployee() {
  try {
    // ID do funcionário que está falhando
    const employeeId = 'cmdnz5xg8000di840da3w6181';
    
    console.log('🔍 Processando funcionário:', employeeId);
    
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
      where: { employeeId: employeeId },
      include: {
        fromContract: true,
        toContract: true,
        requestedBy: true
      }
    });
    
    console.log('📋 Transferências encontradas:', transferRequests.length);
    
    if (transferRequests.length > 0) {
      console.log('\n🗑️ Removendo transferências...');
      
      // Mostrar detalhes das transferências que serão removidas
      transferRequests.forEach((transfer, index) => {
        console.log(`   ${index + 1}. ID: ${transfer.id}`);
        console.log(`      Status: ${transfer.status}`);
        console.log(`      De: ${transfer.fromContract?.name || 'N/A'}`);
        console.log(`      Para: ${transfer.toContract?.name || 'N/A'}`);
        console.log(`      Solicitado por: ${transfer.requestedBy?.name || 'N/A'}`);
        console.log(`      Data: ${transfer.requestedAt}`);
        console.log('');
      });
      
      // Remover todas as transferências
      const deleteResult = await prisma.transferRequest.deleteMany({
        where: { employeeId: employeeId }
      });
      
      console.log(`✅ ${deleteResult.count} transferência(s) removida(s)`);
    }
    
    // 3. Agora tentar deletar o funcionário
    console.log('\n🗑️ Deletando funcionário...');
    
    try {
      const deletedEmployee = await prisma.employee.delete({
        where: { id: employeeId }
      });
      
      console.log('✅ Funcionário deletado com sucesso!');
      console.log('   Nome:', deletedEmployee.name);
      console.log('   ID:', deletedEmployee.id);
      
    } catch (deleteError) {
      console.log('❌ Erro ao deletar funcionário após remover transferências:');
      console.log('   Código:', deleteError.code);
      console.log('   Mensagem:', deleteError.message);
      console.log('   Meta:', deleteError.meta);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função para processar múltiplos funcionários
async function processMultipleEmployees() {
  const employeeIds = [
    'cmdnz5xg8000di840da3w6181',
    'cmdnz5xgc000fi840sclfezrk',
    'cmdnz5xgh000hi840kuazb5yd'
  ];
  
  console.log('🔄 Processando múltiplos funcionários...\n');
  
  for (const employeeId of employeeIds) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processando: ${employeeId}`);
    console.log(`${'='.repeat(50)}`);
    
    // Atualizar o ID no script
    const scriptContent = require('fs').readFileSync('scripts/remove-transfers-and-delete-employee.js', 'utf8');
    const updatedScript = scriptContent.replace(
      /const employeeId = '.*?';/,
      `const employeeId = '${employeeId}';`
    );
    require('fs').writeFileSync('scripts/remove-transfers-and-delete-employee.js', updatedScript);
    
    // Executar o script
    await removeTransfersAndDeleteEmployee();
    
    console.log('\n');
  }
}

// Executar para um funcionário específico
removeTransfersAndDeleteEmployee();

// Para processar múltiplos funcionários, descomente a linha abaixo:
// processMultipleEmployees(); 