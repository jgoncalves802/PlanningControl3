// Script para testar a vinculação automática de novos usuários
const { PrismaClient } = require('@prisma/client');

async function testAutoLink() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Testando Vinculação Automática de Usuários ---');
  console.log('==================================================\n');
  
  try {
    // Teste 1: Criar um novo usuário via API
    console.log('🧪 Teste 1: Criando novo usuário via API...');
    
    const testUserData = {
      name: 'Usuário Teste Automático',
      email: `teste.auto.${Date.now()}@planningcontrol.com`,
      password: '123456'
    };
    
    console.log(`   Dados do usuário:`, testUserData);
    
    const response = await fetch('http://localhost:3000/api/settings/super-admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`   ❌ Erro na API: ${errorData.error}`);
      return;
    }
    
    const result = await response.json();
    console.log(`   ✅ Usuário criado com sucesso!`);
    console.log(`   ID: ${result.user.id}`);
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Clerk ID: ${result.user.clerkId || 'Não definido'}`);
    console.log(`   Vinculado ao Supabase: ${result.supabaseLinked ? '✅ Sim' : '❌ Não'}`);
    
    // Teste 2: Verificar se o usuário foi criado no banco
    console.log('\n🧪 Teste 2: Verificando usuário no banco de dados...');
    
    const dbUser = await prisma.user.findUnique({
      where: { email: testUserData.email }
    });
    
    if (dbUser) {
      console.log(`   ✅ Usuário encontrado no banco:`);
      console.log(`   ID: ${dbUser.id}`);
      console.log(`   Nome: ${dbUser.name}`);
      console.log(`   Email: ${dbUser.email}`);
      console.log(`   Clerk ID: ${dbUser.clerkId || 'Não definido'}`);
      console.log(`   Status: ${dbUser.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    } else {
      console.log(`   ❌ Usuário não encontrado no banco`);
    }
    
    // Teste 3: Verificar se o usuário foi criado no Supabase Auth
    console.log('\n🧪 Teste 3: Verificando usuário no Supabase Auth...');
    
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.log(`   ❌ Erro ao listar usuários no Supabase Auth: ${listError.message}`);
      } else {
        const authUser = authUsers.users.find(user => user.email === testUserData.email);
        
        if (authUser) {
          console.log(`   ✅ Usuário encontrado no Supabase Auth:`);
          console.log(`   ID: ${authUser.id}`);
          console.log(`   Email: ${authUser.email}`);
          console.log(`   Email confirmado: ${authUser.email_confirmed_at ? '✅ Sim' : '❌ Não'}`);
          console.log(`   Status: ${authUser.status}`);
        } else {
          console.log(`   ❌ Usuário não encontrado no Supabase Auth`);
        }
      }
    } else {
      console.log(`   ⚠️ Configurações do Supabase não encontradas`);
    }
    
    // Teste 4: Verificar se o Clerk ID está correto
    console.log('\n🧪 Teste 4: Verificando vinculação...');
    
    if (dbUser && dbUser.clerkId) {
      console.log(`   ✅ Usuário vinculado ao Supabase Auth!`);
      console.log(`   Clerk ID no banco: ${dbUser.clerkId}`);
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = authUsers.users.find(user => user.id === dbUser.clerkId);
        
        if (authUser) {
          console.log(`   ✅ Clerk ID válido - usuário encontrado no Supabase Auth`);
          console.log(`   Email no Supabase: ${authUser.email}`);
        } else {
          console.log(`   ❌ Clerk ID inválido - usuário não encontrado no Supabase Auth`);
        }
      }
    } else {
      console.log(`   ❌ Usuário não vinculado ao Supabase Auth`);
    }
    
    // Limpeza: Remover usuário de teste
    console.log('\n🧹 Limpeza: Removendo usuário de teste...');
    
    if (dbUser) {
      await prisma.user.delete({
        where: { id: dbUser.id }
      });
      console.log(`   ✅ Usuário de teste removido do banco`);
    }
    
    console.log('\n🎉 Teste de vinculação automática concluído!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

testAutoLink(); 