const fs = require('fs')
const path = require('path')

console.log('🚀 Configuração Interativa do Supabase')
console.log('=====================================')
console.log('')

console.log('📋 Para obter as credenciais do Supabase:')
console.log('1. Acesse: https://supabase.com/dashboard')
console.log('2. Selecione seu projeto')
console.log('3. Vá em Settings → API')
console.log('4. Copie as seguintes informações:')
console.log('   - Project URL')
console.log('   - anon public (chave pública)')
console.log('   - service_role (chave privada)')
console.log('')

console.log('🔗 Exemplo de onde encontrar:')
console.log('   Project URL: https://abcdefghijklmnop.supabase.co')
console.log('   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
console.log('   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
console.log('')

console.log('⚠️  IMPORTANTE:')
console.log('   - A service_role é privada, mantenha segura!')
console.log('   - A anon public é segura para usar no frontend')
console.log('')

// Verificar se o arquivo .env.local existe
const envPath = path.join(__dirname, '..', '.env.local')
const envExists = fs.existsSync(envPath)

if (envExists) {
  console.log('📁 Arquivo .env.local encontrado!')
  console.log('')
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  // Verificar se já tem valores reais
  const hasRealValues = !envContent.includes('seu-projeto.supabase.co') && 
                       !envContent.includes('sua_chave_anonima_aqui') &&
                       !envContent.includes('sua_chave_service_role_aqui')
  
  if (hasRealValues) {
    console.log('✅ Parece que o .env.local já está configurado com valores reais!')
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('   1. Execute: node scripts/setup-supabase-database.js')
    console.log('   2. Execute: node scripts/setup-supabase-auth.js')
    console.log('   3. Teste: npm run dev')
  } else {
    console.log('❌ O .env.local ainda tem valores de exemplo!')
    console.log('')
    console.log('📝 Você precisa editar o arquivo .env.local e substituir:')
    console.log('   - https://seu-projeto.supabase.co → sua URL real')
    console.log('   - sua_chave_anonima_aqui → sua chave anon real')
    console.log('   - sua_chave_service_role_aqui → sua chave service_role real')
    console.log('')
    console.log('🔗 Obtenha essas informações em: https://supabase.com/dashboard/project/[SEU-PROJETO]/settings/api')
  }
} else {
  console.log('❌ Arquivo .env.local não encontrado!')
  console.log('')
  console.log('📝 Crie o arquivo .env.local na raiz do projeto com:')
  console.log('')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_real')
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_real')
  console.log('DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres')
}

console.log('')
console.log('🎯 Após configurar o .env.local, execute:')
console.log('   node scripts/setup-supabase-database.js') 