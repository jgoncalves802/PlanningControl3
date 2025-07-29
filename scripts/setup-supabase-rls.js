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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupRLS() {
  console.log('🔒 Configurando Row Level Security (RLS)...')

  try {
    // 1. Configurar RLS para a tabela users
    console.log('📋 Configurando RLS para tabela users...')
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Habilitar RLS na tabela users
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Política para permitir acesso total (temporário para desenvolvimento)
        DROP POLICY IF EXISTS "Enable all access" ON users;
        CREATE POLICY "Enable all access" ON users
          FOR ALL USING (true);
      `
    })

    if (rlsError) {
      console.log('ℹ️  RLS já configurado ou erro (normal):', rlsError.message)
    } else {
      console.log('✅ RLS configurado para tabela users')
    }

    // 2. Configurar RLS para outras tabelas
    const tables = ['contracts', 'employees', 'company_functions', 'transfer_requests']
    
    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `
            -- Habilitar RLS na tabela ${table}
            ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
            
            -- Política para permitir acesso total (temporário para desenvolvimento)
            DROP POLICY IF EXISTS "Enable all access" ON ${table};
            CREATE POLICY "Enable all access" ON ${table}
              FOR ALL USING (true);
          `
        })
        
        if (error) {
          console.log(`ℹ️  RLS para ${table} já configurado ou erro`)
        } else {
          console.log(`✅ RLS configurado para tabela ${table}`)
        }
      } catch (err) {
        console.log(`ℹ️  Tabela ${table} não encontrada ou RLS já configurado`)
      }
    }

    console.log('')
    console.log('🎉 Configuração RLS concluída!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Execute: node scripts/setup-supabase-auth.js')
    console.log('   2. Teste o login em: http://localhost:3001/login')

  } catch (error) {
    console.error('❌ Erro durante a configuração RLS:', error.message)
    console.log('')
    console.log('💡 Isso pode ser normal se as tabelas ainda não existem.')
    console.log('📋 Execute: npx prisma db push')
  }
}

// Executar configuração
setupRLS() 