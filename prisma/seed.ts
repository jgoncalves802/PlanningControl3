// Tente importar do client customizado, se não existir, use o padrão
let PrismaClient;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require('../node_modules/@prisma/tenant-client').PrismaClient;
} catch (e) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require('@prisma/client').PrismaClient;
}

const prisma = new PrismaClient();

async function main() {
  // Criar contratos de exemplo
  const contracts = [
    {
      id: 'CONTRATO-001',
      name: 'Contrato 001 - Construção Civil',
      code: 'CONTRATO-001',
      isActive: true,
      workdayHours: 8,
      includesWeekends: false,
      includesHolidays: false,
    },
    {
      id: 'CONTRATO-002', 
      name: 'Contrato 002 - Manutenção',
      code: 'CONTRATO-002',
      isActive: true,
      workdayHours: 8,
      includesWeekends: true,
      includesHolidays: false,
    },
    {
      id: 'CONTRATO-003',
      name: 'Contrato 003 - Serviços Gerais',
      code: 'CONTRATO-003', 
      isActive: true,
      workdayHours: 8,
      includesWeekends: false,
      includesHolidays: true,
    }
  ]

  for (const contract of contracts) {
    await prisma.contract.upsert({
      where: { id: contract.id },
      update: contract,
      create: contract,
    })
  }

  // Criar funções de exemplo para cada contrato
  const functions = [
    { contractId: 'CONTRATO-001', name: 'Pedreiro' },
    { contractId: 'CONTRATO-001', name: 'Servente' },
    { contractId: 'CONTRATO-001', name: 'Eletricista' },
    { contractId: 'CONTRATO-001', name: 'Encanador' },
    { contractId: 'CONTRATO-002', name: 'Técnico de Manutenção' },
    { contractId: 'CONTRATO-002', name: 'Auxiliar de Manutenção' },
    { contractId: 'CONTRATO-003', name: 'Auxiliar de Serviços Gerais' },
    { contractId: 'CONTRATO-003', name: 'Zelador' },
  ]

  for (const func of functions) {
    await prisma.contractFunction.upsert({
      where: { 
        contractId_name: {
          contractId: func.contractId,
          name: func.name
        }
      },
      update: func,
      create: func,
    })
  }

  console.log('Seed executado com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 