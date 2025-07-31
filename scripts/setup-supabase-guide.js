// Guia para configurar Supabase
console.log('🔧 Guia para Configurar Supabase');
console.log('==================================');
console.log('');

console.log('📋 1. Criar Projeto no Supabase:');
console.log('   1. Acesse: https://supabase.com');
console.log('   2. Faça login ou crie uma conta');
console.log('   3. Clique em "New Project"');
console.log('   4. Escolha sua organização');
console.log('   5. Digite um nome para o projeto (ex: planningcontrol)');
console.log('   6. Digite uma senha para o banco de dados');
console.log('   7. Escolha uma região próxima');
console.log('   8. Clique em "Create new project"');
console.log('   9. Aguarde a criação (pode levar alguns minutos)');
console.log('');

console.log('🔑 2. Obter Credenciais:');
console.log('   1. No dashboard do projeto, vá em "Settings" > "API"');
console.log('   2. Anote as seguintes informações:');
console.log('      - Project URL (ex: https://abc123.supabase.co)');
console.log('      - anon public key (ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)');
console.log('      - service_role secret key (ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)');
console.log('');

console.log('⚙️  3. Configurar Variáveis de Ambiente:');
console.log('   1. Crie um arquivo .env.local na raiz do projeto');
console.log('   2. Adicione as seguintes linhas:');
console.log('');
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima');
console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role');
console.log('');
console.log('   3. Substitua pelos valores reais do seu projeto');
console.log('');

console.log('🔄 4. Executar Scripts:');
console.log('   1. Verificar configuração:');
console.log('      node scripts/check-supabase-config.js');
console.log('');
console.log('   2. Criar super admins no banco e Supabase:');
console.log('      node scripts/create-super-admin.js');
console.log('');
console.log('   3. Testar autenticação:');
console.log('      node scripts/test-authentication.js');
console.log('');

console.log('🎯 5. Benefícios da Configuração:');
console.log('   ✅ Autenticação real e segura');
console.log('   ✅ Sincronização automática de usuários');
console.log('   ✅ Recuperação de senha');
console.log('   ✅ Autenticação de dois fatores');
console.log('   ✅ Logs de auditoria');
console.log('   ✅ Sessões persistentes');
console.log('');

console.log('⚠️  Nota:');
console.log('   - Sem configuração do Supabase, o sistema funciona em modo local');
console.log('   - As credenciais mock continuam funcionando');
console.log('   - A configuração do Supabase é opcional para desenvolvimento');
console.log('');

console.log('🚀 Próximos passos:');
console.log('   1. Configure o Supabase seguindo este guia');
console.log('   2. Execute os scripts de teste');
console.log('   3. Teste o login: http://localhost:3000/login');
console.log('   4. Use as credenciais dos super admins'); 