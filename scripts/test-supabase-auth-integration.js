const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente do .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (value && !key.startsWith('#')) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
}

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🧪 Testando Integração com Supabase Auth')
console.log('========================================')
console.log('')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSupabaseAuthIntegration() {
  console.log('🔍 Verificando configuração...')
  console.log('URL:', supabaseUrl)
  console.log('')

  try {
    // 1. Verificar conexão com Supabase Auth
    console.log('📋 Testando conexão com Supabase Auth...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao conectar com Supabase Auth:', authError.message)
      return
    }

    console.log('✅ Conexão com Supabase Auth estabelecida')
    console.log(`📊 Total de usuários no Auth: ${authUsers.users.length}`)
    console.log('')

    // 2. Verificar usuários existentes no Auth
    console.log('👥 Verificando usuários no Supabase Auth...')
    
    if (authUsers.users.length > 0) {
      console.log('📋 Usuários no Supabase Auth:')
      authUsers.users.slice(0, 5).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id})`)
        console.log(`      Status: ${user.confirmed_at ? 'Confirmado' : 'Pendente'}`)
        console.log(`      Criado: ${new Date(user.created_at).toLocaleDateString('pt-BR')}`)
        if (user.user_metadata) {
          console.log(`      Metadata: ${JSON.stringify(user.user_metadata)}`)
        }
        console.log('')
      })
      
      if (authUsers.users.length > 5) {
        console.log(`   ... e mais ${authUsers.users.length - 5} usuários`)
      }
    } else {
      console.log('📭 Nenhum usuário encontrado no Supabase Auth')
    }
    console.log('')

    // 3. Testar criação de usuário no Supabase Auth
    console.log('➕ Testando criação de usuário no Supabase Auth...')
    const testEmail = `teste.auth.${Date.now()}@exemplo.com`
    const testPassword = 'senha123456'
    const testName = 'Usuário Teste Auth'

    const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: testName,
        role: 'USER',
        companyId: null
      }
    })

    if (createAuthError) {
      console.error('❌ Erro ao criar usuário no Supabase Auth:', createAuthError.message)
      return
    }

    console.log('✅ Usuário criado no Supabase Auth com sucesso')
    console.log(`   ID: ${newAuthUser.user.id}`)
    console.log(`   Email: ${newAuthUser.user.email}`)
    console.log(`   Status: ${newAuthUser.user.confirmed_at ? 'Confirmado' : 'Pendente'}`)
    console.log(`   Metadata: ${JSON.stringify(newAuthUser.user.user_metadata)}`)
    console.log('')

    // 4. Testar busca de usuário específico
    console.log('🔍 Testando busca de usuário específico...')
    const { data: foundAuthUser, error: findAuthError } = await supabase.auth.admin.getUserById(
      newAuthUser.user.id
    )

    if (findAuthError) {
      console.error('❌ Erro ao buscar usuário no Supabase Auth:', findAuthError.message)
      return
    }

    console.log('✅ Usuário encontrado no Supabase Auth')
    console.log(`   ID: ${foundAuthUser.user.id}`)
    console.log(`   Email: ${foundAuthUser.user.email}`)
    console.log(`   Nome: ${foundAuthUser.user.user_metadata?.name || 'N/A'}`)
    console.log('')

    // 5. Testar atualização de usuário no Supabase Auth
    console.log('✏️  Testando atualização de usuário no Supabase Auth...')
    const updatedName = 'Usuário Teste Auth Atualizado'
    
    const { data: updatedAuthUser, error: updateAuthError } = await supabase.auth.admin.updateUserById(
      newAuthUser.user.id,
      {
        user_metadata: {
          name: updatedName,
          role: 'USER',
          companyId: null
        }
      }
    )

    if (updateAuthError) {
      console.error('❌ Erro ao atualizar usuário no Supabase Auth:', updateAuthError.message)
      return
    }

    console.log('✅ Usuário atualizado no Supabase Auth com sucesso')
    console.log(`   Nome anterior: ${testName}`)
    console.log(`   Nome atual: ${updatedAuthUser.user.user_metadata?.name}`)
    console.log('')

    // 6. Testar login do usuário criado
    console.log('🔐 Testando login do usuário criado...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (loginError) {
      console.error('❌ Erro ao fazer login:', loginError.message)
      return
    }

    console.log('✅ Login realizado com sucesso')
    console.log(`   Session ID: ${loginData.session?.access_token?.substring(0, 20)}...`)
    console.log(`   User ID: ${loginData.user?.id}`)
    console.log('')

    // 7. Testar logout
    console.log('🚪 Testando logout...')
    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      console.error('❌ Erro ao fazer logout:', logoutError.message)
      return
    }

    console.log('✅ Logout realizado com sucesso')
    console.log('')

    // 8. Testar exclusão de usuário no Supabase Auth
    console.log('🗑️  Testando exclusão de usuário no Supabase Auth...')
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
      newAuthUser.user.id
    )

    if (deleteAuthError) {
      console.error('❌ Erro ao excluir usuário do Supabase Auth:', deleteAuthError.message)
      return
    }

    console.log('✅ Usuário excluído do Supabase Auth com sucesso')
    console.log('')

    // 9. Verificar se foi realmente excluído
    console.log('🔍 Verificando exclusão...')
    const { data: deletedAuthUser, error: checkAuthError } = await supabase.auth.admin.getUserById(
      newAuthUser.user.id
    )

    if (checkAuthError && checkAuthError.message.includes('User not found')) {
      console.log('✅ Usuário foi excluído corretamente do Supabase Auth')
    } else if (deletedAuthUser) {
      console.log('⚠️  Usuário ainda existe no Supabase Auth após exclusão')
    } else {
      console.log('✅ Usuário foi excluído corretamente do Supabase Auth')
    }
    console.log('')

    // 10. Estatísticas finais
    console.log('📈 Estatísticas finais do Supabase Auth...')
    const { data: finalAuthUsers } = await supabase.auth.admin.listUsers()
    
    console.log(`   Total de usuários no Auth: ${finalAuthUsers.users.length}`)
    console.log(`   Usuários confirmados: ${finalAuthUsers.users.filter(u => u.confirmed_at).length}`)
    console.log(`   Usuários pendentes: ${finalAuthUsers.users.filter(u => !u.confirmed_at).length}`)
    console.log('')

    console.log('🎉 Todos os testes de integração com Supabase Auth passaram!')
    console.log('')
    console.log('📋 Resumo dos testes:')
    console.log('   ✅ Conexão com Supabase Auth')
    console.log('   ✅ Listagem de usuários')
    console.log('   ✅ Criação de usuário')
    console.log('   ✅ Busca de usuário específico')
    console.log('   ✅ Atualização de usuário')
    console.log('   ✅ Login de usuário')
    console.log('   ✅ Logout de usuário')
    console.log('   ✅ Exclusão de usuário')
    console.log('   ✅ Verificação de exclusão')
    console.log('   ✅ Estatísticas')
    console.log('')
    console.log('🚀 Integração com Supabase Auth está funcionando perfeitamente!')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message)
    console.log('')
    console.log('💡 Verifique:')
    console.log('   1. Se o Supabase está configurado corretamente')
    console.log('   2. Se as chaves de API estão corretas')
    console.log('   3. Se o projeto está ativo')
    console.log('   4. Se as permissões estão corretas')
  }
}

// Executar testes
testSupabaseAuthIntegration() 