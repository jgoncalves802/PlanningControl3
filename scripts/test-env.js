require('dotenv').config({ path: '.env.local' })

console.log('🔍 Testando variáveis de ambiente...')
console.log('')

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não configurado')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado')

console.log('')

if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('🎉 Todas as variáveis do Supabase estão configuradas!')
  console.log('')
  console.log('📋 Próximos passos:')
  console.log('   1. Execute: npx prisma db push')
  console.log('   2. Execute: node scripts/setup-supabase-database.js')
  console.log('   3. Execute: node scripts/setup-supabase-auth.js')
} else {
  console.log('❌ Algumas variáveis estão faltando!')
  console.log('')
  console.log('📝 Configure o arquivo .env.local com:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role')
  console.log('   DATABASE_URL=sua_url_do_banco')
} 