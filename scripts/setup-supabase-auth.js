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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.log('📝 Configure o arquivo .env.local com:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSupabaseAuth() {
  console.log('🚀 Configurando Supabase Auth...')

  try {
    // 1. Verificar se a tabela users existe
    console.log('📋 Verificando tabela users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.error('❌ Erro ao verificar tabela users:', usersError.message)
      console.log('💡 Execute as migrações do Prisma primeiro:')
      console.log('   npx prisma db push')
      return
    }

    console.log('✅ Tabela users encontrada')

    // 2. Criar usuário admin padrão
    console.log('👤 Criando usuário admin padrão...')
    
    const adminEmail = 'admin@demo-company.com'
    const adminPassword = '123456'

    // Criar usuário no Supabase Auth
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
        console.log('ℹ️  Usuário admin já existe')
      } else {
        console.error('❌ Erro ao criar usuário admin:', authError.message)
        return
      }
    } else {
      console.log('✅ Usuário admin criado com sucesso')
    }

    // 3. Verificar se o usuário existe na tabela users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar usuário:', checkError.message)
      return
    }

    if (!existingUser) {
      // Criar registro na tabela users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          clerkId: authData?.user?.id || 'temp_admin_id',
          email: adminEmail,
          name: 'Admin Geral'
        })

      if (insertError) {
        console.error('❌ Erro ao inserir usuário na tabela:', insertError.message)
        return
      }

      console.log('✅ Registro do usuário criado na tabela users')
    } else {
      console.log('ℹ️  Usuário já existe na tabela users')
    }

    console.log('🎉 Configuração do Supabase Auth concluída!')
    console.log('')
    console.log('📋 Credenciais de acesso:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Senha: ${adminPassword}`)
    console.log('')
    console.log('🔗 Acesse: http://localhost:3001/login')

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message)
  }
}

// Executar configuração
setupSupabaseAuth() 