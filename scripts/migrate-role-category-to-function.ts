import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateRoleCategoryToFunction() {
  console.log('🔄 Iniciando migração de role/category para currentFunctionId...');
  
  try {
    // Buscar todos os funcionários que têm role ou category preenchidos
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { role: { not: null } },
          { category: { not: null } }
        ]
      },
      include: {
        currentFunction: true,
        companyFunction: true
      }
    });

    console.log(`📊 Encontrados ${employees.length} funcionários com role/category`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const employee of employees) {
      console.log(`\n👤 Processando: ${employee.name}`);
      console.log(`   Role atual: ${employee.role}`);
      console.log(`   Category atual: ${employee.category}`);
      console.log(`   currentFunctionId atual: ${employee.currentFunctionId}`);

      // Se já tem currentFunctionId, pular
      if (employee.currentFunctionId) {
        console.log(`   ⏭️  Já tem currentFunctionId, pulando...`);
        skippedCount++;
        continue;
      }

      // Tentar encontrar função baseada no role ou category
      let functionToAssign = null;

      // Primeiro, tentar encontrar por role
      if (employee.role) {
        functionToAssign = await prisma.contractFunction.findFirst({
          where: {
            name: {
              contains: employee.role,
              mode: 'insensitive'
            }
          }
        });
      }

      // Se não encontrou por role, tentar por category
      if (!functionToAssign && employee.category) {
        functionToAssign = await prisma.contractFunction.findFirst({
          where: {
            name: {
              contains: employee.category,
              mode: 'insensitive'
            }
          }
        });
      }

      if (functionToAssign) {
        console.log(`   ✅ Encontrada função: ${functionToAssign.name} (ID: ${functionToAssign.id})`);
        
        // Atualizar o funcionário
        await prisma.employee.update({
          where: { id: employee.id },
          data: {
            currentFunctionId: functionToAssign.id,
            currentContractId: functionToAssign.contractId
          }
        });

        console.log(`   ✅ Funcionário atualizado com sucesso`);
        updatedCount++;
      } else {
        console.log(`   ❌ Nenhuma função encontrada para role: "${employee.role}" ou category: "${employee.category}"`);
        
        // Criar uma função padrão se não existir
        const defaultFunction = await prisma.contractFunction.findFirst({
          where: {
            name: {
              contains: 'Padrão',
              mode: 'insensitive'
            }
          }
        });

        if (defaultFunction) {
          console.log(`   🔧 Usando função padrão: ${defaultFunction.name}`);
          await prisma.employee.update({
            where: { id: employee.id },
            data: {
              currentFunctionId: defaultFunction.id,
              currentContractId: defaultFunction.contractId
            }
          });
          updatedCount++;
        } else {
          console.log(`   ⚠️  Nenhuma função padrão encontrada, mantendo dados originais`);
          skippedCount++;
        }
      }
    }

    console.log(`\n📈 Resumo da migração:`);
    console.log(`   ✅ Funcionários atualizados: ${updatedCount}`);
    console.log(`   ⏭️  Funcionários pulados: ${skippedCount}`);
    console.log(`   📊 Total processado: ${employees.length}`);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRoleCategoryToFunction(); 