// Script para verificar dados da tabela user_roles
const { PrismaClient } = require('@prisma/client');

async function checkUserRolesData() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Verificando Dados da Tabela User Roles ---');
  console.log('==============================================\n');
  
  try {
    // 1. Contar total de registros
    const totalRoles = await prisma.userRoleAssignment.count();
    console.log(`📊 Total de registros: ${totalRoles}`);
    
    // 2. Listar todos os registros
    const allRoles = await prisma.userRoleAssignment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { userId: 'asc' },
        { role: 'asc' }
      ]
    });
    
    console.log('\n📋 Registros encontrados:');
    allRoles.forEach((role, index) => {
      console.log(`\n   ${index + 1}. ID: ${role.id}`);
      console.log(`      UserId: ${role.userId}`);
      console.log(`      User: ${role.user?.name || 'N/A'} (${role.user?.email || 'N/A'})`);
      console.log(`      Role: ${role.role}`);
      console.log(`      CompanyId: ${role.companyId || 'N/A'}`);
      console.log(`      IsActive: ${role.isActive}`);
      console.log(`      Permissions: ${role.permissions ? 'Sim' : 'Não'}`);
      console.log(`      Created: ${role.createdAt}`);
      console.log(`      Updated: ${role.updatedAt}`);
    });
    
    // 3. Verificar se há userIds duplicados
    const userIdGroups = {};
    allRoles.forEach(role => {
      if (!userIdGroups[role.userId]) {
        userIdGroups[role.userId] = [];
      }
      userIdGroups[role.userId].push(role);
    });
    
    const duplicates = Object.entries(userIdGroups)
      .filter(([userId, roles]) => roles.length > 1)
      .map(([userId, roles]) => ({ userId, roles }));
    
    if (duplicates.length > 0) {
      console.log('\n⚠️ USUÁRIOS COM MÚLTIPLOS ROLES:');
      duplicates.forEach(duplicate => {
        console.log(`\n   UserId: ${duplicate.userId}`);
        duplicate.roles.forEach(role => {
          console.log(`     - Role: ${role.role}, ID: ${role.id}, Ativo: ${role.isActive}`);
        });
      });
    } else {
      console.log('\n✅ Nenhum usuário com múltiplos roles encontrado');
    }
    
    // 4. Verificar se há combinações userId + role duplicadas
    const roleCombinations = {};
    allRoles.forEach(role => {
      const key = `${role.userId}-${role.role}`;
      if (!roleCombinations[key]) {
        roleCombinations[key] = [];
      }
      roleCombinations[key].push(role);
    });
    
    const duplicateCombinations = Object.entries(roleCombinations)
      .filter(([key, roles]) => roles.length > 1)
      .map(([key, roles]) => ({ key, roles }));
    
    if (duplicateCombinations.length > 0) {
      console.log('\n🚨 COMBINAÇÕES DUPLICADAS (userId + role):');
      duplicateCombinations.forEach(duplicate => {
        console.log(`\n   Combinação: ${duplicate.key}`);
        duplicate.roles.forEach(role => {
          console.log(`     - ID: ${role.id}, Ativo: ${role.isActive}, Updated: ${role.updatedAt}`);
        });
      });
    } else {
      console.log('\n✅ Nenhuma combinação duplicada encontrada');
    }
    
    // 5. Estatísticas por role
    const roleStats = {};
    allRoles.forEach(role => {
      if (!roleStats[role.role]) {
        roleStats[role.role] = 0;
      }
      roleStats[role.role]++;
    });
    
    console.log('\n📊 Estatísticas por Role:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} usuários`);
    });
    
    // 6. Verificar usuários sem roles
    const usersWithRoles = new Set(allRoles.map(role => role.userId));
    const totalUsers = await prisma.user.count();
    const usersWithoutRoles = totalUsers - usersWithRoles.size;
    
    console.log(`\n📊 Usuários sem roles: ${usersWithoutRoles}`);
    
  } catch (error) {
    console.error('\n❌ Erro ao verificar dados:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

checkUserRolesData(); 