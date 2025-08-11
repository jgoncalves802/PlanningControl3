// Script para vincular o super admin ao sistema de autenticação do Supabase
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

async function linkSuperAdmin() {
  const prisma = new PrismaClient();
  
  // Configurar Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('\n--- Vinculando Super Admin ao Supabase Auth ---');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Service Role Key: ${supabaseServiceKey ? 'Configurada' : 'NÃO CONFIGURADA'}`);
  console.log('-----------------------------------------------\n');
  
  if (!supabaseServiceKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY não configurada. Não é possível vincular ao Supabase Auth.');
    return;
  }
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log('🔍 Verificando usuário super admin no banco de dados...');
    
    // Buscar o super admin no banco de dados
    const superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@planningcontrol.com' }
    });
    
    if (!superAdmin) {
      console.log('❌ Super Admin não encontrado no banco de dados.');
      return;
    }
    
    console.log(`✅ Super Admin encontrado no banco:`);
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Nome: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Clerk ID atual: ${superAdmin.clerkId || 'Não definido'}`);
    
    console.log('\n🔍 Verificando usuário no Supabase Auth...');
    
    // Verificar se o usuário existe no Supabase Auth usando a API REST
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Erro ao listar usuários no Supabase Auth:', listError.message);
      return;
    }
    
    // Procurar o usuário super admin na lista
    const authUser = authUsers.users.find(user => user.email === 'superadmin@planningcontrol.com');
    
    if (!authUser) {
      console.log('❌ Usuário não encontrado no Supabase Auth. Criando...');
      
      // Tentar criar o usuário no Supabase Auth
      console.log('\n🔄 Tentando criar usuário no Supabase Auth...');
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: 'superadmin@planningcontrol.com',
        password: '123456',
        email_confirm: true
      });
      
      if (createError) {
        console.log('❌ Erro ao criar usuário no Supabase Auth:', createError.message);
        return;
      }
      
      if (createData.user) {
        console.log(`✅ Usuário criado no Supabase Auth com ID: ${createData.user.id}`);
        
        // Atualizar o banco de dados com o novo clerkId
        await prisma.user.update({
          where: { id: superAdmin.id },
          data: { clerkId: createData.user.id }
        });
        
        console.log(`✅ Super Admin vinculado ao Supabase Auth!`);
        console.log(`   Clerk ID atualizado: ${createData.user.id}`);
      }
    } else {
      console.log(`✅ Usuário encontrado no Supabase Auth:`);
      console.log(`   ID: ${authUser.id}`);
      console.log(`   Email: ${authUser.email}`);
      console.log(`   Email confirmado: ${authUser.email_confirmed_at ? 'Sim' : 'Não'}`);
      
      // Verificar se o clerkId está correto no banco
      if (superAdmin.clerkId === authUser.id) {
        console.log('✅ Super Admin já está corretamente vinculado ao Supabase Auth!');
      } else {
        console.log('🔄 Atualizando Clerk ID no banco de dados...');
        
        // Atualizar o banco de dados com o clerkId correto
        await prisma.user.update({
          where: { id: superAdmin.id },
          data: { clerkId: authUser.id }
        });
        
        console.log(`✅ Super Admin vinculado ao Supabase Auth!`);
        console.log(`   Clerk ID atualizado: ${authUser.id}`);
      }
    }
    
    // Verificar o resultado final
    const updatedSuperAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@planningcontrol.com' }
    });
    
    console.log('\n📊 Status final do Super Admin:');
    console.log(`   ID: ${updatedSuperAdmin.id}`);
    console.log(`   Nome: ${updatedSuperAdmin.name}`);
    console.log(`   Email: ${updatedSuperAdmin.email}`);
    console.log(`   Clerk ID: ${updatedSuperAdmin.clerkId || 'Não definido'}`);
    console.log(`   Status: ${updatedSuperAdmin.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    
    if (updatedSuperAdmin.clerkId) {
      console.log('\n🎉 Super Admin vinculado com sucesso ao sistema de autenticação!');
      console.log('   Credenciais de acesso:');
      console.log('   - Email: superadmin@planningcontrol.com');
      console.log('   - Senha: 123456');
    } else {
      console.log('\n⚠️ Super Admin não foi vinculado ao sistema de autenticação.');
    }
    
  } catch (error) {
    console.error('\n❌ Erro geral no script:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

linkSuperAdmin(); 