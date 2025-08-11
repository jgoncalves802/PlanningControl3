// Script para limpar cache do usuário no localStorage
console.log('🧹 Limpando cache do usuário...');

// Verificar se estamos no navegador
if (typeof window !== 'undefined') {
  // Limpar cache do usuário
  localStorage.removeItem('planning_control_user_cache');
  localStorage.removeItem('planning_control_user_timestamp');
  
  // Limpar outros caches relacionados
  localStorage.removeItem('planning_control_permissions_cache');
  localStorage.removeItem('planning_control_user_data');
  
  console.log('✅ Cache do usuário limpo com sucesso!');
  console.log('🔄 Recarregue a página para aplicar as mudanças.');
} else {
  console.log('❌ Este script deve ser executado no navegador');
  console.log('📝 Para limpar o cache manualmente:');
  console.log('   1. Abra o DevTools (F12)');
  console.log('   2. Vá para a aba Application/Storage');
  console.log('   3. Encontre Local Storage');
  console.log('   4. Remova as chaves:');
  console.log('      - planning_control_user_cache');
  console.log('      - planning_control_user_timestamp');
  console.log('      - planning_control_permissions_cache');
  console.log('      - planning_control_user_data');
} 