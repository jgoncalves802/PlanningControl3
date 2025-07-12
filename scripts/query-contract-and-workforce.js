const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // 1. Buscar contrato
    const contract = await prisma.contract.findFirst({
      where: { name: { contains: 'VAGÕES', mode: 'insensitive' } },
    });
    if (!contract) {
      console.log('❌ Contrato "VAGÕES DA COQUERIA" não encontrado.');
      return;
    }
    console.log('Contrato encontrado:', contract.id, '-', contract.name);

    // 2. Buscar registros de efetivo para hoje
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const entries = await prisma.workforceEntry.findMany({
      where: {
        contractId: contract.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { name: true, registration: true, nfcCardId: true, currentContractId: true } } }
    });
    if (entries.length === 0) {
      console.log('⚠️  Nenhum registro de efetivo encontrado para hoje nesse contrato.');
    } else {
      console.log(`✅ ${entries.length} registros encontrados para hoje:`);
      entries.forEach(e => {
        console.log(`- ${e.employee?.name || 'N/A'} (${e.employee?.registration || 'N/A'}) | Status: ${e.status} | CheckIn: ${e.checkInTime}`);
      });
    }

    // 3. Buscar funcionário WILER pelo CPF
    const cpf = '10056110685';
    const employee = await prisma.employee.findFirst({
      where: { cpf },
      select: { id: true, name: true, currentContractId: true, currentContract: { select: { name: true, id: true } } }
    });
    if (!employee) {
      console.log(`❌ Funcionário com CPF ${cpf} não encontrado.`);
    } else {
      console.log(`\nFuncionário com CPF ${cpf}:`);
      console.log(employee);
    }
  } catch (err) {
    console.error('Erro ao consultar:', err);
  } finally {
    process.exit();
  }
}

main(); 