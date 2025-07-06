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
  await prisma.employee.create({
    data: {
      name: 'João da Silva',
      cpf: '12345678901',
      isActive: true,
      nfcCardId: 'NFC123456',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 