// Script para testar a criação de transferências
const { PrismaClient } = require('@prisma/client');

async function testTransferCreation() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando criação de transferência...');
    
    // 1. Verificar usuários disponíveis
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      take: 3
    });
    
    console.log('📊 Usuários disponíveis:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Nome: ${user.name}, Email: ${user.email}`);
    });
    
    // 2. Verificar funcionários disponíveis
    const employees = await prisma.employee.findMany({
      select: { id: true, name: true, cpf: true, currentContractId: true },
      where: { isActive: true },
      take: 3
    });
    
    console.log('\n👥 Funcionários disponíveis:');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ID: ${emp.id}, Nome: ${emp.name}, CPF: ${emp.cpf}, Contrato: ${emp.currentContractId}`);
    });
    
    // 3. Verificar contratos disponíveis
    const contracts = await prisma.contract.findMany({
      select: { id: true, name: true, code: true },
      where: { isActive: true },
      take: 3
    });
    
    console.log('\n📋 Contratos disponíveis:');
    contracts.forEach((contract, index) => {
      console.log(`${index + 1}. ID: ${contract.id}, Nome: ${contract.name}, Código: ${contract.code}`);
    });
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Criando usuário padrão...');
      const newUser = await prisma.user.create({
        data: {
          clerkId: 'test-user',
          email: 'test@example.com',
          name: 'Usuário Teste',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      users.push(newUser);
    }
    
    if (employees.length === 0) {
      console.log('❌ Nenhum funcionário encontrado. Criando funcionário padrão...');
      const newEmployee = await prisma.employee.create({
        data: {
          name: 'Funcionário Teste',
          cpf: '12345678901',
          registration: 'TEST001',
          company: 'SARTORI SERVIÇOS',
          status: 'ACTIVE',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      employees.push(newEmployee);
    }
    
    if (contracts.length === 0) {
      console.log('❌ Nenhum contrato encontrado. Criando contrato padrão...');
      const newContract = await prisma.contract.create({
        data: {
          name: 'Contrato Teste',
          code: 'TEST',
          workdayHours: 8,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      contracts.push(newContract);
    }
    
    // 4. Testar criação de transferência via API
    console.log('\n🧪 Testando criação de transferência via API...');
    
    const testData = {
      employeeId: employees[0].id,
      toContractId: contracts[0].id,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
      requestedById: users[0].id
    };
    
    console.log('📤 Dados de teste:', testData);
    
    const response = await fetch('http://localhost:3000/api/transfer-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Transferência criada com sucesso!');
      console.log('📋 Resultado:', result);
    } else {
      console.log('❌ Erro ao criar transferência:');
      console.log('Status:', response.status);
      console.log('Erro:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testTransferCreation()
  .then(() => {
    console.log('\n🎯 Teste concluído!');
  })
  .catch(error => {
    console.error('❌ Falha no teste:', error);
    process.exit(1);
  }); 