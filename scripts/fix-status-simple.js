// Script simples para corrigir status dos funcionários
const { PrismaClient } = require('@prisma/client');

async function fixStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando funcionários...');
    
    // Buscar todos os funcionários
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    console.log(`📊 Encontrados ${employees.length} funcionários:`);
    employees.forEach(emp => {
      console.log(`- ${emp.name}: ${emp.status}`);
    });

    // Verificar se há funcionários com status inválidos
    const invalidEmployees = employees.filter(emp => 
      emp.status === 'active' || emp.status === 'inactive'
    );

    if (invalidEmployees.length === 0) {
      console.log('✅ Nenhum funcionário com status inválido encontrado!');
      return;
    }

    console.log(`\n🔧 Corrigindo ${invalidEmployees.length} funcionários...`);

    // Corrigir cada funcionário individualmente
    for (const emp of invalidEmployees) {
      const newStatus = emp.status === 'active' ? 'ACTIVE' : 'DISMISSED';
      
      await prisma.employee.update({
        where: { id: emp.id },
        data: { status: newStatus }
      });
      
      console.log(`✅ ${emp.name}: '${emp.status}' → '${newStatus}'`);
    }

    console.log('\n🎉 Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStatus(); 