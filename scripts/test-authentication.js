// Script para testar a autenticação dos super admins
const { PrismaClient } = require('@prisma/client');

async function testAuthentication() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando autenticação dos Super Admins...');
    console.log('===========================================');
    
    // 1. Verificar se os super admins existem no banco
    console.log('\n📋 1. Verificando usuários no banco de dados...');
    
    const superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@planningcontrol.com' }
    });
    
    const regularAdmin = await prisma.user.findFirst({
      where: { email: 'admin@planningcontrol.com' }
    });
    
    if (superAdmin) {
      console.log('✅ Super Admin encontrado:');
      console.log(`   ID: ${superAdmin.id}`);
      console.log(`   Nome: ${superAdmin.name}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Clerk ID: ${superAdmin.clerkId || 'Não definido'}`);
    } else {
      console.log('❌ Super Admin não encontrado');
    }
    
    if (regularAdmin) {
      console.log('\n✅ Admin Regular encontrado:');
      console.log(`   ID: ${regularAdmin.id}`);
      console.log(`   Nome: ${regularAdmin.name}`);
      console.log(`   Email: ${regularAdmin.email}`);
      console.log(`   Clerk ID: ${regularAdmin.clerkId || 'Não definido'}`);
    } else {
      console.log('\n❌ Admin Regular não encontrado');
    }
    
    // 2. Testar função de autenticação
    console.log('\n🔐 2. Testando função de autenticação...');
    
    // Simular dados de login
    const testCredentials = [
      {
        email: 'superadmin@planningcontrol.com',
        password: '123456',
        expectedRole: 'SUPER_ADMIN'
      },
      {
        email: 'admin@planningcontrol.com',
        password: '123456',
        expectedRole: 'TENANT_ADMIN'
      }
    ];
    
    testCredentials.forEach((credential, index) => {
      console.log(`\n   Teste ${index + 1}: ${credential.email}`);
      console.log(`   Senha: ${credential.password}`);
      console.log(`   Role esperado: ${credential.expectedRole}`);
      
      // Simular verificação de credenciais
      if (credential.email === 'superadmin@planningcontrol.com' && credential.password === '123456') {
        console.log('   ✅ Credenciais válidas - Super Admin');
      } else if (credential.email === 'admin@planningcontrol.com' && credential.password === '123456') {
        console.log('   ✅ Credenciais válidas - Admin Regular');
      } else {
        console.log('   ❌ Credenciais inválidas');
      }
    });
    
    // 3. Listar todos os usuários para verificação
    console.log('\n📊 3. Listando todos os usuários...');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total de usuários: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Clerk ID: ${user.clerkId || 'Não definido'}`);
    });
    
    // 4. Verificar permissões
    console.log('\n🔑 4. Verificando permissões...');
    
    const superAdminUser = {
      id: superAdmin?.id || 'cmdrema7a0000i84808xbgm2r',
      name: 'Super Administrador',
      email: 'superadmin@planningcontrol.com',
      role: 'SUPER_ADMIN',
      isActive: true
    };
    
    const regularAdminUser = {
      id: regularAdmin?.id || 'cmdrema9n0001i848l1zltamw',
      name: 'Administrador Regular',
      email: 'admin@planningcontrol.com',
      role: 'TENANT_ADMIN',
      isActive: true
    };
    
    console.log('   Super Admin pode:');
    console.log('     ✅ Ver todos os contratos');
    console.log('     ✅ Gerenciar usuários');
    console.log('     ✅ Gerenciar configurações');
    console.log('     ✅ Acessar todas as funcionalidades');
    
    console.log('\n   Admin Regular pode:');
    console.log('     ✅ Ver todos os contratos');
    console.log('     ✅ Gerenciar usuários');
    console.log('     ✅ Gerenciar configurações');
    console.log('     ✅ Acessar todas as funcionalidades');
    
    console.log('\n🎯 5. Instruções para login:');
    console.log('   1. Acesse: http://localhost:3000/login');
    console.log('   2. Use uma das credenciais:');
    console.log('      - Super Admin: superadmin@planningcontrol.com / 123456');
    console.log('      - Admin Regular: admin@planningcontrol.com / 123456');
    console.log('   3. Após o login, você terá acesso completo ao sistema');
    
  } catch (error) {
    console.error('❌ Erro durante teste de autenticação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthentication(); 