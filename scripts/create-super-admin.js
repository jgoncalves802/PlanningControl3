// Script para criar super admins no banco e na autenticação do Supabase
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

async function createSuperAdmin() {
  const prisma = new PrismaClient();
  
  // Configurar Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('\n--- Configuração Supabase ---');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Anon Key: ${supabaseAnonKey ? 'Configurada' : 'NÃO CONFIGURADA'}`);
  console.log(`Service Role Key: ${supabaseServiceKey ? 'Configurada' : 'NÃO CONFIGURADA'}`);
  console.log('-----------------------------\n');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  let supabaseAdmin = null;
  
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Cliente Supabase Admin inicializado.');
  } else {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY não configurada. Não será possível criar usuários na autenticação do Supabase.');
  }
  
  try {
    console.log('🚀 Criando Super Admins no banco e Supabase...');
    console.log('==============================================');
    
    // Verificar configuração do Supabase
    const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                                supabaseAnonKey !== 'placeholder-key';
    
    if (!isSupabaseConfigured) {
      console.log('⚠️  Supabase não está configurado. Criando apenas no banco local.');
      console.log('   Configure as variáveis de ambiente:');
      console.log('   - NEXT_PUBLIC_SUPABASE_URL');
      console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    } else {
      console.log('✅ Supabase configurado. Criando usuários em ambos os lugares.');
    }
    
    // 1. Criar Super Admin
    console.log('\n👑 1. Criando Super Administrador...');
    
    let superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@planningcontrol.com' }
    });
    
    let supabaseSuperAdminUser = null;
    let supabaseSuperAdminId = null;
    
    // Sempre tentar criar no Supabase Auth primeiro
    if (supabaseAdmin) {
      console.log('   🌐 Tentando criar no Supabase Auth...');
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: 'superadmin@planningcontrol.com',
          password: '123456',
          email_confirm: true // Confirma o email automaticamente
        });
        
        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log('   ⚠️ Super Admin já existe no Supabase Auth. Tentando buscar...');
            try {
              const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail('superadmin@planningcontrol.com');
              if (!getUserError && existingUser.user) {
                supabaseSuperAdminId = existingUser.user.id;
                console.log(`   ✅ Super Admin encontrado no Supabase Auth com ID: ${supabaseSuperAdminId}`);
              }
            } catch (e) {
              console.error('   ❌ Erro ao buscar Super Admin existente:', e.message);
            }
          } else {
            console.error('   ❌ Erro ao criar Super Admin no Supabase Auth:', authError.message);
            if (authError.status === 401) {
              console.error('   Verifique se SUPABASE_SERVICE_ROLE_KEY está correta e tem permissões de admin.');
            }
          }
        } else if (authData.user) {
          supabaseSuperAdminUser = authData.user;
          supabaseSuperAdminId = authData.user.id;
          console.log(`   ✅ Super Admin criado no Supabase Auth com ID: ${supabaseSuperAdminId}`);
        } else {
          console.log('   ⚠️ Supabase Auth retornou sem erro, mas sem usuário.');
        }
      } catch (e) {
        console.error('   ❌ Exceção ao chamar Supabase Auth para Super Admin:', e.message);
      }
    } else {
      console.log('   ⚠️ Supabase Admin não configurado, pulando criação no Supabase Auth.');
    }
    
    if (!superAdmin) {
      console.log('\n--- Criando Super Administrador no banco local ---');
      // Criar no banco local
      console.log('   📝 Criando no banco local...');
      superAdmin = await prisma.user.create({
        data: {
          name: 'Super Administrador',
          email: 'superadmin@planningcontrol.com',
          clerkId: supabaseSuperAdminId // Usar ID do Supabase se disponível
        }
      });
      console.log(`   ✅ Super Admin criado no banco local com ID: ${superAdmin.id}`);
    } else {
      console.log(`✅ Super Administrador já existe no banco local (ID: ${superAdmin.id}).`);
      // Atualizar clerkId se não tiver e tivermos o ID do Supabase
      if (!superAdmin.clerkId && supabaseSuperAdminId) {
        console.log('   🔄 Atualizando Clerk ID do Super Admin...');
        await prisma.user.update({
          where: { id: superAdmin.id },
          data: { clerkId: supabaseSuperAdminId }
        });
        console.log(`   ✅ Super Admin vinculado ao Supabase Auth (ID: ${supabaseSuperAdminId}).`);
      }
    }
    
    // 2. Criar Admin Regular
    console.log('\n👨‍💼 2. Criando Administrador Regular...');
    
    let regularAdmin = await prisma.user.findFirst({
      where: { email: 'admin@planningcontrol.com' }
    });
    
    let supabaseRegularAdminUser = null;
    let supabaseRegularAdminId = null;
    
    // Sempre tentar criar no Supabase Auth primeiro
    if (supabaseAdmin) {
      console.log('   🌐 Tentando criar no Supabase Auth...');
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: 'admin@planningcontrol.com',
          password: '123456',
          email_confirm: true
        });
        
        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log('   ⚠️ Admin Regular já existe no Supabase Auth. Tentando buscar...');
            try {
              const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail('admin@planningcontrol.com');
              if (!getUserError && existingUser.user) {
                supabaseRegularAdminId = existingUser.user.id;
                console.log(`   ✅ Admin Regular encontrado no Supabase Auth com ID: ${supabaseRegularAdminId}`);
              }
            } catch (e) {
              console.error('   ❌ Erro ao buscar Admin Regular existente:', e.message);
            }
          } else {
            console.error('   ❌ Erro ao criar Admin Regular no Supabase Auth:', authError.message);
            if (authError.status === 401) {
              console.error('   Verifique se SUPABASE_SERVICE_ROLE_KEY está correta e tem permissões de admin.');
            }
          }
        } else if (authData.user) {
          supabaseRegularAdminUser = authData.user;
          supabaseRegularAdminId = authData.user.id;
          console.log(`   ✅ Admin Regular criado no Supabase Auth com ID: ${supabaseRegularAdminId}`);
        } else {
          console.log('   ⚠️ Supabase Auth retornou sem erro, mas sem usuário.');
        }
      } catch (e) {
        console.error('   ❌ Exceção ao chamar Supabase Auth para Admin Regular:', e.message);
      }
    } else {
      console.log('   ⚠️ Supabase Admin não configurado, pulando criação no Supabase Auth.');
    }
    
    if (!regularAdmin) {
      console.log('\n--- Criando Administrador Regular no banco local ---');
      // Criar no banco local
      console.log('   📝 Criando no banco local...');
      regularAdmin = await prisma.user.create({
        data: {
          name: 'Administrador Regular',
          email: 'admin@planningcontrol.com',
          clerkId: supabaseRegularAdminId // Usar ID do Supabase se disponível
        }
      });
      console.log(`   ✅ Admin Regular criado no banco local com ID: ${regularAdmin.id}`);
    } else {
      console.log(`✅ Administrador Regular já existe no banco local (ID: ${regularAdmin.id}).`);
      // Atualizar clerkId se não tiver e tivermos o ID do Supabase
      if (!regularAdmin.clerkId && supabaseRegularAdminId) {
        console.log('   🔄 Atualizando Clerk ID do Admin Regular...');
        await prisma.user.update({
          where: { id: regularAdmin.id },
          data: { clerkId: supabaseRegularAdminId }
        });
        console.log(`   ✅ Admin Regular vinculado ao Supabase Auth (ID: ${supabaseRegularAdminId}).`);
      }
    }
    
    // 3. Listar todos os usuários
    console.log('\n📊 3. Listando todos os usuários...');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isActive: true,
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
      console.log(`      Status: ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`);
    });
    
    // 4. Instruções finais
    console.log('\n🎯 4. Instruções para uso:');
    console.log('   1. Acesse: http://localhost:3000/login');
    console.log('   2. Use uma das credenciais:');
    console.log('      - Super Admin: superadmin@planningcontrol.com / 123456');
    console.log('      - Admin Regular: admin@planningcontrol.com / 123456');
    console.log('   3. Após o login, você terá acesso completo ao sistema');
    
    if (!isSupabaseConfigured) {
      console.log('\n⚠️  Nota: Para habilitar autenticação completa do Supabase, configure:');
      console.log('   - NEXT_PUBLIC_SUPABASE_URL');
      console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    }
    
  } catch (error) {
    console.error('\n❌ Erro geral no script:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

createSuperAdmin(); 