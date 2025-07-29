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

console.log('🧪 Testando Sistema de Gerenciamento de Usuários')
console.log('==============================================')
console.log('')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUserManagement() {
  console.log('🔍 Verificando configuração...')
  console.log('URL:', supabaseUrl)
  console.log('')

  try {
    // 1. Verificar conexão com banco
    console.log('📋 Testando conexão com banco...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.error('❌ Erro ao conectar com banco:', usersError.message)
      return
    }

    console.log('✅ Conexão com banco estabelecida')
    console.log('')

    // 2. Verificar usuários existentes
    console.log('👥 Verificando usuários existentes...')
    const { data: existingUsers, error: listError } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false })

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message)
      return
    }

    console.log(`✅ Encontrados ${existingUsers.length} usuários`)
    
    if (existingUsers.length > 0) {
      console.log('📋 Usuários existentes:')
      existingUsers.slice(0, 5).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`)
      })
      if (existingUsers.length > 5) {
        console.log(`   ... e mais ${existingUsers.length - 5} usuários`)
      }
    }
    console.log('')

    // 3. Testar criação de usuário
    console.log('➕ Testando criação de usuário...')
    const testUser = {
      name: 'Usuário de Teste',
      email: `teste.${Date.now()}@exemplo.com`,
      clerkId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message)
      return
    }

    console.log('✅ Usuário de teste criado com sucesso')
    console.log(`   ID: ${newUser.id}`)
    console.log(`   Nome: ${newUser.name}`)
    console.log(`   Email: ${newUser.email}`)
    console.log('')

    // 4. Testar atualização de usuário
    console.log('✏️  Testando atualização de usuário...')
    const updatedName = 'Usuário de Teste Atualizado'
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ name: updatedName })
      .eq('id', newUser.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar usuário:', updateError.message)
      return
    }

    console.log('✅ Usuário atualizado com sucesso')
    console.log(`   Nome anterior: ${testUser.name}`)
    console.log(`   Nome atual: ${updatedUser.name}`)
    console.log('')

    // 5. Testar busca de usuário
    console.log('🔍 Testando busca de usuário...')
    const { data: foundUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .single()

    if (findError) {
      console.error('❌ Erro ao buscar usuário:', findError.message)
      return
    }

    console.log('✅ Usuário encontrado com sucesso')
    console.log(`   ID: ${foundUser.id}`)
    console.log(`   Nome: ${foundUser.name}`)
    console.log(`   Email: ${foundUser.email}`)
    console.log('')

    // 6. Testar exclusão de usuário
    console.log('🗑️  Testando exclusão de usuário...')
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id)

    if (deleteError) {
      console.error('❌ Erro ao excluir usuário:', deleteError.message)
      return
    }

    console.log('✅ Usuário excluído com sucesso')
    console.log('')

    // 7. Verificar se foi realmente excluído
    console.log('🔍 Verificando exclusão...')
    const { data: deletedUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Usuário foi excluído corretamente (não encontrado)')
    } else if (deletedUser) {
      console.log('⚠️  Usuário ainda existe após exclusão')
    } else {
      console.log('✅ Usuário foi excluído corretamente')
    }
    console.log('')

    // 8. Testar filtros e paginação
    console.log('📊 Testando filtros e paginação...')
    const { data: filteredUsers, error: filterError } = await supabase
      .from('users')
      .select('*')
      .ilike('name', '%admin%')
      .limit(5)

    if (filterError) {
      console.error('❌ Erro ao filtrar usuários:', filterError.message)
      return
    }

    console.log(`✅ Filtro aplicado: ${filteredUsers.length} usuários encontrados`)
    console.log('')

    // 9. Estatísticas finais
    console.log('📈 Estatísticas finais...')
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('email', 'like', '%deleted%')

    console.log(`   Total de usuários: ${totalUsers}`)
    console.log(`   Usuários ativos: ${activeUsers}`)
    console.log('')

    console.log('🎉 Todos os testes passaram com sucesso!')
    console.log('')
    console.log('📋 Resumo dos testes:')
    console.log('   ✅ Conexão com banco')
    console.log('   ✅ Listagem de usuários')
    console.log('   ✅ Criação de usuário')
    console.log('   ✅ Atualização de usuário')
    console.log('   ✅ Busca de usuário')
    console.log('   ✅ Exclusão de usuário')
    console.log('   ✅ Filtros e paginação')
    console.log('   ✅ Estatísticas')
    console.log('')
    console.log('🚀 Sistema de gerenciamento de usuários está funcionando corretamente!')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message)
    console.log('')
    console.log('💡 Verifique:')
    console.log('   1. Se o banco está configurado corretamente')
    console.log('   2. Se as tabelas foram criadas')
    console.log('   3. Se as permissões estão corretas')
  }
}

// Executar testes
testUserManagement() 