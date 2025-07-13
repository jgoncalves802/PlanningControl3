// scripts/fix-workforce-entries.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const entries = await prisma.workforceEntry.findMany({
    where: {
      OR: [
        { functionId: null },
        { functionName: null },
        { functionName: 'EMPTY' },
        { functionName: '' },
        { employeeRegistration: null },
        { employeeRegistration: '' },
      ],
    },
  });

  console.log(`Encontrados ${entries.length} registros para corrigir.`);

  for (const entry of entries) {
    const employee = await prisma.employee.findUnique({
      where: { id: entry.employeeId },
      include: { companyFunction: true },
    });

    if (!employee) continue;

    const functionId = employee.companyFunctionId || null;
    const functionName = employee.companyFunction?.name || '-';
    const employeeRegistration = employee.registration || '-';

    await prisma.workforceEntry.update({
      where: { id: entry.id },
      data: {
        functionId,
        functionName,
        employeeRegistration,
      },
    });

    console.log(`Corrigido entry ${entry.id}: functionId=${functionId}, functionName=${functionName}, employeeRegistration=${employeeRegistration}`);
  }

  console.log('Correção concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 