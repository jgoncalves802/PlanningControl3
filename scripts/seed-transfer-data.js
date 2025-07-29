const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTransferData() {
  try {
    console.log('🌱 Populando dados de teste para Transferências');
    console.log('==============================================');
    console.log('');

    // Criar usuários de teste
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@teste.com' },
        update: {},
        create: {
          clerkId: 'clerk_admin_test',
          email: 'admin@teste.com',
          name: 'Administrador Teste'
        }
      }),
      prisma.user.upsert({
        where: { email: 'gerente@teste.com' },
        update: {},
        create: {
          clerkId: 'clerk_gerente_test',
          email: 'gerente@teste.com',
          name: 'Gerente Teste'
        }
      }),
      prisma.user.upsert({
        where: { email: 'supervisor@teste.com' },
        update: {},
        create: {
          clerkId: 'clerk_supervisor_test',
          email: 'supervisor@teste.com',
          name: 'Supervisor Teste'
        }
      })
    ]);

    console.log('✅ Usuários criados:', users.length);

    // Criar contratos de teste
    const contracts = await Promise.all([
      prisma.contract.upsert({
        where: { code: 'CONTRATO-A' },
        update: {},
        create: {
          name: 'Contrato A - Construção',
          code: 'CONTRATO-A',
          workdayHours: 8,
          includesWeekends: false,
          includesHolidays: false
        }
      }),
      prisma.contract.upsert({
        where: { code: 'CONTRATO-B' },
        update: {},
        create: {
          name: 'Contrato B - Manutenção',
          code: 'CONTRATO-B',
          workdayHours: 8,
          includesWeekends: false,
          includesHolidays: false
        }
      }),
      prisma.contract.upsert({
        where: { code: 'CONTRATO-C' },
        update: {},
        create: {
          name: 'Contrato C - Operação',
          code: 'CONTRATO-C',
          workdayHours: 8,
          includesWeekends: false,
          includesHolidays: false
        }
      })
    ]);

    console.log('✅ Contratos criados:', contracts.length);

    // Criar funções de teste
    const functions = await Promise.all([
      prisma.contractFunction.upsert({
        where: { 
          contractId_name: {
            contractId: contracts[0].id,
            name: 'Pedreiro'
          }
        },
        update: {},
        create: {
          contractId: contracts[0].id,
          name: 'Pedreiro'
        }
      }),
      prisma.contractFunction.upsert({
        where: { 
          contractId_name: {
            contractId: contracts[1].id,
            name: 'Eletricista'
          }
        },
        update: {},
        create: {
          contractId: contracts[1].id,
          name: 'Eletricista'
        }
      }),
      prisma.contractFunction.upsert({
        where: { 
          contractId_name: {
            contractId: contracts[2].id,
            name: 'Operador'
          }
        },
        update: {},
        create: {
          contractId: contracts[2].id,
          name: 'Operador'
        }
      })
    ]);

    console.log('✅ Funções criadas:', functions.length);

    // Criar funcionários de teste
    const employees = await Promise.all([
      prisma.employee.upsert({
        where: { cpf: '12345678901' },
        update: {},
        create: {
          name: 'João Silva',
          cpf: '12345678901',
          registration: 'EMP001',
          currentContractId: contracts[0].id,
          currentFunctionId: functions[0].id
        }
      }),
      prisma.employee.upsert({
        where: { cpf: '98765432100' },
        update: {},
        create: {
          name: 'Maria Santos',
          cpf: '98765432100',
          registration: 'EMP002',
          currentContractId: contracts[1].id,
          currentFunctionId: functions[1].id
        }
      }),
      prisma.employee.upsert({
        where: { cpf: '11122233344' },
        update: {},
        create: {
          name: 'Pedro Costa',
          cpf: '11122233344',
          registration: 'EMP003',
          currentContractId: contracts[2].id,
          currentFunctionId: functions[2].id
        }
      })
    ]);

    console.log('✅ Funcionários criados:', employees.length);

    // Criar transferências de teste com timestamps
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const transfers = await Promise.all([
      // Transferência completa (todas as etapas)
      prisma.transferRequest.create({
        data: {
          employeeId: employees[0].id,
          fromContractId: contracts[0].id,
          toContractId: contracts[1].id,
          requestedById: users[0].id,
          approvedById: users[1].id,
          responsibleById: users[2].id,
          finalizedById: users[0].id,
          status: 'COMPLETED',
          scheduledDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Amanhã
          requestedAt: threeHoursAgo,
          approvedAt: new Date(threeHoursAgo.getTime() + 30 * 60 * 1000), // 30 min depois
          transferredAt: new Date(threeHoursAgo.getTime() + 60 * 60 * 1000), // 1h depois
          finalizedAt: new Date(threeHoursAgo.getTime() + 90 * 60 * 1000), // 1h30 depois
          completedAt: new Date(threeHoursAgo.getTime() + 90 * 60 * 1000)
        }
      }),
      // Transferência aprovada (aguardando transferência)
      prisma.transferRequest.create({
        data: {
          employeeId: employees[1].id,
          fromContractId: contracts[1].id,
          toContractId: contracts[2].id,
          requestedById: users[1].id,
          approvedById: users[0].id,
          status: 'APPROVED',
          scheduledDate: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 2 dias
          requestedAt: twoHoursAgo,
          approvedAt: new Date(twoHoursAgo.getTime() + 45 * 60 * 1000) // 45 min depois
        }
      }),
      // Transferência pendente
      prisma.transferRequest.create({
        data: {
          employeeId: employees[2].id,
          fromContractId: contracts[2].id,
          toContractId: contracts[0].id,
          requestedById: users[2].id,
          status: 'PENDING',
          scheduledDate: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 dias
          requestedAt: oneHourAgo
        }
      })
    ]);

    console.log('✅ Transferências criadas:', transfers.length);
    console.log('');
    console.log('🎉 Dados de teste populados com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   - Usuários: ${users.length}`);
    console.log(`   - Contratos: ${contracts.length}`);
    console.log(`   - Funções: ${functions.length}`);
    console.log(`   - Funcionários: ${employees.length}`);
    console.log(`   - Transferências: ${transfers.length}`);

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTransferData(); 