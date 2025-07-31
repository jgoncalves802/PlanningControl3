// Script para verificar se o funcionário tem função atribuída
const { PrismaClient } = require('@prisma/client');

async function checkEmployeeFunction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando função do funcionário ABIAS CORREA DE SOUSA...');
    
    // Buscar o funcionário específico
    const employee = await prisma.employee.findFirst({
      where: {
        name: {
          contains: 'ABIAS CORREA DE SOUSA',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        cpf: true,
        registration: true,
        currentFunctionId: true,
        companyFunctionId: true,
        currentContractId: true,
        currentFunction: {
          select: {
            id: true,
            name: true
          }
        },
        companyFunction: {
          select: {
            id: true,
            name: true
          }
        },
        currentContract: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
    
    if (!employee) {
      console.log('❌ Funcionário não encontrado');
      return;
    }
    
    console.log('✅ Funcionário encontrado:');
    console.log(`- ID: ${employee.id}`);
    console.log(`- Nome: ${employee.name}`);
    console.log(`- CPF: ${employee.cpf}`);
    console.log(`- Matrícula: ${employee.registration}`);
    console.log(`- Contrato atual: ${employee.currentContract?.name || 'N/A'}`);
    console.log(`- Função atual (currentFunction): ${employee.currentFunction?.name || 'N/A'}`);
    console.log(`- Função empresa (companyFunction): ${employee.companyFunction?.name || 'N/A'}`);
    
    // Verificar se tem função
    const hasFunction = employee.currentFunction || employee.companyFunction;
    
    if (hasFunction) {
      console.log('✅ Funcionário tem função atribuída');
    } else {
      console.log('❌ Funcionário NÃO tem função atribuída');
      
      // Verificar se tem currentFunctionId ou companyFunctionId
      console.log(`- currentFunctionId: ${employee.currentFunctionId || 'N/A'}`);
      console.log(`- companyFunctionId: ${employee.companyFunctionId || 'N/A'}`);
      
      // Listar funções disponíveis
      console.log('\n📋 Funções disponíveis:');
      const functions = await prisma.contractFunction.findMany({
        select: {
          id: true,
          name: true,
          contract: {
            select: {
              name: true
            }
          }
        },
        take: 10
      });
      
      functions.forEach((func, index) => {
        console.log(`${index + 1}. ${func.name} (Contrato: ${func.contract.name})`);
      });
      
      // Listar funções de empresa
      console.log('\n🏢 Funções de empresa disponíveis:');
      const companyFunctions = await prisma.companyFunction.findMany({
        select: {
          id: true,
          name: true,
          laborType: true
        },
        take: 10
      });
      
      companyFunctions.forEach((func, index) => {
        console.log(`${index + 1}. ${func.name} (Tipo: ${func.laborType})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar função:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
checkEmployeeFunction()
  .then(() => {
    console.log('\n🎯 Verificação concluída!');
  })
  .catch(error => {
    console.error('❌ Falha na verificação:', error);
    process.exit(1);
  }); 