const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTransferFunctions() {
  try {
    console.log('🔧 Corrigindo funções das transferências...');
    console.log('');

    // Buscar todas as funções disponíveis
    const functions = await prisma.contractFunction.findMany({
      select: { id: true, name: true, contractId: true }
    });

    console.log(`📋 Funções disponíveis: ${functions.length}`);
    functions.forEach(func => {
      console.log(`   ${func.id}: ${func.name} (Contrato: ${func.contractId})`);
    });
    console.log('');

    if (functions.length === 0) {
      console.log('❌ Nenhuma função encontrada. Criando funções padrão...');
      
      // Buscar contratos
      const contracts = await prisma.contract.findMany({
        select: { id: true, name: true, code: true }
      });

      // Criar funções padrão para cada contrato
      for (const contract of contracts) {
        const functionsToCreate = [
          { name: 'Operador', contractId: contract.id },
          { name: 'Auxiliar', contractId: contract.id },
          { name: 'Supervisor', contractId: contract.id },
          { name: 'Técnico', contractId: contract.id }
        ];

        for (const funcData of functionsToCreate) {
          try {
            const newFunction = await prisma.contractFunction.create({
              data: funcData
            });
            console.log(`   ✅ Criada função: ${newFunction.name} para contrato ${contract.name}`);
          } catch (error) {
            if (error.code === 'P2002') {
              console.log(`   ⚠️ Função ${funcData.name} já existe para contrato ${contract.name}`);
            } else {
              console.log(`   ❌ Erro ao criar função ${funcData.name}: ${error.message}`);
            }
          }
        }
      }
      console.log('');
    }

    // Buscar transferências com funções inválidas
    const transfers = await prisma.transferRequest.findMany({
      select: {
        id: true,
        toContractId: true,
        toFunctionId: true
      }
    });

    console.log(`📊 Transferências para corrigir: ${transfers.length}`);
    console.log('');

    // Corrigir cada transferência
    for (const transfer of transfers) {
      // Verificar se a função existe
      const functionExists = await prisma.contractFunction.findUnique({
        where: { id: transfer.toFunctionId }
      });

      if (!functionExists) {
        console.log(`🔧 Corrigindo transferência ${transfer.id}:`);
        console.log(`   Contrato: ${transfer.toContractId}`);
        console.log(`   Função inválida: ${transfer.toFunctionId}`);

        // Buscar uma função válida para o contrato
        const validFunction = await prisma.contractFunction.findFirst({
          where: { contractId: transfer.toContractId },
          select: { id: true, name: true }
        });

        if (validFunction) {
          // Atualizar a transferência
          await prisma.transferRequest.update({
            where: { id: transfer.id },
            data: { toFunctionId: validFunction.id }
          });
          console.log(`   ✅ Corrigida para função: ${validFunction.name} (${validFunction.id})`);
        } else {
          console.log(`   ❌ Nenhuma função válida encontrada para o contrato ${transfer.toContractId}`);
        }
        console.log('');
      } else {
        console.log(`✅ Transferência ${transfer.id}: Função válida (${functionExists.name})`);
      }
    }

    console.log('🎉 Correção concluída!');
    console.log('');

    // Verificar se as correções funcionaram
    console.log('🔍 Verificando correções...');
    const updatedTransfers = await prisma.transferRequest.findMany({
      include: {
        toContract: { select: { name: true, code: true } },
        toFunction: { select: { name: true } }
      }
    });

    updatedTransfers.forEach(transfer => {
      console.log(`   ${transfer.id}: ${transfer.toContract?.name} - ${transfer.toFunction?.name}`);
    });

  } catch (error) {
    console.error('❌ Erro ao corrigir funções:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTransferFunctions(); 