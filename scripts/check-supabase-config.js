// Script para verificar configuração do Supabase
const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseConfig() {
  console.log('🔍 Verificando configuração do Supabase...');
  console.log('==========================================');
  
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('\n📋 1. Variáveis de Ambiente:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurado' : '❌ Não configurado'}`);
  
  // Verificar se está usando valores placeholder
  const isPlaceholderUrl = supabaseUrl === 'https://placeholder.supabase.co' || !supabaseUrl;
  const isPlaceholderKey = supabaseAnonKey === 'placeholder-key' || !supabaseAnonKey;
  
  if (isPlaceholderUrl || isPlaceholderKey) {
    console.log('\n⚠️  Supabase não está configurado corretamente.');
    console.log('   Para configurar o Supabase:');
    console.log('   1. Crie um projeto no Supabase (https://supabase.com)');
    console.log('   2. Obtenha as credenciais do projeto');
    console.log('   3. Configure as variáveis de ambiente:');
    console.log('      - NEXT_PUBLIC_SUPABASE_URL');
    console.log('      - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('      - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   4. Execute: node scripts/create-super-admin.js');
    return;
  }
  
  console.log('\n✅ Supabase configurado. Testando conexão...');
  
  try {
    // Testar conexão com cliente anônimo
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('\n🔗 2. Testando conexão anônima...');
    const { data: healthData, error: healthError } = await supabase.from('users').select('count').limit(1);
    
    if (healthError) {
      console.log(`   ⚠️  Erro na conexão: ${healthError.message}`);
    } else {
      console.log('   ✅ Conexão anônima funcionando');
    }
    
    // Testar conexão com service role (se disponível)
    if (supabaseServiceKey) {
      console.log('\n🔐 3. Testando conexão com service role...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      try {
        const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (usersError) {
          console.log(`   ⚠️  Erro ao listar usuários: ${usersError.message}`);
        } else {
          console.log(`   ✅ Service role funcionando`);
          console.log(`   📊 Usuários na autenticação: ${users.users.length}`);
          
          // Listar usuários existentes
          users.users.forEach((user, index) => {
            console.log(`      ${index + 1}. ${user.email} (${user.id})`);
            console.log(`         Email confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
            console.log(`         Criado em: ${user.created_at}`);
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Erro ao testar service role: ${error.message}`);
      }
    } else {
      console.log('\n⚠️  Service role não configurado.');
      console.log('   Para criar usuários via script, configure SUPABASE_SERVICE_ROLE_KEY');
    }
    
    console.log('\n🎯 4. Próximos passos:');
    console.log('   1. Execute: node scripts/create-super-admin.js');
    console.log('   2. Teste o login: http://localhost:3000/login');
    console.log('   3. Use as credenciais:');
    console.log('      - superadmin@planningcontrol.com / 123456');
    console.log('      - admin@planningcontrol.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro ao testar Supabase:', error);
  }
}

checkSupabaseConfig(); 