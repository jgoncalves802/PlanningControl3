// Script para testar se a constraint única está funcionando
const { PrismaClient } = require('@prisma/client');

async function testUniqueConstraint() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Testando Constraint Única da Tabela User Roles ---');
  console.log('======================================================\n');
  
  try {
    // 1. Verificar registros existentes
    console.log('🔍 Verificando registros existentes...');
    
    const existingRoles = await prisma.userRoleAssignment.findMany({
      take: 1,
      orderBy: { createdAt: 'asc' }
    });
    
    if (existingRoles.length === 0) {
      console.log('❌ Nenhum registro encontrado para teste');
      return;
    }
    
    const testRole = existingRoles[0];
    console.log(`📋 Usando para teste: UserId: ${testRole.userId}, Role: ${testRole.role}`);
    
    // 2. Tentar criar um registro duplicado
    console.log('\n🧪 Testando constraint única...');
    
    try {
      const duplicateRole = await prisma.userRoleAssignment.create({
        data: {
          userId: testRole.userId,
          role: testRole.role,
          companyId: testRole.companyId,
          permissions: testRole.permissions,
          isActive: false
        }
      });
      
      // Se chegou aqui, a constraint não está funcionando
      console.log('❌ Constraint única não está funcionando!');
      console.log('   Registro duplicado criado com ID:', duplicateRole.id);
      
      // Remover o registro de teste
      await prisma.userRoleAssignment.delete({
        where: { id: duplicateRole.id }
      });
      console.log('   Registro de teste removido');
      
    } catch (constraintError) {
      if (constraintError.code === 'P2002') {
        console.log('✅ Constraint única está funcionando!');
        console.log('   Erro esperado ao tentar criar duplicata:', constraintError.message);
      } else {
        console.log('⚠️ Erro inesperado:', constraintError.message);
      }
    }
    
    // 3. Verificar se ainda há apenas 3 registros
    console.log('\n🔍 Verificando total de registros...');
    
    const totalRoles = await prisma.userRoleAssignment.count();
    console.log(`📊 Total de registros: ${totalRoles}`);
    
    if (totalRoles === 3) {
      console.log('✅ Número de registros mantido (sem duplicatas)');
    } else {
      console.log('❌ Número de registros alterado');
    }
    
    // 4. Testar criação de role diferente para o mesmo usuário
    console.log('\n🧪 Testando criação de role diferente para o mesmo usuário...');
    
    try {
      const differentRole = await prisma.userRoleAssignment.create({
        data: {
          userId: testRole.userId,
          role: 'USER', // Role diferente
          companyId: testRole.companyId,
          permissions: { canView: true },
          isActive: true
        }
      });
      
      console.log('✅ Role diferente criado com sucesso:', differentRole.id);
      
      // Remover o registro de teste
      await prisma.userRoleAssignment.delete({
        where: { id: differentRole.id }
      });
      console.log('   Registro de teste removido');
      
    } catch (error) {
      console.log('❌ Erro ao criar role diferente:', error.message);
    }
    
    // 5. Verificação final
    console.log('\n🔍 Verificação final...');
    
    const finalRoles = await prisma.userRoleAssignment.findMany({
      orderBy: [
        { userId: 'asc' },
        { role: 'asc' }
      ]
    });
    
    console.log(`📊 Total de registros: ${finalRoles.length}`);
    
    // Verificar se há duplicatas
    const combinations = {};
    let hasDuplicates = false;
    
    finalRoles.forEach(role => {
      const key = `${role.userId}-${role.role}`;
      if (combinations[key]) {
        hasDuplicates = true;
        console.log(`   ❌ Duplicata encontrada: ${key}`);
      }
      combinations[key] = true;
    });
    
    if (!hasDuplicates) {
      console.log('✅ Nenhuma duplicata encontrada');
    }
    
    console.log('\n🎉 Teste da constraint única concluído!');
    
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

testUniqueConstraint(); 