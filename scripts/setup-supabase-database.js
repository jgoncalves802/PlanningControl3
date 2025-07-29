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

// Verificar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificando configuração do Supabase...')
console.log('')

if (!supabaseUrl || supabaseUrl === 'https://seu-projeto.supabase.co') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurado corretamente!')
  console.log('📝 Configure no arquivo .env.local:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co')
  process.exit(1)
}

if (!supabaseAnonKey || supabaseAnonKey === 'sua_chave_anonima_aqui') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado corretamente!')
  console.log('📝 Configure no arquivo .env.local:')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_real')
  process.exit(1)
}

console.log('✅ Variáveis de ambiente configuradas!')
console.log('URL:', supabaseUrl)
console.log('')

// Usar chave anon para testes de conexão
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados do Supabase...')

  try {
    // 1. Verificar conexão
    console.log('🔍 Testando conexão...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('⚠️  Tabela users não encontrada.')
      console.log('💡 Execute primeiro: npx prisma db push')
      console.log('')
      console.log('📋 Para configurar o banco:')
      console.log('   1. npx prisma db push')
      console.log('   2. node scripts/setup-supabase-database.js')
      console.log('   3. node scripts/setup-supabase-auth.js')
      return
    }

    if (error) {
      console.error('❌ Erro ao conectar:', error.message)
      console.log('')
      console.log('💡 Isso pode ser normal se as tabelas ainda não foram criadas.')
      console.log('📋 Execute: npx prisma db push')
      return
    }

    console.log('✅ Conexão estabelecida com sucesso!')

    // 2. Verificar tabelas existentes
    console.log('📋 Verificando estrutura do banco...')
    const tables = ['users', 'contracts', 'employees', 'company_functions']
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          console.log(`⚠️  Tabela ${table} não encontrada`)
        } else {
          console.log(`✅ Tabela ${table} encontrada`)
        }
      } catch (err) {
        console.log(`⚠️  Tabela ${table} não encontrada`)
      }
    }

    console.log('')
    console.log('🎉 Verificação do banco concluída!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Execute: node scripts/setup-supabase-auth.js')
    console.log('   2. Teste o login em: http://localhost:3001/login')
    console.log('   3. Acesse o dashboard em: http://localhost:3001/dashboard')

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message)
  }
}

// Executar configuração
setupDatabase() 