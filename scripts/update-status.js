// Script simples para atualizar status dos funcionários
const { PrismaClient } = require('@prisma/client');

async function updateStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Atualizando status dos funcionários...');
    
    // Atualizar 'active' para 'ACTIVE'
    const result1 = await prisma.employee.updateMany({
      where: { status: 'active' },
      data: { status: 'ACTIVE' }
    });
    console.log(`Atualizados ${result1.count} funcionários de 'active' para 'ACTIVE'`);
    
    // Atualizar 'inactive' para 'DISMISSED'
    const result2 = await prisma.employee.updateMany({
      where: { status: 'inactive' },
      data: { status: 'DISMISSED' }
    });
    console.log(`Atualizados ${result2.count} funcionários de 'inactive' para 'DISMISSED'`);
    
    // Verificar resultado
    const employees = await prisma.employee.findMany({
      select: { name: true, status: true }
    });
    
    console.log('\nStatus após atualização:');
    employees.forEach(emp => {
      console.log(`- ${emp.name}: ${emp.status}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStatus(); 