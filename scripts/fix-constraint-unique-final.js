// Script para corrigir definitivamente o erro de constraint única
const { PrismaClient } = require('@prisma/client');

async function fixConstraintUniqueFinal() {
  const prisma = new PrismaClient();
  
  console.log('\\n--- Correção Definitiva do Erro de Constraint Única ---');
  console.log('========================================================\\n');
  
  try {
    // 1. Verificar usuário super admin
    console.log('🔍 Verificando usuário super admin...');
    
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('✅ Super admin encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);

    // 2. Verificar TODOS os role assignments (ativos e inativos)
    console.log('\\n🔍 Verificando TODOS os role assignments...');
    
    const allRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📋 Total de role assignments: ${allRoles.length}`);
    allRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}, Ativo: ${role.isActive}, ID: ${role.id}, Criado: ${role.createdAt}`);
    });

    // 3. Identificar conflitos de constraint única
    console.log('\\n🔍 Identificando conflitos de constraint única...');
    
    const roleGroups = {};
    allRoles.forEach(role => {
      const key = `${role.userId}-${role.role}`;
      if (!roleGroups[key]) {
        roleGroups[key] = [];
      }
      roleGroups[key].push(role);
    });

    console.log('📊 Grupos por userId-role:');
    Object.entries(roleGroups).forEach(([key, roles]) => {
      console.log(`   ${key}: ${roles.length} registros`);
      if (roles.length > 1) {
        console.log(`      ⚠️  CONFLITO DETECTADO!`);
        roles.forEach((role, index) => {
          console.log(`         ${index + 1}. ID: ${role.id}, Ativo: ${role.isActive}, Criado: ${role.createdAt}`);
        });
      }
    });

    // 4. Resolver conflitos - manter apenas o mais recente ativo
    console.log('\\n🔧 Resolvendo conflitos...');
    
    for (const [key, roles] of Object.entries(roleGroups)) {
      if (roles.length > 1) {
        console.log(`\\n🗑️  Resolvendo conflito para: ${key}`);
        
        // Ordenar por data de criação (mais recente primeiro)
        const sortedRoles = roles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Manter apenas o primeiro (mais recente) e deletar os outros
        const keepRole = sortedRoles[0];
        const deleteRoles = sortedRoles.slice(1);
        
        console.log(`   ✅ Mantendo: ID ${keepRole.id} (${keepRole.isActive ? 'Ativo' : 'Inativo'})`);
        
        for (const role of deleteRoles) {
          console.log(`   🗑️  Deletando: ID ${role.id} (${role.isActive ? 'Ativo' : 'Inativo'})`);
          
          await prisma.userRoleAssignment.delete({
            where: { id: role.id }
          });
        }
      }
    }

    // 5. Verificar resultado após limpeza
    console.log('\\n🔍 Verificando resultado após limpeza...');
    
    const finalRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📋 Total de role assignments após limpeza: ${finalRoles.length}`);
    finalRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}, Ativo: ${role.isActive}, ID: ${role.id}`);
    });

    // 6. Garantir que há um role SUPER_ADMIN ativo
    console.log('\\n🔧 Garantindo role SUPER_ADMIN ativo...');
    
    const activeSuperAdminRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: superAdmin.id,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    if (!activeSuperAdminRole) {
      console.log('⚠️  Nenhum role SUPER_ADMIN ativo encontrado!');
      
      // Verificar se existe um role SUPER_ADMIN inativo
      const inactiveSuperAdminRole = await prisma.userRoleAssignment.findFirst({
        where: {
          userId: superAdmin.id,
          role: 'SUPER_ADMIN',
          isActive: false
        }
      });

      if (inactiveSuperAdminRole) {
        console.log('🔄 Ativando role SUPER_ADMIN existente...');
        
        await prisma.userRoleAssignment.update({
          where: { id: inactiveSuperAdminRole.id },
          data: {
            isActive: true,
            updatedAt: new Date()
          }
        });
      } else {
        console.log('📝 Criando novo role SUPER_ADMIN...');
        
        const superAdminPermissions = {
          "dashboard": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "employees": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "contracts": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "budgets": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "safety": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "planning": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "transfers": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "employeeAssignment": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "workforceControl": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "nfcManagement": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "analytics": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "settings": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true },
          "backup": { "canView": true, "canEdit": true, "canCreate": true, "canDelete": true, "canExport": true, "canImport": true }
        };

        await prisma.userRoleAssignment.create({
          data: {
            userId: superAdmin.id,
            role: 'SUPER_ADMIN',
            permissions: superAdminPermissions,
            isActive: true
          }
        });
      }
    } else {
      console.log('✅ Role SUPER_ADMIN ativo já existe');
    }

    // 7. Verificação final
    console.log('\\n🔍 Verificação final...');
    
    const finalCheck = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      }
    });

    console.log(`📋 Total final de role assignments: ${finalCheck.length}`);
    finalCheck.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}, Ativo: ${role.isActive}, ID: ${role.id}`);
    });

    // 8. Teste de constraint única
    console.log('\\n🔒 Teste de constraint única...');
    
    const constraintTest = await prisma.userRoleAssignment.groupBy({
      by: ['userId', 'role'],
      where: {
        userId: superAdmin.id
      },
      _count: {
        id: true
      }
    });

    console.log('📊 Verificação de constraint única:');
    constraintTest.forEach((group, index) => {
      console.log(`   ${index + 1}. userId: ${group.userId}, role: ${group.role}, count: ${group._count.id}`);
      if (group._count.id > 1) {
        console.log(`      ⚠️  CONFLITO AINDA EXISTE!`);
      } else {
        console.log(`      ✅ OK`);
      }
    });

    console.log('\\n✅ Correção definitiva concluída!');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    
    if (error.code === 'P2002') {
      console.log('\\n🔍 Detalhes do erro de constraint única:');
      console.log(`   Código: ${error.code}`);
      console.log(`   Meta: ${JSON.stringify(error.meta)}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a correção definitiva
fixConstraintUniqueFinal(); 