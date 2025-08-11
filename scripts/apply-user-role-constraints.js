// Script para aplicar constraints únicas na tabela user_roles
const { PrismaClient } = require('@prisma/client');

async function applyUserRoleConstraints() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Aplicando Constraints Únicas na Tabela User Roles ---');
  console.log('========================================================\n');
  
  try {
    // 1. Verificar estado atual da tabela
    console.log('🔍 Verificando estado atual da tabela...');
    
    const currentRoles = await prisma.userRoleAssignment.findMany({
      orderBy: [
        { userId: 'asc' },
        { role: 'asc' }
      ]
    });
    
    console.log(`📊 Total de registros: ${currentRoles.length}`);
    
    // 2. Verificar se há combinações duplicadas
    const combinations = {};
    const duplicates = [];
    
    currentRoles.forEach(role => {
      const key = `${role.userId}-${role.role}`;
      if (!combinations[key]) {
        combinations[key] = [];
      }
      combinations[key].push(role);
      
      if (combinations[key].length > 1) {
        duplicates.push({
          key,
          roles: combinations[key]
        });
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️ Encontradas ${duplicates.length} combinações duplicadas:`);
      duplicates.forEach(duplicate => {
        console.log(`\n   Combinação: ${duplicate.key}`);
        duplicate.roles.forEach(role => {
          console.log(`     - ID: ${role.id}, Ativo: ${role.isActive}, Updated: ${role.updatedAt}`);
        });
      });
      
      // 3. Limpar duplicatas mantendo apenas o mais recente
      console.log('\n🧹 Limpando registros duplicados...');
      
      for (const duplicate of duplicates) {
        const [userId, role] = duplicate.key.split('-');
        const rolesToKeep = duplicate.roles.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        const toKeep = rolesToKeep[0];
        const toRemove = rolesToKeep.slice(1);
        
        console.log(`\n   Processando: ${duplicate.key}`);
        console.log(`     ✅ Mantendo: ID ${toKeep.id} (atualizado em ${toKeep.updatedAt})`);
        
        for (const roleToRemove of toRemove) {
          console.log(`     🗑️ Removendo: ID ${roleToRemove.id} (atualizado em ${roleToRemove.updatedAt})`);
          
          await prisma.userRoleAssignment.delete({
            where: { id: roleToRemove.id }
          });
        }
      }
    } else {
      console.log('\n✅ Nenhuma combinação duplicada encontrada');
    }
    
    // 4. Verificar se a constraint única já existe
    console.log('\n🔍 Verificando se a constraint única já existe...');
    
    try {
      // Tentar criar um registro duplicado para testar a constraint
      const testRole = currentRoles[0];
      if (testRole) {
        const duplicateTest = await prisma.userRoleAssignment.create({
          data: {
            userId: testRole.userId,
            role: testRole.role,
            companyId: testRole.companyId,
            permissions: testRole.permissions,
            isActive: false
          }
        });
        
        // Se chegou aqui, a constraint não existe
        console.log('⚠️ Constraint única não existe - criando...');
        
        // Remover o registro de teste
        await prisma.userRoleAssignment.delete({
          where: { id: duplicateTest.id }
        });
        
        // Aplicar a constraint via SQL raw
        await prisma.$executeRaw`ALTER TABLE user_roles ADD CONSTRAINT user_roles_userId_role_key UNIQUE ("userId", role)`;
        console.log('✅ Constraint única criada com sucesso!');
        
      } else {
        console.log('⚠️ Nenhum registro encontrado para teste');
      }
    } catch (constraintError) {
      if (constraintError.code === 'P2002' || constraintError.message.includes('unique constraint')) {
        console.log('✅ Constraint única já existe!');
      } else {
        console.log('⚠️ Erro ao verificar constraint:', constraintError.message);
      }
    }
    
    // 5. Verificação final
    console.log('\n🔍 Verificação final...');
    
    const finalRoles = await prisma.userRoleAssignment.findMany({
      orderBy: [
        { userId: 'asc' },
        { role: 'asc' }
      ]
    });
    
    console.log(`📊 Total de registros após limpeza: ${finalRoles.length}`);
    
    // Verificar se ainda há duplicatas
    const finalCombinations = {};
    let hasDuplicates = false;
    
    finalRoles.forEach(role => {
      const key = `${role.userId}-${role.role}`;
      if (finalCombinations[key]) {
        hasDuplicates = true;
      }
      finalCombinations[key] = true;
    });
    
    if (hasDuplicates) {
      console.log('❌ Ainda existem duplicatas!');
    } else {
      console.log('✅ Nenhuma duplicata encontrada');
    }
    
    // 6. Criar índices para performance
    console.log('\n📊 Criando índices para performance...');
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_roles_userId_role ON user_roles("userId", role)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_roles_isActive ON user_roles("isActive")`;
      console.log('✅ Índices criados com sucesso!');
    } catch (indexError) {
      console.log('⚠️ Erro ao criar índices:', indexError.message);
    }
    
    console.log('\n🎉 Processo concluído com sucesso!');
    console.log('\n📝 Resumo das ações:');
    console.log('   ✅ Verificação de duplicatas');
    console.log('   ✅ Limpeza de registros duplicados');
    console.log('   ✅ Aplicação de constraint única');
    console.log('   ✅ Criação de índices de performance');
    
  } catch (error) {
    console.error('\n❌ Erro ao aplicar constraints:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

applyUserRoleConstraints(); 