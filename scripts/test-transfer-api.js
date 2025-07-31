// Script para testar a API de transferências e verificar se a função está sendo retornada
const { PrismaClient } = require('@prisma/client');

async function testTransferAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando API de transferências...');
    
    // 1. Verificar se existem transferências
    const transferRequests = await prisma.transferRequest.findMany({
      include: {
        employee: { 
          select: { 
            id: true, 
            name: true, 
            registration: true, 
            cpf: true, 
            currentFunction: { select: { name: true } },
            companyFunction: { select: { name: true } }
          } 
        },
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        responsibleBy: { select: { id: true, name: true, email: true } },
        finalizedBy: { select: { id: true, name: true, email: true } },
        fromContract: { select: { id: true, name: true, code: true } },
        toContract: { select: { id: true, name: true, code: true } },
      },
      take: 5
    });
    
    console.log(`📊 Total de transferências encontradas: ${transferRequests.length}`);
    
    transferRequests.forEach((transfer, index) => {
      console.log(`\n--- Transferência ${index + 1} ---`);
      console.log(`ID: ${transfer.id}`);
      console.log(`Funcionário: ${transfer.employee?.name}`);
      console.log(`CPF: ${transfer.employee?.cpf}`);
      console.log(`Matrícula: ${transfer.employee?.registration}`);
      console.log(`Função atual: ${transfer.employee?.currentFunction?.name || 'N/A'}`);
      console.log(`Função empresa: ${transfer.employee?.companyFunction?.name || 'N/A'}`);
      console.log(`Status: ${transfer.status}`);
      console.log(`Data agendada: ${transfer.scheduledDate}`);
    });
    
    // 2. Testar a API via fetch
    console.log('\n🧪 Testando API via fetch...');
    
    try {
      const response = await fetch('http://localhost:3000/api/transfer-requests');
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ API funcionando corretamente');
        console.log(`📊 Transferências retornadas: ${result.transferRequests?.length || 0}`);
        
        if (result.transferRequests && result.transferRequests.length > 0) {
          const firstTransfer = result.transferRequests[0];
          console.log('\n📋 Primeira transferência da API:');
          console.log(`Funcionário: ${firstTransfer.employee?.name}`);
          console.log(`CPF: ${firstTransfer.employee?.cpf}`);
          console.log(`Matrícula: ${firstTransfer.employee?.registration}`);
          console.log(`Função atual: ${firstTransfer.employee?.currentFunction?.name || 'N/A'}`);
          console.log(`Função empresa: ${firstTransfer.employee?.companyFunction?.name || 'N/A'}`);
          
          // Verificar se a função está sendo exibida corretamente
          const functionName = firstTransfer.employee?.currentFunction?.name || 
                             firstTransfer.employee?.companyFunction?.name || 'N/A';
          
          if (functionName !== 'N/A') {
            console.log('✅ Função está sendo retornada corretamente pela API');
          } else {
            console.log('❌ Função não está sendo retornada pela API');
          }
        }
      } else {
        console.log('❌ Erro na API:', result);
      }
    } catch (error) {
      console.log('❌ Erro ao testar API:', error.message);
      console.log('💡 Certifique-se de que o servidor está rodando em http://localhost:3000');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testTransferAPI()
  .then(() => {
    console.log('\n🎯 Teste concluído!');
  })
  .catch(error => {
    console.error('❌ Falha no teste:', error);
    process.exit(1);
  }); 