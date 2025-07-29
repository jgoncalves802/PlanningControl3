// Carregar variáveis de ambiente do .env.local
const fs = require('fs')
const path = require('path')

// Ler o arquivo .env.local
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

console.log('🔍 Verificando configuração do Supabase...')
console.log('URL:', supabaseUrl)
console.log('')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSupabase() {
  console.log('🚀 Configurando Supabase...')

  try {
    // 1. Testar conexão básica
    console.log('🔍 Testando conexão...')
    
    // Tentar criar um usuário de teste
    const adminEmail = 'admin@demo-company.com'
    const adminPassword = '123456'

    console.log('👤 Criando usuário admin...')
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Admin Geral',
        role: 'TENANT_ADMIN'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Usuário admin já existe')
      } else {
        console.error('❌ Erro ao criar usuário:', authError.message)
        return
      }
    } else {
      console.log('✅ Usuário admin criado com sucesso')
      console.log('   ID:', authData.user?.id)
    }

    // 2. Testar inserção na tabela users
    console.log('📋 Testando inserção na tabela users...')
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        clerkId: authData?.user?.id || 'temp_admin_id',
        email: adminEmail,
        name: 'Admin Geral'
      })

    if (insertError) {
      if (insertError.message.includes('duplicate key')) {
        console.log('✅ Usuário já existe na tabela users')
      } else {
        console.error('❌ Erro ao inserir na tabela users:', insertError.message)
        console.log('💡 Isso pode ser normal se a tabela não existe ainda')
      }
    } else {
      console.log('✅ Usuário inserido na tabela users')
    }

    console.log('')
    console.log('🎉 Configuração básica concluída!')
    console.log('')
    console.log('📋 Credenciais de acesso:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Senha: ${adminPassword}`)
    console.log('')
    console.log('🔗 Acesse: http://localhost:3001/login')
    console.log('')
    console.log('💡 Se houver problemas, execute:')
    console.log('   npx prisma db push')
    console.log('   npm run dev')

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message)
    console.log('')
    console.log('💡 Tente executar:')
    console.log('   npx prisma db push')
  }
}

// Executar configuração
setupSupabase() 