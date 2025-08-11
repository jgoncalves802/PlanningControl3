// Script para limpar registros duplicados de user_roles
const { PrismaClient } = require('@prisma/client');

async function cleanDuplicateUserRoles() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Limpando Registros Duplicados de User Roles ---');
  console.log('==================================================\n');
  
  try {
    // 1. Verificar registros duplicados
    console.log('🔍 Verificando registros duplicados...');
    
    const duplicateGroups = await prisma.$queryRaw`
      SELECT "userId", "role", COUNT(*) as count
      FROM user_roles
      GROUP BY "userId", "role"
      HAVING COUNT(*) > 1
      ORDER BY "userId", "role"
    `;
    
    if (duplicateGroups.length === 0) {
      console.log('✅ Nenhum registro duplicado encontrado!');
      return;
    }
    
    console.log(`⚠️ Encontrados ${duplicateGroups.length} grupos de registros duplicados:`);
    duplicateGroups.forEach(group => {
      console.log(`   UserId: ${group.userId}, Role: ${group.role}, Count: ${group.count}`);
    });
    
    // 2. Para cada grupo duplicado, manter apenas o registro mais recente
    console.log('\n🧹 Limpando registros duplicados...');
    
    for (const group of duplicateGroups) {
      console.log(`\n   Processando: UserId ${group.userId}, Role ${group.role}`);
      
      // Buscar todos os registros para este userId + role
      const duplicates = await prisma.userRoleAssignment.findMany({
        where: {
          userId: group.userId,
          role: group.role
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      if (duplicates.length > 1) {
        // Manter o primeiro (mais recente) e remover os outros
        const toKeep = duplicates[0];
        const toRemove = duplicates.slice(1);
        
        console.log(`     ✅ Mantendo: ID ${toKeep.id} (atualizado em ${toKeep.updatedAt})`);
        
        for (const duplicate of toRemove) {
          console.log(`     🗑️ Removendo: ID ${duplicate.id} (atualizado em ${duplicate.updatedAt})`);
          
          await prisma.userRoleAssignment.delete({
            where: { id: duplicate.id }
          });
        }
      }
    }
    
    // 3. Verificar se ainda há duplicados
    console.log('\n🔍 Verificando se ainda há duplicados...');
    
    const remainingDuplicates = await prisma.$queryRaw`
      SELECT "userId", "role", COUNT(*) as count
      FROM user_roles
      GROUP BY "userId", "role"
      HAVING COUNT(*) > 1
    `;
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ Todos os duplicados foram removidos com sucesso!');
    } else {
      console.log('❌ Ainda existem duplicados:', remainingDuplicates);
    }
    
    // 4. Estatísticas finais
    const totalRoles = await prisma.userRoleAssignment.count();
    console.log(`\n📊 Total de registros após limpeza: ${totalRoles}`);
    
    // 5. Verificar usuários únicos
    const uniqueUsers = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId") as unique_users
      FROM user_roles
    `;
    
    console.log(`📊 Usuários únicos com roles: ${uniqueUsers[0].unique_users}`);
    
    console.log('\n🎉 Limpeza de registros duplicados concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Aplicar migração do Prisma');
    console.log('   2. Verificar se a constraint única foi criada');
    console.log('   3. Testar criação de novos roles');
    
  } catch (error) {
    console.error('\n❌ Erro ao limpar registros duplicados:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

cleanDuplicateUserRoles(); 