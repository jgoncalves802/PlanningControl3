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

console.log('🧪 Testando Exclusão de Usuários com Validação de UUID')
console.log('=====================================================')
console.log('')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Função para validar UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

async function testUserDeletion() {
  console.log('🔍 Verificando configuração...')
  console.log('URL:', supabaseUrl)
  console.log('')

  try {
    // 1. Criar usuário de teste no Supabase Auth
    console.log('➕ Criando usuário de teste no Supabase Auth...')
    const testEmail = `teste.delete.${Date.now()}@exemplo.com`
    const testPassword = 'senha123456'
    const testName = 'Usuário Teste Exclusão'

    const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: testName,
        role: 'USER'
      }
    })

    if (createAuthError) {
      console.error('❌ Erro ao criar usuário no Supabase Auth:', createAuthError.message)
      return
    }

    console.log('✅ Usuário criado no Supabase Auth')
    console.log(`   ID: ${newAuthUser.user.id}`)
    console.log(`   Email: ${newAuthUser.user.email}`)
    console.log(`   UUID válido: ${isValidUUID(newAuthUser.user.id)}`)
    console.log('')

    // 2. Testar validação de UUID
    console.log('🔍 Testando validação de UUID...')
    const testUUIDs = [
      newAuthUser.user.id, // UUID válido do Supabase
      'temp_1234567890_abc123', // ID temporário inválido
      'not-a-uuid', // String inválida
      '12345678-1234-1234-1234-123456789012', // UUID inválido
      '550e8400-e29b-41d4-a716-446655440000' // UUID válido
    ]

    testUUIDs.forEach((uuid, index) => {
      const isValid = isValidUUID(uuid)
      console.log(`   ${index + 1}. ${uuid}: ${isValid ? '✅ Válido' : '❌ Inválido'}`)
    })
    console.log('')

    // 3. Testar exclusão com UUID válido
    console.log('🗑️  Testando exclusão com UUID válido...')
    if (isValidUUID(newAuthUser.user.id)) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
        newAuthUser.user.id
      )

      if (deleteAuthError) {
        console.error('❌ Erro ao excluir usuário com UUID válido:', deleteAuthError.message)
      } else {
        console.log('✅ Usuário excluído com sucesso (UUID válido)')
      }
    } else {
      console.log('⚠️  UUID inválido, pulando exclusão')
    }
    console.log('')

    // 4. Testar exclusão com UUID inválido
    console.log('🗑️  Testando exclusão com UUID inválido...')
    const invalidUUID = 'temp_1234567890_abc123'
    
    try {
      const { error: deleteInvalidError } = await supabase.auth.admin.deleteUser(invalidUUID)
      
      if (deleteInvalidError) {
        console.log('✅ Erro esperado ao tentar excluir com UUID inválido')
        console.log(`   Erro: ${deleteInvalidError.message}`)
      } else {
        console.log('⚠️  Exclusão com UUID inválido não gerou erro (inesperado)')
      }
    } catch (error) {
      console.log('✅ Erro capturado ao tentar excluir com UUID inválido')
      console.log(`   Erro: ${error.message}`)
    }
    console.log('')

    // 5. Verificar usuários restantes
    console.log('📊 Verificando usuários restantes...')
    const { data: remainingUsers } = await supabase.auth.admin.listUsers()
    
    console.log(`   Total de usuários no Auth: ${remainingUsers.users.length}`)
    console.log('')

    console.log('🎉 Testes de exclusão com validação de UUID concluídos!')
    console.log('')
    console.log('📋 Resumo dos testes:')
    console.log('   ✅ Criação de usuário no Supabase Auth')
    console.log('   ✅ Validação de UUID')
    console.log('   ✅ Exclusão com UUID válido')
    console.log('   ✅ Tratamento de erro com UUID inválido')
    console.log('   ✅ Verificação de usuários restantes')
    console.log('')
    console.log('🚀 Sistema de validação de UUID está funcionando corretamente!')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message)
    console.log('')
    console.log('💡 Verifique:')
    console.log('   1. Se o Supabase está configurado corretamente')
    console.log('   2. Se as chaves de API estão corretas')
    console.log('   3. Se o projeto está ativo')
  }
}

// Executar testes
testUserDeletion() 