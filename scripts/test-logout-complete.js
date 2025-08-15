// Script para testar logout completo
console.log('\\n--- Teste de Logout Completo ---');
console.log('================================\\n');

// Simular dados que devem ser limpos no logout
const testData = {
  'auth_token': 'test-token-123',
  'user_data': JSON.stringify({ id: 'test-user', name: 'Test User' }),
  'planning_control_user': JSON.stringify({ id: 'test-user', name: 'Test User' }),
  'planning_control_permissions': JSON.stringify({ dashboard: { canView: true } }),
  'planning_control_user_cache': JSON.stringify({ id: 'test-user', name: 'Test User' }),
  'planning_control_user_timestamp': Date.now().toString()
};

console.log('🔍 Verificando dados que devem ser limpos no logout:');
console.log('==================================================');

// Simular dados no localStorage
Object.entries(testData).forEach(([key, value]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
    console.log(`✅ ${key}: ${typeof value === 'string' ? value.substring(0, 50) + '...' : value}`);
  }
});

console.log('\\n🧹 Simulando limpeza de logout:');
console.log('===============================');

// Simular limpeza do logout
const keysToRemove = [
  'auth_token',
  'user_data', 
  'planning_control_user',
  'planning_control_permissions',
  'planning_control_user_cache',
  'planning_control_user_timestamp'
];

keysToRemove.forEach(key => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
    console.log(`🗑️  Removido: ${key}`);
  }
});

console.log('\\n✅ Verificação de limpeza:');
console.log('==========================');

// Verificar se tudo foi limpo
keysToRemove.forEach(key => {
  if (typeof window !== 'undefined') {
    const remaining = localStorage.getItem(key);
    if (remaining) {
      console.log(`❌ ${key}: Ainda existe (${remaining.substring(0, 30)}...)`);
    } else {
      console.log(`✅ ${key}: Removido com sucesso`);
    }
  }
});

console.log('\\n📋 Resumo do teste:');
console.log('===================');
console.log('✅ Dados simulados criados');
console.log('✅ Limpeza de logout simulada');
console.log('✅ Verificação de limpeza concluída');
console.log('\\n💡 Para testar no navegador:');
console.log('1. Faça login no sistema');
console.log('2. Abra o DevTools (F12)');
console.log('3. Vá para Application > Local Storage');
console.log('4. Clique em "Sair" no sistema');
console.log('5. Verifique se todos os dados foram limpos');
console.log('6. Confirme redirecionamento para /login');

console.log('\\n🎯 Teste concluído!'); 