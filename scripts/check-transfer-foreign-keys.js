const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTransferForeignKeys() {
  try {
    console.log('🔍 Verificando chaves estrangeiras das transferências...');
    console.log('');

    // Buscar todas as transferências
    const transfers = await prisma.transferRequest.findMany({
      select: {
        id: true,
        toContractId: true,
        toFunctionId: true,
        employeeId: true
      }
    });

    console.log(`📊 Total de transferências: ${transfers.length}`);
    console.log('');

    // Verificar contratos
    console.log('📋 Verificando contratos de destino:');
    for (const transfer of transfers) {
      const contract = await prisma.contract.findUnique({
        where: { id: transfer.toContractId },
        select: { id: true, name: true, code: true }
      });

      if (contract) {
        console.log(`   ✅ Transferência ${transfer.id}: Contrato ${contract.name} (${contract.code})`);
      } else {
        console.log(`   ❌ Transferência ${transfer.id}: Contrato ${transfer.toContractId} NÃO ENCONTRADO`);
      }
    }
    console.log('');

    // Verificar funções
    console.log('📋 Verificando funções de destino:');
    for (const transfer of transfers) {
      const function_ = await prisma.contractFunction.findUnique({
        where: { id: transfer.toFunctionId },
        select: { id: true, name: true, contractId: true }
      });

      if (function_) {
        console.log(`   ✅ Transferência ${transfer.id}: Função ${function_.name}`);
      } else {
        console.log(`   ❌ Transferência ${transfer.id}: Função ${transfer.toFunctionId} NÃO ENCONTRADA`);
      }
    }
    console.log('');

    // Verificar funcionários
    console.log('📋 Verificando funcionários:');
    for (const transfer of transfers) {
      const employee = await prisma.employee.findUnique({
        where: { id: transfer.employeeId },
        select: { id: true, name: true, cpf: true }
      });

      if (employee) {
        console.log(`   ✅ Transferência ${transfer.id}: Funcionário ${employee.name} (${employee.cpf})`);
      } else {
        console.log(`   ❌ Transferência ${transfer.id}: Funcionário ${transfer.employeeId} NÃO ENCONTRADO`);
      }
    }
    console.log('');

    // Listar todos os contratos disponíveis
    console.log('📋 Contratos disponíveis:');
    const contracts = await prisma.contract.findMany({
      select: { id: true, name: true, code: true }
    });
    contracts.forEach(contract => {
      console.log(`   ${contract.id}: ${contract.name} (${contract.code})`);
    });
    console.log('');

    // Listar todas as funções disponíveis
    console.log('📋 Funções disponíveis:');
    const functions = await prisma.contractFunction.findMany({
      select: { id: true, name: true, contractId: true }
    });
    functions.forEach(func => {
      console.log(`   ${func.id}: ${func.name} (Contrato: ${func.contractId})`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar chaves estrangeiras:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransferForeignKeys(); 