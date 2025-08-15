// Script para corrigir role assignments duplicados
const { PrismaClient } = require('@prisma/client');

async function fixDuplicateUserRoles() {
  const prisma = new PrismaClient();
  
  console.log('\\n--- Correção de Role Assignments Duplicados ---');
  console.log('================================================\\n');
  
  try {
    // 1. Verificar usuário super admin
    console.log('🔍 Verificando usuário super admin...');
    
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@planningcontrol.com'
      },
      include: {
        userRoles: true
      }
    });

    if (!superAdmin) {
      console.log('❌ Usuário super admin não encontrado');
      return;
    }

    console.log('✅ Super admin encontrado:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);

    // 2. Verificar role assignments existentes
    console.log('\\n🔍 Verificando role assignments existentes...');
    
    const existingRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📋 Total de role assignments: ${existingRoles.length}`);
    existingRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}, Ativo: ${role.isActive}, ID: ${role.id}, Criado: ${role.createdAt}`);
    });

    // 3. Identificar duplicatas
    console.log('\\n🔍 Identificando duplicatas...');
    
    const activeRoles = existingRoles.filter(r => r.isActive);
    const inactiveRoles = existingRoles.filter(r => !r.isActive);
    
    console.log(`📊 Roles ativos: ${activeRoles.length}`);
    console.log(`📊 Roles inativos: ${inactiveRoles.length}`);

    if (activeRoles.length > 1) {
      console.log('⚠️  MÚLTIPLOS ROLES ATIVOS DETECTADOS!');
      
      // Manter apenas o role SUPER_ADMIN ativo
      const superAdminRole = activeRoles.find(r => r.role === 'SUPER_ADMIN');
      const otherActiveRoles = activeRoles.filter(r => r.role !== 'SUPER_ADMIN');
      
      if (superAdminRole) {
        console.log(`✅ Mantendo role SUPER_ADMIN ativo (ID: ${superAdminRole.id})`);
        
        // Desativar outros roles ativos
        for (const role of otherActiveRoles) {
          console.log(`🗑️  Desativando role ${role.role} (ID: ${role.id})`);
          
          await prisma.userRoleAssignment.update({
            where: { id: role.id },
            data: {
              isActive: false,
              updatedAt: new Date()
            }
          });
        }
      } else {
        console.log('❌ Nenhum role SUPER_ADMIN encontrado!');
        
        // Se não há SUPER_ADMIN, manter o primeiro role ativo e desativar os outros
        const firstRole = activeRoles[0];
        const otherRoles = activeRoles.slice(1);
        
        console.log(`✅ Mantendo primeiro role ativo: ${firstRole.role} (ID: ${firstRole.id})`);
        
        for (const role of otherRoles) {
          console.log(`🗑️  Desativando role ${role.role} (ID: ${role.id})`);
          
          await prisma.userRoleAssignment.update({
            where: { id: role.id },
            data: {
              isActive: false,
              updatedAt: new Date()
            }
          });
        }
      }
    } else {
      console.log('✅ Apenas um role ativo encontrado - sem correção necessária');
    }

    // 4. Verificar resultado final
    console.log('\\n🔍 Verificando resultado final...');
    
    const finalRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId: superAdmin.id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📋 Total de role assignments após correção: ${finalRoles.length}`);
    finalRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. Role: ${role.role}, Ativo: ${role.isActive}, ID: ${role.id}`);
      if (role.permissions) {
        console.log(`      Permissões: ${Object.keys(role.permissions).length} páginas`);
      }
    });

    // 5. Verificar constraint única
    console.log('\\n🔒 Verificando constraint única...');
    
    const duplicateCheck = await prisma.userRoleAssignment.groupBy({
      by: ['userId', 'role'],
      where: {
        userId: superAdmin.id,
        isActive: true
      },
      _count: {
        id: true
      }
    });

    console.log('📊 Verificação de duplicatas ativas:');
    duplicateCheck.forEach((group, index) => {
      console.log(`   ${index + 1}. userId: ${group.userId}, role: ${group.role}, count: ${group._count.id}`);
      if (group._count.id > 1) {
        console.log(`      ⚠️  DUPLICATA DETECTADA!`);
      } else {
        console.log(`      ✅ OK`);
      }
    });

    // 6. Garantir que o super admin tenha permissões completas
    console.log('\\n🔧 Garantindo permissões completas para super admin...');
    
    const activeRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: superAdmin.id,
        isActive: true
      }
    });

    if (activeRole) {
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

      await prisma.userRoleAssignment.update({
        where: { id: activeRole.id },
        data: {
          role: 'SUPER_ADMIN',
          permissions: superAdminPermissions,
          updatedAt: new Date()
        }
      });

      console.log('✅ Permissões do super admin atualizadas com sucesso');
    }

    console.log('\\n✅ Correção concluída com sucesso!');

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

// Executar a correção
fixDuplicateUserRoles(); 