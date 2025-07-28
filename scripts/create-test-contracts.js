const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestContracts() {
  try {
    console.log('🔄 Criando contratos de teste...');

    // Contrato 1: Construção Civil
    const contract1 = await prisma.contract.create({
      data: {
        name: 'Contrato de Construção Civil - Edifício Comercial',
        code: 'CONST-2024-001',
        isActive: true,
        workdayHours: 8,
        includesWeekends: false,
        includesHolidays: false,
      }
    });

    // Funções para o contrato 1
    await prisma.contractFunction.createMany({
      data: [
        {
          contractId: contract1.id,
          name: 'Pedreiro',
          isActive: true,
        },
        {
          contractId: contract1.id,
          name: 'Ajudante de Pedreiro',
          isActive: true,
        },
        {
          contractId: contract1.id,
          name: 'Encarregado de Obra',
          isActive: true,
        },
        {
          contractId: contract1.id,
          name: 'Mestre de Obras',
          isActive: true,
        }
      ]
    });

    // Contrato 2: Manutenção Industrial
    const contract2 = await prisma.contract.create({
      data: {
        name: 'Contrato de Manutenção Industrial - Petrobras',
        code: 'MANUT-2024-002',
        isActive: true,
        workdayHours: 6,
        includesWeekends: true,
        includesHolidays: true,
      }
    });

    // Funções para o contrato 2
    await prisma.contractFunction.createMany({
      data: [
        {
          contractId: contract2.id,
          name: 'Técnico de Manutenção',
          isActive: true,
        },
        {
          contractId: contract2.id,
          name: 'Eletricista Industrial',
          isActive: true,
        },
        {
          contractId: contract2.id,
          name: 'Mecânico Industrial',
          isActive: true,
        },
        {
          contractId: contract2.id,
          name: 'Supervisor de Manutenção',
          isActive: true,
        }
      ]
    });

    // Contrato 3: Administrativo
    const contract3 = await prisma.contract.create({
      data: {
        name: 'Contrato Administrativo - Escritório Central',
        code: 'ADMIN-2024-003',
        isActive: true,
        workdayHours: 8,
        includesWeekends: false,
        includesHolidays: false,
      }
    });

    // Funções para o contrato 3
    await prisma.contractFunction.createMany({
      data: [
        {
          contractId: contract3.id,
          name: 'Auxiliar Administrativo',
          isActive: true,
        },
        {
          contractId: contract3.id,
          name: 'Assistente de RH',
          isActive: true,
        },
        {
          contractId: contract3.id,
          name: 'Contador',
          isActive: true,
        }
      ]
    });

    // Contrato 4: Logística
    const contract4 = await prisma.contract.create({
      data: {
        name: 'Contrato de Logística - Armazém Central',
        code: 'LOG-2024-004',
        isActive: true,
        workdayHours: 8,
        includesWeekends: true,
        includesHolidays: false,
      }
    });

    // Funções para o contrato 4
    await prisma.contractFunction.createMany({
      data: [
        {
          contractId: contract4.id,
          name: 'Operador de Empilhadeira',
          isActive: true,
        },
        {
          contractId: contract4.id,
          name: 'Auxiliar de Estoque',
          isActive: true,
        },
        {
          contractId: contract4.id,
          name: 'Conferente',
          isActive: true,
        },
        {
          contractId: contract4.id,
          name: 'Coordenador de Logística',
          isActive: true,
        }
      ]
    });

    // Contrato 5: Segurança
    const contract5 = await prisma.contract.create({
      data: {
        name: 'Contrato de Segurança - Shopping Center',
        code: 'SEG-2024-005',
        isActive: true,
        workdayHours: 12,
        includesWeekends: true,
        includesHolidays: true,
      }
    });

    // Funções para o contrato 5
    await prisma.contractFunction.createMany({
      data: [
        {
          contractId: contract5.id,
          name: 'Vigilante',
          isActive: true,
        },
        {
          contractId: contract5.id,
          name: 'Supervisor de Segurança',
          isActive: true,
        },
        {
          contractId: contract5.id,
          name: 'Coordenador de Segurança',
          isActive: true,
        }
      ]
    });

    console.log('✅ Contratos de teste criados com sucesso!');
    console.log('\n📋 Resumo dos contratos criados:');
    console.log('1. Construção Civil - Edifício Comercial (CONST-2024-001)');
    console.log('2. Manutenção Industrial - Petrobras (MANUT-2024-002)');
    console.log('3. Administrativo - Escritório Central (ADMIN-2024-003)');
    console.log('4. Logística - Armazém Central (LOG-2024-004)');
    console.log('5. Segurança - Shopping Center (SEG-2024-005)');

  } catch (error) {
    console.error('❌ Erro ao criar contratos de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestContracts(); 