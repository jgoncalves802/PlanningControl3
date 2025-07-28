const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestFunctions() {
  try {
    console.log('🔄 Criando funções de teste...');

    // Funções de Mão de Obra Direta
    const directLaborFunctions = [
      {
        name: 'PEDREIRO',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'AJUDANTE DE PEDREIRO',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'ENCARREGADO DE OBRA',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'MESTRE DE OBRAS',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'TÉCNICO DE MANUTENÇÃO',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'ELETRICISTA INDUSTRIAL',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'MECÂNICO INDUSTRIAL',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'OPERADOR DE EMPILHADEIRA',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'AUXILIAR DE ESTOQUE',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'CONFERENTE',
        laborType: 'DIRETO',
        isActive: true,
      },
      {
        name: 'VIGILANTE',
        laborType: 'DIRETO',
        isActive: true,
      }
    ];

    // Funções de Mão de Obra Indireta
    const indirectLaborFunctions = [
      {
        name: 'SUPERVISOR DE MANUTENÇÃO',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'COORDENADOR DE LOGÍSTICA',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'SUPERVISOR DE SEGURANÇA',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'COORDENADOR DE SEGURANÇA',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'AUXILIAR ADMINISTRATIVO',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'ASSISTENTE DE RH',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'CONTADOR',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'ANALISTA DE COMPRAS',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'ANALISTA DE QUALIDADE',
        laborType: 'INDIRETO',
        isActive: true,
      },
      {
        name: 'TÉCNICO DE SEGURANÇA DO TRABALHO',
        laborType: 'INDIRETO',
        isActive: true,
      }
    ];

    // Criar todas as funções
    const allFunctions = [...directLaborFunctions, ...indirectLaborFunctions];
    
    for (const func of allFunctions) {
      await prisma.companyFunction.create({
        data: func
      });
    }

    console.log('✅ Funções de teste criadas com sucesso!');
    console.log('\n📋 Resumo das funções criadas:');
    console.log(`\n🔧 Mão de Obra Direta (${directLaborFunctions.length} funções):`);
    directLaborFunctions.forEach(func => {
      console.log(`  - ${func.name}`);
    });
    
    console.log(`\n👔 Mão de Obra Indireta (${indirectLaborFunctions.length} funções):`);
    indirectLaborFunctions.forEach(func => {
      console.log(`  - ${func.name}`);
    });

    console.log(`\n📊 Total: ${allFunctions.length} funções criadas`);

  } catch (error) {
    console.error('❌ Erro ao criar funções de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestFunctions(); 